/**
 * Operator Notification Endpoints
 *
 * GET  /api/notifications        - List notifications (paginated)
 * GET  /api/notifications/count  - Unread count (for badge polling)
 * POST /api/notifications/:id/read    - Mark single as read
 * POST /api/notifications/read-all    - Mark all as read
 */

import type { Env } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { authenticateOperator } from './register';

/**
 * GET /api/notifications
 *
 * Query params:
 *   is_read - 0 or 1 (optional filter)
 *   limit   - max 50, default 20
 *   offset  - default 0
 */
export async function listNotifications(
  request: Request,
  env: Env
): Promise<Response> {
  const requestId = generateRequestId();
  const auth = await authenticateOperator(request, env);
  if (!auth.success) return auth.error!;

  const operator = auth.operator!;
  const url = new URL(request.url);
  const isRead = url.searchParams.get('is_read');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 50);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  try {
    let query = 'SELECT * FROM notifications WHERE recipient_id = ?';
    const params: (string | number)[] = [operator.id];

    if (isRead === '0' || isRead === '1') {
      query += ' AND is_read = ?';
      params.push(parseInt(isRead, 10));
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await env.DB.prepare(query).bind(...params).all();

    // Total count
    let countQuery = 'SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ?';
    const countParams: (string | number)[] = [operator.id];
    if (isRead === '0' || isRead === '1') {
      countQuery += ' AND is_read = ?';
      countParams.push(parseInt(isRead, 10));
    }
    const total = await env.DB.prepare(countQuery).bind(...countParams).first<{ count: number }>();

    return success(
      {
        notifications: result.results.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          reference_type: n.reference_type,
          reference_id: n.reference_id,
          is_read: !!n.is_read,
          metadata: n.metadata ? JSON.parse(n.metadata) : null,
          created_at: n.created_at,
          read_at: n.read_at,
        })),
        total: total?.count || 0,
        limit,
        offset,
      },
      requestId
    );
  } catch (e) {
    console.error('List notifications error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * GET /api/notifications/count
 *
 * Returns { unread: number }
 */
export async function getNotificationCount(
  request: Request,
  env: Env
): Promise<Response> {
  const requestId = generateRequestId();
  const auth = await authenticateOperator(request, env);
  if (!auth.success) return auth.error!;

  const operator = auth.operator!;

  try {
    const result = await env.DB.prepare(
      'SELECT COUNT(*) as unread FROM notifications WHERE recipient_id = ? AND is_read = 0'
    )
      .bind(operator.id)
      .first<{ unread: number }>();

    return success({ unread: result?.unread || 0 }, requestId);
  } catch (e) {
    console.error('Notification count error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/notifications/:id/read
 */
export async function markNotificationRead(
  request: Request,
  env: Env,
  notificationId: string
): Promise<Response> {
  const requestId = generateRequestId();
  const auth = await authenticateOperator(request, env);
  if (!auth.success) return auth.error!;

  const operator = auth.operator!;

  try {
    await env.DB.prepare(
      `UPDATE notifications SET is_read = 1, read_at = datetime('now') WHERE id = ? AND recipient_id = ?`
    )
      .bind(notificationId, operator.id)
      .run();

    return success({ id: notificationId, is_read: true }, requestId);
  } catch (e) {
    console.error('Mark notification read error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/notifications/read-all
 */
export async function markAllNotificationsRead(
  request: Request,
  env: Env
): Promise<Response> {
  const requestId = generateRequestId();
  const auth = await authenticateOperator(request, env);
  if (!auth.success) return auth.error!;

  const operator = auth.operator!;

  try {
    const result = await env.DB.prepare(
      `UPDATE notifications SET is_read = 1, read_at = datetime('now') WHERE recipient_id = ? AND is_read = 0`
    )
      .bind(operator.id)
      .run();

    return success({ marked_read: result.meta?.changes || 0 }, requestId);
  } catch (e) {
    console.error('Mark all notifications read error:', e);
    return errors.internalError(requestId);
  }
}
