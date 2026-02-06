import type { Env } from '../types';
import { errors, generateRequestId } from '../utils/response';
import { writeAuditLog, extractAuditInfo } from '../services/audit';

export type RateLimitType = 'ip' | 'apiKey' | 'deals:create' | 'deals:deposit'
  | 'auth:login' | 'operator:register' | 'operator:verify' | 'account:delete';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
  frozen?: boolean;
}

/**
 * レート制限チェック
 *
 * @param env - 環境バインディング
 * @param key - 制限キー（IPアドレス、APIキーID等）
 * @param type - 制限タイプ
 * @param cost - 消費コスト（デフォルト1）
 */
export async function checkRateLimit(
  env: Env,
  key: string,
  type: RateLimitType,
  cost = 1
): Promise<RateLimitResult> {
  try {
    const rateLimiterId = env.RATE_LIMITER.idFromName('global');
    const rateLimiter = env.RATE_LIMITER.get(rateLimiterId);

    const response = await rateLimiter.fetch('https://rate-limiter/check', {
      method: 'POST',
      body: JSON.stringify({ key, type, cost }),
    });

    return response.json<RateLimitResult>();
  } catch {
    // レート制限チェック失敗時は許可（fail open）
    return { allowed: true, remaining: 0 };
  }
}

/**
 * レート制限を凍結
 */
export async function freezeRateLimit(
  env: Env,
  key: string,
  type: RateLimitType,
  durationMs = 3600000
): Promise<void> {
  try {
    const rateLimiterId = env.RATE_LIMITER.idFromName('global');
    const rateLimiter = env.RATE_LIMITER.get(rateLimiterId);

    await rateLimiter.fetch('https://rate-limiter/freeze', {
      method: 'POST',
      body: JSON.stringify({ key, type, duration: durationMs }),
    });
  } catch {
    console.error('Failed to freeze rate limit');
  }
}

/**
 * IP + APIキー両方のレート制限をチェックするミドルウェア
 */
export async function rateLimitMiddleware(
  request: Request,
  env: Env,
  apiKeyId?: string,
  operationType?: RateLimitType
): Promise<{ allowed: boolean; error?: Response }> {
  const requestId = generateRequestId();
  const auditInfo = extractAuditInfo(request);
  const ip = auditInfo.ipAddress || 'unknown';

  // 1. IP単位のレート制限
  const ipResult = await checkRateLimit(env, ip, 'ip');

  if (!ipResult.allowed) {
    if (ipResult.frozen) {
      await writeAuditLog(env.DB, {
        ...auditInfo,
        requestId,
        decision: 'deny',
        denialReason: 'IP frozen',
      });
    }
    return {
      allowed: false,
      error: errors.rateLimited(requestId, ipResult.retryAfter),
    };
  }

  // 2. APIキー単位のレート制限（認証済みの場合）
  if (apiKeyId) {
    const keyResult = await checkRateLimit(env, apiKeyId, 'apiKey');

    if (!keyResult.allowed) {
      if (keyResult.frozen) {
        // APIキーが凍結されている場合、Agentを一時停止
        await writeAuditLog(env.DB, {
          ...auditInfo,
          requestId,
          apiKeyId,
          decision: 'deny',
          denialReason: 'API key frozen',
        });
      }
      return {
        allowed: false,
        error: errors.rateLimited(requestId, keyResult.retryAfter),
      };
    }
  }

  // 3. 操作タイプ単位のレート制限（高リスク操作）
  if (operationType && apiKeyId) {
    const opResult = await checkRateLimit(env, apiKeyId, operationType);

    if (!opResult.allowed) {
      await writeAuditLog(env.DB, {
        ...auditInfo,
        requestId,
        apiKeyId,
        decision: 'deny',
        denialReason: `Rate limit exceeded for ${operationType}`,
      });
      return {
        allowed: false,
        error: errors.rateLimited(requestId, opResult.retryAfter),
      };
    }
  }

  return { allowed: true };
}

/**
 * 異常検知時の自動凍結
 *
 * 短時間に多くの失敗リクエストがある場合に凍結
 */
export async function detectAndFreezeAnomalous(
  env: Env,
  key: string,
  type: RateLimitType,
  failureCount: number,
  threshold = 10
): Promise<void> {
  if (failureCount >= threshold) {
    await freezeRateLimit(env, key, type);

    // TODO: 管理者にアラート送信（Slack/メール）
    console.warn(`Anomalous activity detected. Frozen: ${type}:${key}`);
  }
}
