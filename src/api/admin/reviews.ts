import type { Env, Review } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { requireAdmin } from '../../middleware/admin';
import { recalculateReputation } from '../../services/reputation';

/**
 * GET /api/admin/reviews — List reviews with optional filters
 * Query params: ?reported=1&hidden=1&limit=50&offset=0
 */
export async function listAdminReviews(
  request: Request,
  env: Env
): Promise<Response> {
  const adminAuth = await requireAdmin(request, env);
  if (!adminAuth.success) return adminAuth.error!;

  const requestId = adminAuth.context!.requestId;
  const url = new URL(request.url);
  const reported = url.searchParams.get('reported') === '1';
  const hidden = url.searchParams.get('hidden') === '1';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (reported) {
      whereClause += ' AND r.is_reported = 1';
    }
    if (hidden) {
      whereClause += ' AND r.is_hidden = 1';
    }

    const reviews = await env.DB.prepare(
      `SELECT r.*,
              CASE WHEN r.reviewer_type = 'operator' THEN o.display_name ELSE a.name END as reviewer_name,
              CASE WHEN r.reviewee_type = 'operator' THEN o2.display_name ELSE a2.name END as reviewee_name
       FROM reviews r
       LEFT JOIN operators o ON r.reviewer_type = 'operator' AND r.reviewer_id = o.id
       LEFT JOIN agents a ON r.reviewer_type = 'agent' AND r.reviewer_id = a.id
       LEFT JOIN operators o2 ON r.reviewee_type = 'operator' AND r.reviewee_id = o2.id
       LEFT JOIN agents a2 ON r.reviewee_type = 'agent' AND r.reviewee_id = a2.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(...params, limit, offset)
      .all();

    const total = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM reviews r ${whereClause}`
    )
      .bind(...params)
      .first<{ count: number }>();

    return success(
      {
        reviews: reviews.results || [],
        total: total?.count || 0,
        limit,
        offset,
      },
      requestId
    );
  } catch (e: any) {
    console.error('Admin list reviews error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * PUT /api/admin/reviews/:id — Moderate a review (hide/unhide/dismiss report)
 * Body: { "action": "hide" | "unhide" | "dismiss_report" }
 */
export async function moderateReview(
  request: Request,
  env: Env,
  reviewId: string
): Promise<Response> {
  const adminAuth = await requireAdmin(request, env);
  if (!adminAuth.success) return adminAuth.error!;

  const requestId = adminAuth.context!.requestId;
  const adminId = adminAuth.context!.operator.id;

  let body: { action: string };
  try {
    body = await request.json() as { action: string };
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON body');
  }

  const validActions = ['hide', 'unhide', 'dismiss_report'];
  if (!body.action || !validActions.includes(body.action)) {
    return errors.badRequest(requestId, `Action must be one of: ${validActions.join(', ')}`);
  }

  try {
    const review = await env.DB.prepare('SELECT * FROM reviews WHERE id = ?')
      .bind(reviewId)
      .first<Review>();

    if (!review) {
      return errors.notFound(requestId, 'Review');
    }

    if (body.action === 'hide') {
      await env.DB.prepare(
        `UPDATE reviews SET is_hidden = 1, hidden_at = datetime('now'), hidden_by = ?, updated_at = datetime('now') WHERE id = ?`
      )
        .bind(adminId, reviewId)
        .run();

      // Recalculate reputation after hiding
      await recalculateReputation(env.DB, review.reviewee_type, review.reviewee_id);
    } else if (body.action === 'unhide') {
      await env.DB.prepare(
        `UPDATE reviews SET is_hidden = 0, hidden_at = NULL, hidden_by = NULL, updated_at = datetime('now') WHERE id = ?`
      )
        .bind(reviewId)
        .run();

      // Recalculate reputation after unhiding
      await recalculateReputation(env.DB, review.reviewee_type, review.reviewee_id);
    } else if (body.action === 'dismiss_report') {
      await env.DB.prepare(
        `UPDATE reviews SET is_reported = 0, report_reason = NULL, reported_at = NULL, updated_at = datetime('now') WHERE id = ?`
      )
        .bind(reviewId)
        .run();
    }

    return success({ message: `Review ${body.action} successful` }, requestId);
  } catch (e: any) {
    console.error('Admin moderate review error:', e);
    return errors.internalError(requestId);
  }
}
