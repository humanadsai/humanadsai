/**
 * Admin Email Dashboard API
 *
 * GET    /api/admin/emails/stats         - Email stats
 * GET    /api/admin/emails/logs          - Paginated email logs
 * GET    /api/admin/emails/suppressions  - Paginated suppressions
 * DELETE /api/admin/emails/suppressions/:email - Remove suppression
 */

import type { Env } from '../../types';
import { success, errors } from '../../utils/response';
import { requireAdmin } from '../../middleware/admin';

/**
 * GET /api/admin/emails/stats
 */
export async function getEmailStats(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;
  const { requestId } = authResult.context!;

  try {
    const [totalEmails, verifiedEmails, suppressedEmails, sentToday, failedToday] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as count FROM operator_emails').first<{ count: number }>(),
      env.DB.prepare('SELECT COUNT(*) as count FROM operator_emails WHERE verified_at IS NOT NULL').first<{ count: number }>(),
      env.DB.prepare('SELECT COUNT(*) as count FROM email_suppressions WHERE suppressed = 1').first<{ count: number }>(),
      env.DB.prepare("SELECT COUNT(*) as count FROM email_logs WHERE created_at >= date('now')").first<{ count: number }>(),
      env.DB.prepare("SELECT COUNT(*) as count FROM email_logs WHERE created_at >= date('now') AND status = 'failed'").first<{ count: number }>(),
    ]);

    const sent = sentToday?.count || 0;
    const failed = failedToday?.count || 0;
    const bounceRate = sent > 0 ? ((failed / sent) * 100).toFixed(1) : '0.0';

    return success({
      total_emails: totalEmails?.count || 0,
      verified_emails: verifiedEmails?.count || 0,
      suppressed_emails: suppressedEmails?.count || 0,
      sent_today: sent,
      failed_today: failed,
      bounce_rate: bounceRate,
    }, requestId);
  } catch (e) {
    console.error('[admin:emails] Stats error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * GET /api/admin/emails/logs
 */
export async function getEmailLogs(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;
  const { requestId } = authResult.context!;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  try {
    const logs = await env.DB.prepare(
      `SELECT id, operator_id, to_email, template, subject, resend_message_id, status, error_message, created_at
       FROM email_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    const total = await env.DB.prepare('SELECT COUNT(*) as count FROM email_logs').first<{ count: number }>();

    return success({
      logs: logs.results || [],
      total: total?.count || 0,
      limit,
      offset,
    }, requestId);
  } catch (e) {
    console.error('[admin:emails] Logs error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * GET /api/admin/emails/suppressions
 */
export async function getEmailSuppressions(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;
  const { requestId } = authResult.context!;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  try {
    const rows = await env.DB.prepare(
      `SELECT email, reason, bounce_count, suppressed, suppressed_at, created_at, updated_at
       FROM email_suppressions WHERE suppressed = 1 ORDER BY suppressed_at DESC LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    const total = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM email_suppressions WHERE suppressed = 1'
    ).first<{ count: number }>();

    return success({
      suppressions: rows.results || [],
      total: total?.count || 0,
      limit,
      offset,
    }, requestId);
  } catch (e) {
    console.error('[admin:emails] Suppressions error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * DELETE /api/admin/emails/suppressions/:email - Remove suppression (admin override)
 */
export async function removeEmailSuppression(request: Request, env: Env, email: string): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;
  const { requestId, operator } = authResult.context!;

  const decodedEmail = decodeURIComponent(email).toLowerCase().trim();

  try {
    await env.DB.prepare(
      'UPDATE email_suppressions SET suppressed = 0, updated_at = datetime(\'now\') WHERE email = ?'
    ).bind(decodedEmail).run();

    // Log admin action
    try {
      await env.DB.prepare(
        `INSERT INTO admin_actions (id, admin_id, admin_handle, action, target_type, target_id, reason, created_at)
         VALUES (?, ?, ?, 'remove_email_suppression', 'email', ?, 'Admin override', datetime('now'))`
      ).bind(
        crypto.randomUUID().replace(/-/g, ''),
        operator.id,
        operator.x_handle || null,
        decodedEmail
      ).run();
    } catch (e) {
      console.error('[admin:emails] Admin action log failed:', e);
    }

    return success({ message: 'Suppression removed', email: decodedEmail }, requestId);
  } catch (e) {
    console.error('[admin:emails] Remove suppression error:', e);
    return errors.internalError(requestId);
  }
}
