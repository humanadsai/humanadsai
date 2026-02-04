import type { Env, Agent, AgentApiKey, AgentPublicKey, AuthenticatedRequest, ApiScope } from '../types';
import {
  extractSignatureHeaders,
  extractBearerToken,
  buildCanonicalString,
  verifyEd25519Signature,
  hashRequestBody,
  isTimestampValid,
  calculateTimestampSkew,
} from '../services/signature';
import { verifyApiKeyHash } from '../utils/crypto';
import { errors, generateRequestId } from '../utils/response';
import { writeAuditLog, extractAuditInfo } from '../services/audit';

export interface AuthContext {
  agent: Agent;
  apiKey: AgentApiKey;
  publicKey: AgentPublicKey;
  requestId: string;
  timestamp: number;
  nonce: string;
  bodyHash: string;
}

export interface AuthResult {
  success: boolean;
  context?: AuthContext;
  error?: Response;
}

/**
 * Agent API認証ミドルウェア
 *
 * 認証フロー:
 * 1. timestamp 窓チェック (±5分)
 * 2. nonce 未使用チェック (Durable Objects)
 * 3. APIキー存在＆状態 (active)
 * 4. 公開鍵取得
 * 5. 署名検証
 */
export async function authenticateAgent(
  request: Request,
  env: Env,
  requiredScopes: ApiScope[] = []
): Promise<AuthResult> {
  const requestId = generateRequestId();
  const auditInfo = extractAuditInfo(request);

  // ヘッダ抽出
  const headers = extractSignatureHeaders(request);

  // 必須ヘッダチェック
  if (!headers.authorization || !headers.timestamp || !headers.nonce || !headers.signature) {
    await writeAuditLog(env.DB, {
      ...auditInfo,
      requestId,
      decision: 'deny',
      denialReason: 'Missing required headers',
    });
    return {
      success: false,
      error: errors.unauthorized(requestId, 'Missing required authentication headers'),
    };
  }

  // タイムスタンプをパース
  const timestamp = parseInt(headers.timestamp, 10);
  if (isNaN(timestamp)) {
    await writeAuditLog(env.DB, {
      ...auditInfo,
      requestId,
      decision: 'deny',
      denialReason: 'Invalid timestamp format',
    });
    return {
      success: false,
      error: errors.timestampInvalid(requestId),
    };
  }

  // 1. タイムスタンプ窓チェック (±5分)
  const timestampSkew = calculateTimestampSkew(timestamp);
  if (!isTimestampValid(timestamp)) {
    await writeAuditLog(env.DB, {
      ...auditInfo,
      requestId,
      timestampSkewMs: timestampSkew,
      decision: 'deny',
      denialReason: 'Timestamp out of range',
    });
    return {
      success: false,
      error: errors.timestampInvalid(requestId),
    };
  }

  // 2. Nonce未使用チェック (Durable Objects)
  const apiKey = extractBearerToken(headers.authorization);
  if (!apiKey) {
    await writeAuditLog(env.DB, {
      ...auditInfo,
      requestId,
      decision: 'deny',
      denialReason: 'Invalid authorization header',
    });
    return {
      success: false,
      error: errors.unauthorized(requestId, 'Invalid authorization header'),
    };
  }

  // APIキーからagent_idを取得してnonce DOを選択
  const keyRecord = await env.DB.prepare(
    `SELECT ak.*, a.id as agent_id
     FROM agent_api_keys ak
     JOIN agents a ON ak.agent_id = a.id
     WHERE ak.key_prefix = substr(?, 1, 13) || '...'
     AND ak.status = 'active'`
  )
    .bind(apiKey)
    .first<AgentApiKey & { agent_id: string }>();

  // まずキーのプレフィックスでフィルタしてからハッシュ検証
  let foundKey: (AgentApiKey & { agent_id: string }) | null = null;

  if (keyRecord) {
    // ハッシュ検証
    const isValid = await verifyApiKeyHash(apiKey, keyRecord.key_hash);
    if (isValid) {
      foundKey = keyRecord;
    }
  }

  if (!foundKey) {
    // プレフィックスマッチしない場合、全アクティブキーをチェック（非効率だが確実）
    const allKeys = await env.DB.prepare(
      `SELECT ak.*, a.id as agent_id
       FROM agent_api_keys ak
       JOIN agents a ON ak.agent_id = a.id
       WHERE ak.status = 'active'`
    ).all<AgentApiKey & { agent_id: string }>();

    for (const key of allKeys.results) {
      const isValid = await verifyApiKeyHash(apiKey, key.key_hash);
      if (isValid) {
        foundKey = key;
        break;
      }
    }
  }

  if (!foundKey) {
    await writeAuditLog(env.DB, {
      ...auditInfo,
      requestId,
      nonce: headers.nonce,
      decision: 'deny',
      denialReason: 'Invalid API key',
    });
    return {
      success: false,
      error: errors.unauthorized(requestId, 'Invalid API key'),
    };
  }

  // Agent情報を取得
  const agent = await env.DB.prepare('SELECT * FROM agents WHERE id = ?')
    .bind(foundKey.agent_id)
    .first<Agent>();

  if (!agent || agent.status !== 'approved') {
    await writeAuditLog(env.DB, {
      ...auditInfo,
      requestId,
      agentId: foundKey.agent_id,
      apiKeyId: foundKey.id,
      nonce: headers.nonce,
      decision: 'deny',
      denialReason: agent ? `Agent status: ${agent.status}` : 'Agent not found',
    });
    return {
      success: false,
      error: errors.forbidden(requestId, 'Agent not approved'),
    };
  }

  // スコープチェック
  const keyScopes: ApiScope[] = JSON.parse(foundKey.scopes);
  for (const scope of requiredScopes) {
    if (!keyScopes.includes(scope)) {
      await writeAuditLog(env.DB, {
        ...auditInfo,
        requestId,
        agentId: agent.id,
        apiKeyId: foundKey.id,
        nonce: headers.nonce,
        decision: 'deny',
        denialReason: `Missing scope: ${scope}`,
      });
      return {
        success: false,
        error: errors.forbidden(requestId, `Missing required scope: ${scope}`),
      };
    }
  }

  // Nonce DOに問い合わせ
  const nonceStoreId = env.NONCE_STORE.idFromName(agent.id);
  const nonceStore = env.NONCE_STORE.get(nonceStoreId);

  const nonceCheckResponse = await nonceStore.fetch('https://nonce/check', {
    method: 'POST',
    body: JSON.stringify({ nonce: headers.nonce, timestamp }),
  });

  const nonceResult = await nonceCheckResponse.json<{ valid: boolean; reason?: string }>();

  if (!nonceResult.valid) {
    await writeAuditLog(env.DB, {
      ...auditInfo,
      requestId,
      agentId: agent.id,
      apiKeyId: foundKey.id,
      nonce: headers.nonce,
      timestampSkewMs: timestampSkew,
      decision: 'deny',
      denialReason: `Nonce check failed: ${nonceResult.reason}`,
    });

    if (nonceResult.reason === 'nonce_reused') {
      return {
        success: false,
        error: errors.nonceReused(requestId),
      };
    }

    return {
      success: false,
      error: errors.unauthorized(requestId, 'Nonce validation failed'),
    };
  }

  // 4. 公開鍵取得
  const publicKey = await env.DB.prepare(
    `SELECT * FROM agent_public_keys
     WHERE api_key_id = ? AND status = 'active'`
  )
    .bind(foundKey.id)
    .first<AgentPublicKey>();

  if (!publicKey) {
    await writeAuditLog(env.DB, {
      ...auditInfo,
      requestId,
      agentId: agent.id,
      apiKeyId: foundKey.id,
      nonce: headers.nonce,
      timestampSkewMs: timestampSkew,
      decision: 'deny',
      denialReason: 'No public key found',
    });
    return {
      success: false,
      error: errors.unauthorized(requestId, 'No public key registered'),
    };
  }

  // 5. 署名検証
  const url = new URL(request.url);
  const path = url.pathname;
  const bodyText = await request.clone().text();
  const bodyHash = await hashRequestBody(bodyText);

  const canonicalString = buildCanonicalString(
    request.method,
    path,
    headers.timestamp,
    headers.nonce,
    bodyHash
  );

  const signatureValid = await verifyEd25519Signature(
    publicKey.public_key,
    headers.signature,
    canonicalString
  );

  if (!signatureValid) {
    await writeAuditLog(env.DB, {
      ...auditInfo,
      requestId,
      agentId: agent.id,
      apiKeyId: foundKey.id,
      nonce: headers.nonce,
      timestampSkewMs: timestampSkew,
      bodyHash,
      signatureValid: false,
      decision: 'deny',
      denialReason: 'Signature verification failed',
    });
    return {
      success: false,
      error: errors.signatureInvalid(requestId),
    };
  }

  // APIキーの最終使用日時を更新
  await env.DB.prepare(
    `UPDATE agent_api_keys SET last_used_at = datetime('now') WHERE id = ?`
  )
    .bind(foundKey.id)
    .run();

  // 成功
  await writeAuditLog(env.DB, {
    ...auditInfo,
    requestId,
    agentId: agent.id,
    apiKeyId: foundKey.id,
    nonce: headers.nonce,
    timestampSkewMs: timestampSkew,
    bodyHash,
    signatureValid: true,
    decision: 'allow',
  });

  return {
    success: true,
    context: {
      agent,
      apiKey: foundKey,
      publicKey,
      requestId,
      timestamp,
      nonce: headers.nonce,
      bodyHash,
    },
  };
}
