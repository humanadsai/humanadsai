// AI Advertiser Application Endpoints
//
// GET  /missions/:id/applications     - List applications for a mission
// POST /applications/:id/select       - Select (adopt) an applicant
// POST /applications/:id/reject       - Reject an applicant

import type { Env } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { success, error, errors } from '../../utils/response';
import { createNotificationWithEmail } from '../../services/email-notifications';

// Helper: verify application belongs to this advertiser's deal
async function getApplicationWithOwnership(
  env: Env,
  applicationId: string,
  advertiserId: string,
  requestId: string
): Promise<{ application: any; error?: Response }> {
  const application = await env.DB
    .prepare(`
      SELECT a.*, d.agent_id, d.id as deal_id, d.slots_total, d.slots_selected,
             d.max_participants, d.current_participants, d.status as deal_status
      FROM applications a
      JOIN deals d ON a.deal_id = d.id
      WHERE a.id = ?
    `)
    .bind(applicationId)
    .first();

  if (!application) {
    return { application: null, error: errors.notFound(requestId, 'Application not found') };
  }

  if ((application as any).agent_id !== advertiserId) {
    return {
      application: null,
      error: error('NOT_YOUR_APPLICATION', 'Application belongs to another advertiser', requestId, 403)
    };
  }

  return { application };
}

/**
 * List applications for a mission
 *
 * GET /api/v1/missions/:dealId/applications
 *
 * Query parameters:
 *   status - Filter by status: applied, shortlisted, selected, rejected, cancelled
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
           a.applied_at, a.shortlisted_at, a.selected_at, a.rejected_at, a.cancelled_at,
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

  // Get total count and status breakdown
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

  // Status breakdown (always show full picture)
  const statusCounts = await env.DB
    .prepare(`
      SELECT status, COUNT(*) as cnt FROM applications WHERE deal_id = ? GROUP BY status
    `)
    .bind(dealId)
    .all<{ status: string; cnt: number }>();

  const statusBreakdown: Record<string, number> = {};
  for (const row of statusCounts.results || []) {
    statusBreakdown[row.status] = row.cnt;
  }

  // Also include submission counts for context
  const submissionCounts = await env.DB
    .prepare(`
      SELECT status, COUNT(*) as cnt FROM missions WHERE deal_id = ? GROUP BY status
    `)
    .bind(dealId)
    .all<{ status: string; cnt: number }>();

  const submissionBreakdown: Record<string, number> = {};
  for (const row of submissionCounts.results || []) {
    submissionBreakdown[row.status] = row.cnt;
  }

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
    cancelled_at: a.cancelled_at || null
  }));

  return success({
    applications,
    total: total?.cnt || 0,
    has_more: (offset + limit) < (total?.cnt || 0),
    status_counts: statusBreakdown,
    submission_status_counts: submissionBreakdown
  }, requestId);
}

/**
 * Select (adopt) an application
 *
 * POST /api/v1/applications/:applicationId/select
 *
 * Selects the applicant, creates a mission record, and consumes a slot.
 */
export async function handleSelectApplication(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  applicationId: string
): Promise<Response> {
  const { advertiser, requestId } = context;

  const { application, error: ownershipError } = await getApplicationWithOwnership(
    env, applicationId, advertiser.id, requestId
  );
  if (ownershipError) return ownershipError;

  if (application.deal_status !== 'active') {
    return error('DEAL_NOT_ACTIVE', 'Deal is no longer active', requestId, 400);
  }

  if (!['applied', 'shortlisted'].includes(application.status)) {
    return error(
      'INVALID_STATUS',
      `Cannot select application with status "${application.status}". Must be "applied" or "shortlisted".`,
      requestId,
      400
    );
  }

  // Check slots
  const slotsTotal = application.slots_total ?? application.max_participants;
  const slotsSelected = application.slots_selected ?? application.current_participants;
  if (slotsSelected >= slotsTotal) {
    return error('NO_SLOTS', 'No slots available for this mission', requestId, 409);
  }

  // Check if operator already has a mission for this deal
  const existingMission = await env.DB
    .prepare('SELECT id FROM missions WHERE deal_id = ? AND operator_id = ?')
    .bind(application.deal_id, application.operator_id)
    .first();
  if (existingMission) {
    return error('ALREADY_HAS_MISSION', 'This operator already has a mission for this deal', requestId, 409);
  }

  // Parse optional body
  let aiScore: number | null = null;
  let aiNotes: string | null = null;
  try {
    const body = await request.json() as { ai_score?: number; ai_notes?: string };
    aiScore = body.ai_score ?? null;
    aiNotes = body.ai_notes ?? null;
  } catch { /* Body is optional */ }

  // Create mission and update counts atomically
  const missionId = crypto.randomUUID().replace(/-/g, '');

  const batchResults = await env.DB.batch([
    env.DB.prepare(`
      UPDATE applications SET
        status = 'selected',
        selected_at = datetime('now'),
        ai_score = COALESCE(?, ai_score),
        ai_notes = COALESCE(?, ai_notes),
        updated_at = datetime('now')
      WHERE id = ? AND status IN ('applied', 'shortlisted')
    `).bind(aiScore, aiNotes, applicationId),
    env.DB.prepare(`
      UPDATE deals SET
        slots_selected = COALESCE(slots_selected, current_participants) + 1,
        current_participants = current_participants + 1,
        updated_at = datetime('now')
      WHERE id = ?
        AND COALESCE(slots_selected, current_participants) < COALESCE(slots_total, max_participants)
    `).bind(application.deal_id),
    env.DB.prepare(`
      INSERT INTO missions (id, deal_id, operator_id, status)
      VALUES (?, ?, ?, 'accepted')
    `).bind(missionId, application.deal_id, application.operator_id),
  ]);

  // Verify the deal update succeeded
  const dealUpdateResult = batchResults[1];
  if (!dealUpdateResult.success || (dealUpdateResult.meta?.changes ?? 0) === 0) {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM missions WHERE id = ?').bind(missionId),
      env.DB.prepare(`
        UPDATE applications SET status = 'applied', selected_at = NULL, updated_at = datetime('now') WHERE id = ?
      `).bind(applicationId),
    ]);
    return error('NO_SLOTS', 'No slots available (race condition)', requestId, 409);
  }

  // Notify operator
  const dealForNotif = await env.DB.prepare('SELECT title FROM deals WHERE id = ?')
    .bind(application.deal_id).first<{ title: string }>();
  await createNotificationWithEmail(env.DB, env, {
    recipientId: application.operator_id,
    type: 'application_selected',
    title: 'You\'ve Been Selected!',
    body: `You've been selected for '${dealForNotif?.title || 'a mission'}'! A mission has been created.`,
    referenceType: 'mission',
    referenceId: missionId,
    metadata: { deal_title: dealForNotif?.title, deal_id: application.deal_id, mission_id: missionId },
  });

  return success({
    application_id: applicationId,
    mission_id: missionId,
    status: 'selected',
    message: 'Application selected. The promoter can now post on X and submit their URL.'
  }, requestId, 201);
}

/**
 * Reject an application
 *
 * POST /api/v1/applications/:applicationId/reject
 */
export async function handleRejectApplication(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  applicationId: string
): Promise<Response> {
  const { advertiser, requestId } = context;

  const { application, error: ownershipError } = await getApplicationWithOwnership(
    env, applicationId, advertiser.id, requestId
  );
  if (ownershipError) return ownershipError;

  if (!['applied', 'shortlisted'].includes(application.status)) {
    return error(
      'INVALID_STATUS',
      `Cannot reject application with status "${application.status}". Must be "applied" or "shortlisted".`,
      requestId,
      400
    );
  }

  let reason: string | null = null;
  try {
    const body = await request.json() as { reason?: string };
    reason = body.reason ?? null;
  } catch { /* Body is optional */ }

  await env.DB
    .prepare(`
      UPDATE applications SET
        status = 'rejected',
        rejected_at = datetime('now'),
        ai_notes = COALESCE(?, ai_notes),
        updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(reason, applicationId)
    .run();

  // Notify operator
  const dealForNotif2 = await env.DB.prepare('SELECT title FROM deals WHERE id = ?')
    .bind(application.deal_id).first<{ title: string }>();
  await createNotificationWithEmail(env.DB, env, {
    recipientId: application.operator_id,
    type: 'application_rejected',
    title: 'Application Not Selected',
    body: `Your application for '${dealForNotif2?.title || 'a mission'}' was not selected`,
    referenceType: 'application',
    referenceId: applicationId,
    metadata: { deal_title: dealForNotif2?.title, deal_id: application.deal_id },
  });

  return success({
    application_id: applicationId,
    status: 'rejected',
    message: 'Application rejected'
  }, requestId);
}
