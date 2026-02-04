import type { Env, AuditLog } from '../types';

export interface AuditLogEntry {
  requestId: string;
  agentId?: string;
  apiKeyId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint: string;
  method: string;
  signatureValid?: boolean;
  timestampSkewMs?: number;
  nonce?: string;
  bodyHash?: string;
  decision: 'allow' | 'deny';
  denialReason?: string;
  responseStatus?: number;
  metadata?: Record<string, unknown>;
}

/**
 * 監査ログを記録
 */
export async function writeAuditLog(db: D1Database, entry: AuditLogEntry): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO audit_logs (
          id, request_id, agent_id, api_key_id, ip_address, user_agent,
          endpoint, method, signature_valid, timestamp_skew_ms, nonce,
          body_hash, decision, denial_reason, response_status, metadata
        ) VALUES (
          lower(hex(randomblob(16))), ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )`
      )
      .bind(
        entry.requestId,
        entry.agentId || null,
        entry.apiKeyId || null,
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.endpoint,
        entry.method,
        entry.signatureValid !== undefined ? (entry.signatureValid ? 1 : 0) : null,
        entry.timestampSkewMs ?? null,
        entry.nonce || null,
        entry.bodyHash || null,
        entry.decision,
        entry.denialReason || null,
        entry.responseStatus ?? null,
        entry.metadata ? JSON.stringify(entry.metadata) : null
      )
      .run();
  } catch (e) {
    // 監査ログの書き込み失敗はリクエスト処理を止めない
    console.error('Failed to write audit log:', e);
  }
}

/**
 * リクエストから監査ログ用の情報を抽出
 */
export function extractAuditInfo(request: Request): {
  ipAddress: string | null;
  userAgent: string | null;
  endpoint: string;
  method: string;
} {
  const url = new URL(request.url);
  return {
    ipAddress: request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For'),
    userAgent: request.headers.get('User-Agent'),
    endpoint: url.pathname,
    method: request.method,
  };
}

/**
 * 監査ログを取得（管理用）
 */
export async function getAuditLogs(
  db: D1Database,
  options: {
    agentId?: string;
    decision?: 'allow' | 'deny';
    limit?: number;
    offset?: number;
  }
): Promise<AuditLog[]> {
  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params: (string | number)[] = [];

  if (options.agentId) {
    query += ' AND agent_id = ?';
    params.push(options.agentId);
  }

  if (options.decision) {
    query += ' AND decision = ?';
    params.push(options.decision);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(options.limit || 100, options.offset || 0);

  const result = await db.prepare(query).bind(...params).all<AuditLog>();
  return result.results;
}
