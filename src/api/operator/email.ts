/**
 * Operator Email CRUD API
 *
 * POST   /api/operator/email       - Add email
 * GET    /api/operator/email       - Get email (masked)
 * DELETE /api/operator/email       - Remove email
 * GET    /api/operator/email/verify - Verify email token
 */

import type { Env } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { sha256Hex, generateSessionToken } from '../../utils/crypto';
import { sendEmailSafe } from '../../services/resend';
import { emailVerificationEmail } from '../../services/email-templates';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
 * POST /api/operator/email - Add email to account
 */
export async function addOperatorEmail(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();
  const operator = await getAuthenticatedOperator(request, env);
  if (!operator) return errors.unauthorized(requestId, 'Not authenticated');

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON');
  }

  const email = body.email?.toLowerCase().trim();
  if (!email || !EMAIL_REGEX.test(email)) {
    return errors.badRequest(requestId, 'Invalid email format');
  }

  // Check if this operator already has an email
  const existing = await env.DB.prepare(
    'SELECT id FROM operator_emails WHERE operator_id = ?'
  ).bind(operator.id).first();
  if (existing) {
    return errors.badRequest(requestId, 'Email already registered. Use change endpoint to update.');
  }

  // Check if email is used by another account - return generic success for enumeration protection
  const emailTaken = await env.DB.prepare(
    'SELECT id FROM operator_emails WHERE email = ?'
  ).bind(email).first();
  if (emailTaken) {
    return success({ message: 'If this email is available, a verification link has been sent.' }, requestId);
  }

  // Create email record
  const emailId = crypto.randomUUID().replace(/-/g, '');
  await env.DB.prepare(
    `INSERT INTO operator_emails (id, operator_id, email, is_primary, created_at, updated_at)
     VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`
  ).bind(emailId, operator.id, email).run();

  // Generate verification token
  const token = generateSessionToken(); // 64-char random
  const tokenHash = await sha256Hex(token);
  const tokenId = crypto.randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await env.DB.prepare(
    `INSERT INTO login_tokens (id, operator_id, email, token_hash, purpose, expires_at, ip_address, user_agent, created_at)
     VALUES (?, ?, ?, ?, 'email_verify', ?, ?, ?, datetime('now'))`
  ).bind(
    tokenId,
    operator.id,
    email,
    tokenHash,
    expiresAt,
    request.headers.get('CF-Connecting-IP') || null,
    request.headers.get('User-Agent')?.substring(0, 256) || null
  ).run();

  // Send verification email
  const verifyUrl = `https://humanadsai.com/api/operator/email/verify?token=${token}`;
  const template = emailVerificationEmail(verifyUrl, 24);
  await sendEmailSafe(env.DB, env, operator.id, {
    to: email,
    subject: template.subject,
    html: template.html,
  }, 'email_verification');

  // Audit log
  try {
    await env.DB.prepare(
      `INSERT INTO email_audit_log (id, operator_id, action, new_value, ip_address, user_agent, created_at)
       VALUES (?, ?, 'email_added', ?, ?, ?, datetime('now'))`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      operator.id,
      email,
      request.headers.get('CF-Connecting-IP') || null,
      request.headers.get('User-Agent')?.substring(0, 256) || null
    ).run();
  } catch (e) {
    console.error('[email] Audit log failed:', e);
  }

  return success({ message: 'If this email is available, a verification link has been sent.' }, requestId);
}

/**
 * GET /api/operator/email - Get operator's email (masked)
 */
export async function getOperatorEmail(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();
  const operator = await getAuthenticatedOperator(request, env);
  if (!operator) return errors.unauthorized(requestId, 'Not authenticated');

  const emailRow = await env.DB.prepare(
    'SELECT email, verified_at FROM operator_emails WHERE operator_id = ? AND is_primary = 1'
  ).bind(operator.id).first<{ email: string; verified_at: string | null }>();

  if (!emailRow) {
    return success({ email: null, verified: false }, requestId);
  }

  return success({
    email: maskEmail(emailRow.email),
    verified: !!emailRow.verified_at,
  }, requestId);
}

/**
 * DELETE /api/operator/email - Remove operator's email
 */
export async function removeOperatorEmail(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();
  const operator = await getAuthenticatedOperator(request, env);
  if (!operator) return errors.unauthorized(requestId, 'Not authenticated');

  const emailRow = await env.DB.prepare(
    'SELECT email FROM operator_emails WHERE operator_id = ?'
  ).bind(operator.id).first<{ email: string }>();

  if (!emailRow) {
    return errors.notFound(requestId, 'No email registered');
  }

  await env.DB.prepare(
    'DELETE FROM operator_emails WHERE operator_id = ?'
  ).bind(operator.id).run();

  // Audit log
  try {
    await env.DB.prepare(
      `INSERT INTO email_audit_log (id, operator_id, action, old_value, ip_address, user_agent, created_at)
       VALUES (?, ?, 'email_removed', ?, ?, ?, datetime('now'))`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      operator.id,
      emailRow.email,
      request.headers.get('CF-Connecting-IP') || null,
      request.headers.get('User-Agent')?.substring(0, 256) || null
    ).run();
  } catch (e) {
    console.error('[email] Audit log failed:', e);
  }

  return success({ message: 'Email removed' }, requestId);
}

/**
 * GET /api/operator/email/verify?token=xxx - Verify email
 */
export async function verifyOperatorEmail(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Missing token', { status: 400, headers: { 'Content-Type': 'text/plain' } });
  }

  const tokenHash = await sha256Hex(token);

  // Atomically consume token
  const tokenRow = await env.DB.prepare(
    `SELECT id, operator_id, email FROM login_tokens
     WHERE token_hash = ? AND purpose = 'email_verify' AND used_at IS NULL AND expires_at > datetime('now')`
  ).bind(tokenHash).first<{ id: string; operator_id: string; email: string }>();

  if (!tokenRow) {
    return Response.redirect('https://humanadsai.com/account?email_verified=expired', 302);
  }

  // Mark used
  await env.DB.prepare(
    `UPDATE login_tokens SET used_at = datetime('now') WHERE id = ? AND used_at IS NULL`
  ).bind(tokenRow.id).run();

  // Set verified_at
  await env.DB.prepare(
    `UPDATE operator_emails SET verified_at = datetime('now'), updated_at = datetime('now')
     WHERE operator_id = ? AND email = ?`
  ).bind(tokenRow.operator_id, tokenRow.email).run();

  // Audit log
  try {
    await env.DB.prepare(
      `INSERT INTO email_audit_log (id, operator_id, action, new_value, ip_address, user_agent, created_at)
       VALUES (?, ?, 'email_verified', ?, ?, ?, datetime('now'))`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      tokenRow.operator_id,
      tokenRow.email,
      request.headers.get('CF-Connecting-IP') || null,
      request.headers.get('User-Agent')?.substring(0, 256) || null
    ).run();
  } catch (e) {
    console.error('[email] Audit log failed:', e);
  }

  return Response.redirect('https://humanadsai.com/account?email_verified=1', 302);
}
