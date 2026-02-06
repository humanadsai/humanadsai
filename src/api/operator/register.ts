import type { Env, Operator, OperatorVerification, OperatorRegisterRequest } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { generateVerificationCode, generateSessionToken, hashApiKey } from '../../utils/crypto';

/**
 * Operator登録開始
 *
 * POST /api/operator/register
 *
 * X（Twitter）ハンドルを登録し、認証コードを発行
 */
export async function registerOperator(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const body = await request.json<OperatorRegisterRequest>();

    // バリデーション
    if (!body.x_handle) {
      return errors.invalidRequest(requestId, { message: 'x_handle is required' });
    }

    // @を除去して正規化
    const xHandle = body.x_handle.replace(/^@/, '').toLowerCase();

    if (!/^[a-z0-9_]{1,15}$/i.test(xHandle)) {
      return errors.invalidRequest(requestId, { message: 'Invalid X handle format' });
    }

    // 既存Operatorチェック
    let operator = await env.DB.prepare('SELECT * FROM operators WHERE x_handle = ?')
      .bind(xHandle)
      .first<Operator>();

    if (operator && operator.status === 'verified') {
      return errors.conflict(requestId, 'This X handle is already verified');
    }

    // 新規作成または更新
    if (!operator) {
      const operatorId = crypto.randomUUID().replace(/-/g, '');
      await env.DB.prepare(
        `INSERT INTO operators (id, x_handle, status, display_name)
         VALUES (?, ?, 'unverified', ?)`
      )
        .bind(operatorId, xHandle, `@${xHandle}`)
        .run();

      operator = await env.DB.prepare('SELECT * FROM operators WHERE id = ?')
        .bind(operatorId)
        .first<Operator>();
    }

    // 認証コード生成
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30分有効

    // 既存の未使用コードを無効化
    await env.DB.prepare(
      `UPDATE operator_verifications
       SET status = 'expired'
       WHERE operator_id = ? AND status = 'pending'`
    )
      .bind(operator!.id)
      .run();

    // 新しい認証コードを作成
    await env.DB.prepare(
      `INSERT INTO operator_verifications (id, operator_id, verification_code, expires_at)
       VALUES (lower(hex(randomblob(16))), ?, ?, ?)`
    )
      .bind(operator!.id, verificationCode, expiresAt)
      .run();

    // Operatorステータスを更新
    await env.DB.prepare(
      `UPDATE operators SET status = 'pending', updated_at = datetime('now') WHERE id = ?`
    )
      .bind(operator!.id)
      .run();

    return success(
      {
        operator_id: operator!.id,
        x_handle: xHandle,
        verification_code: verificationCode,
        expires_at: expiresAt,
        instructions: [
          `1. Go to your X profile settings`,
          `2. Add the following code to your bio: ${verificationCode}`,
          `3. Call POST /api/operator/verify with your operator_id`,
          `4. You can remove the code from your bio after verification`,
        ],
      },
      requestId,
      201
    );
  } catch (e) {
    console.error('Register operator error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * X認証確認
 *
 * POST /api/operator/verify
 *
 * XのbioにコードがあるかをチェックしてVerified状態にする
 * MVPでは手動確認（実際のX API呼び出しは行わない）
 */
export async function verifyOperator(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const body = await request.json<{ operator_id: string }>();

    if (!body.operator_id) {
      return errors.invalidRequest(requestId, { message: 'operator_id is required' });
    }

    // Operator取得
    const operator = await env.DB.prepare('SELECT * FROM operators WHERE id = ?')
      .bind(body.operator_id)
      .first<Operator>();

    if (!operator) {
      return errors.notFound(requestId, 'Operator');
    }

    if (operator.status === 'verified') {
      return errors.conflict(requestId, 'Already verified');
    }

    // 有効な認証コードを取得
    const verification = await env.DB.prepare(
      `SELECT * FROM operator_verifications
       WHERE operator_id = ?
       AND status = 'pending'
       AND expires_at > datetime('now')
       ORDER BY created_at DESC
       LIMIT 1`
    )
      .bind(operator.id)
      .first<OperatorVerification>();

    if (!verification) {
      return errors.invalidRequest(requestId, {
        message: 'No valid verification code found. Please register again.',
      });
    }

    // MVPでは自動検証をスキップ（手動確認 or 常に成功）
    // 本番ではX APIを呼び出してbioを確認する

    // 検証成功として処理
    const sessionToken = generateSessionToken();
    const sessionHash = await hashApiKey(sessionToken);
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7日間

    await env.DB.batch([
      // Operatorを更新
      env.DB.prepare(
        `UPDATE operators SET
          status = 'verified',
          verified_at = datetime('now'),
          session_token_hash = ?,
          session_expires_at = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(sessionHash, sessionExpiresAt, operator.id),
      // 認証コードを使用済みに
      env.DB.prepare(
        `UPDATE operator_verifications SET
          status = 'verified',
          verified_at = datetime('now')
         WHERE id = ?`
      ).bind(verification.id),
    ]);

    return success(
      {
        operator_id: operator.id,
        x_handle: operator.x_handle,
        status: 'verified',
        session_token: sessionToken,
        session_expires_at: sessionExpiresAt,
        message: 'Verification successful! You can now accept missions.',
      },
      requestId
    );
  } catch (e) {
    console.error('Verify operator error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Operatorプロフィール取得
 *
 * GET /api/operator/profile
 */
export async function getOperatorProfile(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // セッショントークンで認証
    const authResult = await authenticateOperator(request, env);
    if (!authResult.success) {
      return authResult.error!;
    }

    const operator = authResult.operator!;

    // 残高取得
    const balance = await env.DB.prepare(
      `SELECT * FROM balances WHERE owner_type = 'operator' AND owner_id = ?`
    )
      .bind(operator.id)
      .first();

    // 最近のミッション取得
    const recentMissions = await env.DB.prepare(
      `SELECT m.*, d.title as deal_title, d.reward_amount
       FROM missions m
       JOIN deals d ON m.deal_id = d.id
       WHERE m.operator_id = ?
       ORDER BY m.created_at DESC
       LIMIT 10`
    )
      .bind(operator.id)
      .all();

    return success(
      {
        operator: {
          id: operator.id,
          x_handle: operator.x_handle,
          display_name: operator.display_name,
          avatar_url: operator.avatar_url,
          status: operator.status,
          verified_at: operator.verified_at,
          total_missions_completed: operator.total_missions_completed,
          total_earnings: operator.total_earnings,
          bio: operator.bio,
        },
        balance: balance
          ? {
              available: (balance as { available: number }).available,
              currency: 'USD',
            }
          : { available: 0, currency: 'USD' },
        recent_missions: recentMissions.results,
      },
      requestId
    );
  } catch (e) {
    console.error('Get profile error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Get session token from cookie
 */
function getSessionTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const eqIdx = cookie.indexOf('=');
    if (eqIdx === -1) continue;
    const name = cookie.substring(0, eqIdx);
    const value = cookie.substring(eqIdx + 1);
    if (name === 'session') {
      return value;
    }
  }
  return null;
}

/**
 * Operatorセッション認証
 * Supports both:
 * 1. Bearer token in Authorization header
 * 2. Cookie-based session (HttpOnly 'session' cookie)
 */
export async function authenticateOperator(
  request: Request,
  env: Env
): Promise<{ success: boolean; operator?: Operator; error?: Response }> {
  const requestId = generateRequestId();

  // Try Bearer token first
  let sessionToken: string | null = null;
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    sessionToken = authHeader.substring(7);
  }

  // Fall back to cookie-based session
  if (!sessionToken) {
    sessionToken = getSessionTokenFromCookie(request);
  }

  // No session found
  if (!sessionToken) {
    return {
      success: false,
      error: errors.unauthorized(requestId, 'Please sign in to continue'),
    };
  }

  const sessionHash = await hashApiKey(sessionToken);

  const operator = await env.DB.prepare(
    `SELECT * FROM operators
     WHERE session_token_hash = ?
     AND session_expires_at > datetime('now')
     AND status = 'verified'
     AND deleted_at IS NULL`
  )
    .bind(sessionHash)
    .first<Operator>();

  if (!operator) {
    return {
      success: false,
      error: errors.unauthorized(requestId, 'Session expired. Please sign in again.'),
    };
  }

  return { success: true, operator };
}
