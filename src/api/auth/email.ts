/**
 * Magic Link Email Login
 *
 * POST /auth/email/login  - Request magic link
 * GET  /auth/email/verify  - Verify magic link token
 */

import type { Env } from '../../types';
import { errors, generateRequestId } from '../../utils/response';
import { sha256Hex, generateSessionToken } from '../../utils/crypto';
import { sendEmailSafe } from '../../services/resend';
import { magicLinkEmail } from '../../services/email-templates';
import { checkRateLimit } from '../../middleware/rate-limit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * POST /auth/email/login - Request a magic link
 * Always returns the same response to prevent email enumeration.
 */
export async function handleEmailLoginRequest(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

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

  // Rate limit per email
  const rateLimitResult = await checkRateLimit(env, email, 'auth:email_login');
  if (!rateLimitResult.allowed) {
    return errors.rateLimited(requestId, rateLimitResult.retryAfter);
  }

  const genericResponse = Response.json(
    { success: true, data: { message: 'If an account with this email exists, a login link has been sent.' }, request_id: requestId },
    { status: 200 }
  );

  // Look up verified email
  const emailRow = await env.DB.prepare(
    `SELECT oe.operator_id FROM operator_emails oe
     WHERE oe.email = ? AND oe.verified_at IS NOT NULL`
  ).bind(email).first<{ operator_id: string }>();

  if (!emailRow) {
    // No verified email found - return same response (enumeration protection)
    return genericResponse;
  }

  // Generate token
  const token = generateSessionToken(); // 64-char random
  const tokenHash = await sha256Hex(token);
  const tokenId = crypto.randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  await env.DB.prepare(
    `INSERT INTO login_tokens (id, operator_id, email, token_hash, purpose, expires_at, ip_address, user_agent, created_at)
     VALUES (?, ?, ?, ?, 'login', ?, ?, ?, datetime('now'))`
  ).bind(
    tokenId,
    emailRow.operator_id,
    email,
    tokenHash,
    expiresAt,
    request.headers.get('CF-Connecting-IP') || null,
    request.headers.get('User-Agent')?.substring(0, 256) || null
  ).run();

  // Send magic link email
  const loginUrl = `https://humanadsai.com/auth/email/verify?token=${token}`;
  const template = magicLinkEmail(loginUrl, 15);
  await sendEmailSafe(env.DB, env, emailRow.operator_id, {
    to: email,
    subject: template.subject,
    html: template.html,
  }, 'magic_link');

  // Audit log
  try {
    await env.DB.prepare(
      `INSERT INTO email_audit_log (id, operator_id, action, new_value, ip_address, user_agent, created_at)
       VALUES (?, ?, 'magic_link_sent', ?, ?, ?, datetime('now'))`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      emailRow.operator_id,
      email,
      request.headers.get('CF-Connecting-IP') || null,
      request.headers.get('User-Agent')?.substring(0, 256) || null
    ).run();
  } catch (e) {
    console.error('[email-auth] Audit log failed:', e);
  }

  return genericResponse;
}

/**
 * GET /auth/email/verify?token=xxx - Verify magic link and create session
 */
export async function handleEmailLoginCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return Response.redirect('https://humanadsai.com/auth/error?message=' + encodeURIComponent('Missing token'), 302);
  }

  const tokenHash = await sha256Hex(token);

  // Look up and atomically consume token
  const tokenRow = await env.DB.prepare(
    `SELECT id, operator_id, email FROM login_tokens
     WHERE token_hash = ? AND purpose = 'login' AND used_at IS NULL AND expires_at > datetime('now')`
  ).bind(tokenHash).first<{ id: string; operator_id: string; email: string }>();

  if (!tokenRow) {
    return Response.redirect('https://humanadsai.com/auth/error?message=' + encodeURIComponent('Login link expired or already used. Please request a new one.'), 302);
  }

  // Mark used (atomic single-use)
  const updateResult = await env.DB.prepare(
    `UPDATE login_tokens SET used_at = datetime('now') WHERE id = ? AND used_at IS NULL`
  ).bind(tokenRow.id).run();

  if (!updateResult.meta.changes || updateResult.meta.changes === 0) {
    return Response.redirect('https://humanadsai.com/auth/error?message=' + encodeURIComponent('Login link already used.'), 302);
  }

  // Create session (same as X OAuth callback)
  const sessionToken = generateSessionToken();
  const sessionTokenHash = await sha256Hex(sessionToken);
  const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await env.DB.prepare(
    `UPDATE operators SET session_token_hash = ?, session_expires_at = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(sessionTokenHash, sessionExpiresAt, tokenRow.operator_id).run();

  // Audit log
  try {
    await env.DB.prepare(
      `INSERT INTO email_audit_log (id, operator_id, action, new_value, ip_address, user_agent, created_at)
       VALUES (?, ?, 'magic_link_used', ?, ?, ?, datetime('now'))`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      tokenRow.operator_id,
      tokenRow.email,
      request.headers.get('CF-Connecting-IP') || null,
      request.headers.get('User-Agent')?.substring(0, 256) || null
    ).run();
  } catch (e) {
    console.error('[email-auth] Audit log failed:', e);
  }

  // Set session cookie and redirect
  const sessionCookie = `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
  const headers = new Headers();
  headers.set('Location', '/missions/my');
  headers.append('Set-Cookie', sessionCookie);

  return new Response(null, { status: 302, headers });
}
