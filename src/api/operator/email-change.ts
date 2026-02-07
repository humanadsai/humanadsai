/**
 * Email Change Flow
 *
 * POST /api/operator/email/change        - Request email change
 * GET  /api/operator/email/change/verify  - Verify new email
 */

import type { Env } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { sha256Hex, generateSessionToken } from '../../utils/crypto';
import { sendEmailSafe } from '../../services/resend';
import { emailChangeNoticeEmail, emailChangeVerifyEmail } from '../../services/email-templates';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHANGE_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const eqIdx = cookie.indexOf('=');
    if (eqIdx === -1) continue;
    if (cookie.substring(0, eqIdx) === 'session') return cookie.substring(eqIdx + 1);
  }
  return null;
}

async function getAuthenticatedOperator(request: Request, env: Env): Promise<{ id: string } | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  const hash = await sha256Hex(token);
  try {
    return await env.DB.prepare(
      `SELECT id FROM operators WHERE session_token_hash = ? AND session_expires_at > datetime('now')`
    ).bind(hash).first<{ id: string }>();
  } catch { return null; }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const visible = local.length <= 2 ? local[0] : local.substring(0, 2);
  return `${visible}***@${domain}`;
}

/**
 * POST /api/operator/email/change - Request email change
 */
export async function requestEmailChange(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();
  const operator = await getAuthenticatedOperator(request, env);
  if (!operator) return errors.unauthorized(requestId, 'Not authenticated');

  let body: { new_email?: string };
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON');
  }

  const newEmail = body.new_email?.toLowerCase().trim();
  if (!newEmail || !EMAIL_REGEX.test(newEmail)) {
    return errors.badRequest(requestId, 'Invalid email format');
  }

  // Must have a current verified email
  const currentEmail = await env.DB.prepare(
    `SELECT email FROM operator_emails WHERE operator_id = ? AND is_primary = 1 AND verified_at IS NOT NULL`
  ).bind(operator.id).first<{ email: string }>();

  if (!currentEmail) {
    return errors.badRequest(requestId, 'No verified email on account. Use add email instead.');
  }

  if (currentEmail.email === newEmail) {
    return errors.badRequest(requestId, 'New email is the same as current email');
  }

  // Check if new email is taken (return generic success for enumeration protection)
  const emailTaken = await env.DB.prepare(
    'SELECT id FROM operator_emails WHERE email = ?'
  ).bind(newEmail).first();
  if (emailTaken) {
    return success({ message: 'If the new email is available, a verification link has been sent.' }, requestId);
  }

  // Generate verification token for new email
  const token = generateSessionToken();
  const tokenHash = await sha256Hex(token);
  const tokenId = crypto.randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + CHANGE_TOKEN_TTL_MS).toISOString();

  await env.DB.prepare(
    `INSERT INTO login_tokens (id, operator_id, email, token_hash, purpose, expires_at, ip_address, user_agent, created_at)
     VALUES (?, ?, ?, ?, 'email_change', ?, ?, ?, datetime('now'))`
  ).bind(
    tokenId,
    operator.id,
    newEmail,
    tokenHash,
    expiresAt,
    request.headers.get('CF-Connecting-IP') || null,
    request.headers.get('User-Agent')?.substring(0, 256) || null
  ).run();

  // Send security notice to OLD email
  const noticeTemplate = emailChangeNoticeEmail(maskEmail(newEmail));
  await sendEmailSafe(env.DB, env, operator.id, {
    to: currentEmail.email,
    subject: noticeTemplate.subject,
    html: noticeTemplate.html,
  }, 'email_change_notice');

  // Send verification to NEW email
  const verifyUrl = `https://humanadsai.com/api/operator/email/change/verify?token=${token}`;
  const verifyTemplate = emailChangeVerifyEmail(verifyUrl, 30);
  await sendEmailSafe(env.DB, env, operator.id, {
    to: newEmail,
    subject: verifyTemplate.subject,
    html: verifyTemplate.html,
  }, 'email_change_verify');

  // Audit log
  try {
    await env.DB.prepare(
      `INSERT INTO email_audit_log (id, operator_id, action, old_value, new_value, ip_address, user_agent, created_at)
       VALUES (?, ?, 'email_change_requested', ?, ?, ?, ?, datetime('now'))`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      operator.id,
      currentEmail.email,
      newEmail,
      request.headers.get('CF-Connecting-IP') || null,
      request.headers.get('User-Agent')?.substring(0, 256) || null
    ).run();
  } catch (e) {
    console.error('[email-change] Audit log failed:', e);
  }

  return success({ message: 'If the new email is available, a verification link has been sent.' }, requestId);
}

/**
 * GET /api/operator/email/change/verify?token=xxx - Verify new email
 */
export async function verifyEmailChange(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Missing token', { status: 400, headers: { 'Content-Type': 'text/plain' } });
  }

  const tokenHash = await sha256Hex(token);

  const tokenRow = await env.DB.prepare(
    `SELECT id, operator_id, email FROM login_tokens
     WHERE token_hash = ? AND purpose = 'email_change' AND used_at IS NULL AND expires_at > datetime('now')`
  ).bind(tokenHash).first<{ id: string; operator_id: string; email: string }>();

  if (!tokenRow) {
    return Response.redirect('https://humanadsai.com/account?email_changed=expired', 302);
  }

  // Mark used
  const updateResult = await env.DB.prepare(
    `UPDATE login_tokens SET used_at = datetime('now') WHERE id = ? AND used_at IS NULL`
  ).bind(tokenRow.id).run();

  if (!updateResult.meta.changes || updateResult.meta.changes === 0) {
    return Response.redirect('https://humanadsai.com/account?email_changed=expired', 302);
  }

  // Update the email record
  await env.DB.prepare(
    `UPDATE operator_emails SET email = ?, verified_at = datetime('now'), updated_at = datetime('now')
     WHERE operator_id = ? AND is_primary = 1`
  ).bind(tokenRow.email, tokenRow.operator_id).run();

  // Audit log
  try {
    await env.DB.prepare(
      `INSERT INTO email_audit_log (id, operator_id, action, new_value, ip_address, user_agent, created_at)
       VALUES (?, ?, 'email_changed', ?, ?, ?, datetime('now'))`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      tokenRow.operator_id,
      tokenRow.email,
      request.headers.get('CF-Connecting-IP') || null,
      request.headers.get('User-Agent')?.substring(0, 256) || null
    ).run();
  } catch (e) {
    console.error('[email-change] Audit log failed:', e);
  }

  return Response.redirect('https://humanadsai.com/account?email_changed=1', 302);
}
