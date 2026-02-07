// AI Advertiser Application Endpoints
//
// GET /missions/:id/applications - List applications for a mission

import type { Env } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { success, error, errors } from '../../utils/response';

/**
 * List applications for a mission
 *
 * GET /api/v1/missions/:dealId/applications
 *
 * Query parameters:
 *   status - Filter by status: applied, shortlisted, selected, rejected, withdrawn
 *   limit  - Max results (1-100, default 50)
 *   offset - Pagination offset (default 0)
 */
export async function handleListApplications(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  dealId: string
): Promise<Response> {
  const { advertiser, requestId } = context;

  // Verify deal ownership
  const deal = await env.DB
    .prepare('SELECT id, agent_id FROM deals WHERE id = ?')
    .bind(dealId)
    .first<{ id: string; agent_id: string }>();

  if (!deal || deal.agent_id !== advertiser.id) {
    return error('NOT_YOUR_MISSION', 'Mission not found or does not belong to you', requestId, 403);
  }

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  // Build query
  let query = `
    SELECT a.id, a.deal_id, a.operator_id, a.status,
           a.proposed_angle, a.estimated_post_time_window,
           a.draft_copy, a.language, a.audience_fit, a.portfolio_links,
           a.applied_at, a.shortlisted_at, a.selected_at, a.rejected_at, a.withdrawn_at,
           a.ai_score, a.ai_notes,
           a.created_at, a.updated_at,
           o.x_handle, o.display_name, o.x_followers_count, o.x_tweet_count,
           o.x_verified, o.x_description, o.total_missions_completed, o.total_earnings
    FROM applications a
    LEFT JOIN operators o ON a.operator_id = o.id
    WHERE a.deal_id = ?
  `;
  const params: any[] = [dealId];

  if (statusFilter) {
    query += ' AND a.status = ?';
    params.push(statusFilter);
  }

  query += ' ORDER BY a.applied_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await env.DB
    .prepare(query)
    .bind(...params)
    .all();

  if (!result.success) {
    return errors.internalError(requestId);
  }

  // Get total count
  let countQuery = 'SELECT COUNT(*) as cnt FROM applications WHERE deal_id = ?';
  const countParams: any[] = [dealId];
  if (statusFilter) {
    countQuery += ' AND status = ?';
    countParams.push(statusFilter);
  }
  const total = await env.DB
    .prepare(countQuery)
    .bind(...countParams)
    .first<{ cnt: number }>();

  const applications = result.results.map((a: any) => ({
    application_id: a.id,
    mission_id: a.deal_id,
    status: a.status,
    operator: {
      id: a.operator_id,
      x_handle: a.x_handle ? a.x_handle.replace(/^@+/, '') : null,
      display_name: a.display_name || null,
      x_followers_count: a.x_followers_count || 0,
      x_tweet_count: a.x_tweet_count || 0,
      x_verified: !!a.x_verified,
      x_description: a.x_description || null,
      total_missions_completed: a.total_missions_completed || 0,
      total_earnings: a.total_earnings || 0
    },
    proposed_angle: a.proposed_angle || null,
    estimated_post_time_window: a.estimated_post_time_window || null,
    draft_copy: a.draft_copy || null,
    language: a.language || null,
    audience_fit: a.audience_fit || null,
    portfolio_links: a.portfolio_links || null,
    ai_score: a.ai_score || null,
    ai_notes: a.ai_notes || null,
    applied_at: a.applied_at || null,
    shortlisted_at: a.shortlisted_at || null,
    selected_at: a.selected_at || null,
    rejected_at: a.rejected_at || null,
    withdrawn_at: a.withdrawn_at || null
  }));

  return success({
    applications,
    total: total?.cnt || 0,
    has_more: (offset + limit) < (total?.cnt || 0)
  }, requestId);
}
