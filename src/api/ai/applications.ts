import type { Env, Application, Mission, AuthContext } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { createNotificationWithEmail } from '../../services/email-notifications';

/**
 * Get applications for a mission (AI Agent)
 *
 * GET /api/ai/missions/:dealId/applications
 *
 * Returns all applications for a deal that the agent owns
 */
export async function getApplicationsForMission(
  request: Request,
  env: Env,
  context: AuthContext,
  dealId: string
): Promise<Response> {
  const { requestId, agent } = context;

  try {
    // Verify the agent owns this deal
    const deal = await env.DB.prepare(
      `SELECT * FROM deals WHERE id = ? AND agent_id = ?`
    )
      .bind(dealId, agent.id)
      .first();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    let query = `
      SELECT a.*, o.x_handle, o.display_name, o.avatar_url,
             o.total_missions_completed, o.total_earnings,
             o.bio as operator_bio
      FROM applications a
      JOIN operators o ON a.operator_id = o.id
      WHERE a.deal_id = ?
    `;
    const params: (string | number)[] = [dealId];

    if (status) {
      const statuses = status.split(',').map((s) => s.trim());
      query += ` AND a.status IN (${statuses.map(() => '?').join(',')})`;
      params.push(...statuses);
    }

    query += ' ORDER BY a.applied_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const applications = await env.DB.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM applications WHERE deal_id = ?`;
    const countParams: (string | number)[] = [dealId];
    if (status) {
      const statuses = status.split(',').map((s) => s.trim());
      countQuery += ` AND status IN (${statuses.map(() => '?').join(',')})`;
      countParams.push(...statuses);
    }
    const totalCount = await env.DB.prepare(countQuery).bind(...countParams).first<{ count: number }>();

    return success(
      {
        applications: applications.results.map((app: Record<string, unknown>) => ({
          id: app.id,
          operator_id: app.operator_id,
          status: app.status,
          proposed_angle: app.proposed_angle,
          estimated_post_time_window: app.estimated_post_time_window,
          draft_copy: app.draft_copy,
          language: app.language,
          audience_fit: app.audience_fit,
          portfolio_links: app.portfolio_links,
          applied_at: app.applied_at,
          shortlisted_at: app.shortlisted_at,
          selected_at: app.selected_at,
          rejected_at: app.rejected_at,
          ai_score: app.ai_score,
          ai_notes: app.ai_notes,
          operator: {
            x_handle: app.x_handle ? app.x_handle.replace(/^@+/, '') : app.x_handle,
            display_name: app.display_name,
            avatar_url: app.avatar_url,
            total_missions_completed: app.total_missions_completed,
            total_earnings: app.total_earnings,
            bio: app.operator_bio,
          },
        })),
        pagination: {
          limit,
          offset,
          total: totalCount?.count || 0,
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get applications for mission error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Shortlist an application (AI Agent)
 *
 * POST /api/applications/:id/shortlist
 *
 * Marks application for consideration (does not consume slot)
 */
export async function shortlistApplication(
  request: Request,
  env: Env,
  context: AuthContext,
  applicationId: string
): Promise<Response> {
  const { requestId, agent } = context;

  try {
    // Get application and verify agent owns the deal
    const application = await env.DB.prepare(
      `SELECT a.*, d.agent_id, d.title as deal_title
       FROM applications a
       JOIN deals d ON a.deal_id = d.id
       WHERE a.id = ?`
    )
      .bind(applicationId)
      .first<Application & { agent_id: string; deal_title: string }>();

    if (!application) {
      return errors.notFound(requestId, 'Application');
    }

    if (application.agent_id !== agent.id) {
      return errors.forbidden(requestId, 'You do not own this deal');
    }

    if (application.status !== 'applied') {
      return errors.invalidRequest(requestId, {
        message: `Cannot shortlist application with status '${application.status}'`,
      });
    }

    // Parse optional AI notes from request body
    let aiScore: number | null = null;
    let aiNotes: string | null = null;
    try {
      const body = await request.json<{ ai_score?: number; ai_notes?: string }>();
      aiScore = body.ai_score ?? null;
      aiNotes = body.ai_notes ?? null;
    } catch {
      // Body is optional
    }

    // Update application
    await env.DB.prepare(
      `UPDATE applications SET
        status = 'shortlisted',
        shortlisted_at = datetime('now'),
        ai_score = COALESCE(?, ai_score),
        ai_notes = COALESCE(?, ai_notes),
        updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(aiScore, aiNotes, applicationId)
      .run();

    // Notify operator
    await createNotificationWithEmail(env.DB, env, {
      recipientId: application.operator_id,
      type: 'application_shortlisted',
      title: 'Application Shortlisted',
      body: `Your application for '${application.deal_title}' has been shortlisted`,
      referenceType: 'application',
      referenceId: applicationId,
      metadata: { deal_title: application.deal_title, deal_id: application.deal_id },
    });

    return success(
      {
        application_id: applicationId,
        status: 'shortlisted',
        message: 'Application shortlisted',
      },
      requestId
    );
  } catch (e) {
    console.error('Shortlist application error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Select an application (AI Agent)
 *
 * POST /api/applications/:id/select
 *
 * CRITICAL: This is where slots are consumed!
 * - Creates a mission for the operator
 * - Increments slots_selected on deal
 * - Updates application status to 'selected'
 */
export async function selectApplication(
  request: Request,
  env: Env,
  context: AuthContext,
  applicationId: string
): Promise<Response> {
  const { requestId, agent } = context;

  try {
    // Get application and deal info
    const application = await env.DB.prepare(
      `SELECT a.*, d.agent_id, d.id as deal_id, d.slots_total, d.slots_selected,
              d.max_participants, d.current_participants, d.status as deal_status, d.title as deal_title
       FROM applications a
       JOIN deals d ON a.deal_id = d.id
       WHERE a.id = ?`
    )
      .bind(applicationId)
      .first<
        Application & {
          agent_id: string;
          deal_id: string;
          slots_total: number | null;
          slots_selected: number | null;
          max_participants: number;
          current_participants: number;
          deal_status: string;
          deal_title: string;
        }
      >();

    if (!application) {
      return errors.notFound(requestId, 'Application');
    }

    if (application.agent_id !== agent.id) {
      return errors.forbidden(requestId, 'You do not own this deal');
    }

    if (application.deal_status !== 'active') {
      return errors.invalidRequest(requestId, {
        message: 'Deal is no longer active',
      });
    }

    if (!['applied', 'shortlisted'].includes(application.status)) {
      return errors.invalidRequest(requestId, {
        message: `Cannot select application with status '${application.status}'`,
      });
    }

    // Check if slots are available
    const slotsTotal = application.slots_total ?? application.max_participants;
    const slotsSelected = application.slots_selected ?? application.current_participants;

    if (slotsSelected >= slotsTotal) {
      return errors.conflict(requestId, 'No slots available');
    }

    // Check if operator already has a mission for this deal
    const existingMission = await env.DB.prepare(
      `SELECT id FROM missions WHERE deal_id = ? AND operator_id = ?`
    )
      .bind(application.deal_id, application.operator_id)
      .first();

    if (existingMission) {
      return errors.conflict(requestId, 'Operator already has a mission for this deal');
    }

    // Parse optional AI notes from request body
    let aiScore: number | null = null;
    let aiNotes: string | null = null;
    try {
      const body = await request.json<{ ai_score?: number; ai_notes?: string }>();
      aiScore = body.ai_score ?? null;
      aiNotes = body.ai_notes ?? null;
    } catch {
      // Body is optional
    }

    // Create mission and update counts atomically
    const missionId = crypto.randomUUID().replace(/-/g, '');

    // Use batch for atomicity
    const batchResults = await env.DB.batch([
      // Update application status
      env.DB.prepare(
        `UPDATE applications SET
          status = 'selected',
          selected_at = datetime('now'),
          ai_score = COALESCE(?, ai_score),
          ai_notes = COALESCE(?, ai_notes),
          updated_at = datetime('now')
         WHERE id = ? AND status IN ('applied', 'shortlisted')`
      ).bind(aiScore, aiNotes, applicationId),
      // Increment slots_selected (with guard against overflow)
      env.DB.prepare(
        `UPDATE deals SET
          slots_selected = COALESCE(slots_selected, current_participants) + 1,
          current_participants = current_participants + 1,
          updated_at = datetime('now')
         WHERE id = ?
         AND COALESCE(slots_selected, current_participants) < COALESCE(slots_total, max_participants)`
      ).bind(application.deal_id),
      // Create mission
      env.DB.prepare(
        `INSERT INTO missions (id, deal_id, operator_id, status)
         VALUES (?, ?, ?, 'accepted')`
      ).bind(missionId, application.deal_id, application.operator_id),
    ]);

    // Verify the deal update succeeded (slot wasn't taken by another request)
    const dealUpdateResult = batchResults[1];
    if (!dealUpdateResult.success || (dealUpdateResult.meta?.changes ?? 0) === 0) {
      // Rollback: delete the mission and revert application status
      await env.DB.batch([
        env.DB.prepare(`DELETE FROM missions WHERE id = ?`).bind(missionId),
        env.DB.prepare(
          `UPDATE applications SET status = 'shortlisted', selected_at = NULL, updated_at = datetime('now') WHERE id = ?`
        ).bind(applicationId),
      ]);
      return errors.conflict(requestId, 'No slots available (race condition)');
    }

    // Notify operator
    await createNotificationWithEmail(env.DB, env, {
      recipientId: application.operator_id,
      type: 'application_selected',
      title: 'You\'ve Been Selected!',
      body: `You've been selected for '${application.deal_title}'! A mission has been created.`,
      referenceType: 'mission',
      referenceId: missionId,
      metadata: { deal_title: application.deal_title, deal_id: application.deal_id, mission_id: missionId },
    });

    return success(
      {
        application_id: applicationId,
        mission_id: missionId,
        status: 'selected',
        message: 'Application selected and mission created',
      },
      requestId,
      201
    );
  } catch (e) {
    console.error('Select application error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Reject an application (AI Agent)
 *
 * POST /api/applications/:id/reject
 *
 * Rejects an application (does not affect slots)
 */
export async function rejectApplication(
  request: Request,
  env: Env,
  context: AuthContext,
  applicationId: string
): Promise<Response> {
  const { requestId, agent } = context;

  try {
    // Get application and verify agent owns the deal
    const application = await env.DB.prepare(
      `SELECT a.*, d.agent_id, d.title as deal_title
       FROM applications a
       JOIN deals d ON a.deal_id = d.id
       WHERE a.id = ?`
    )
      .bind(applicationId)
      .first<Application & { agent_id: string; deal_title: string }>();

    if (!application) {
      return errors.notFound(requestId, 'Application');
    }

    if (application.agent_id !== agent.id) {
      return errors.forbidden(requestId, 'You do not own this deal');
    }

    if (!['applied', 'shortlisted'].includes(application.status)) {
      return errors.invalidRequest(requestId, {
        message: `Cannot reject application with status '${application.status}'`,
      });
    }

    // Parse optional rejection reason
    let aiNotes: string | null = null;
    try {
      const body = await request.json<{ ai_notes?: string; reason?: string }>();
      aiNotes = body.ai_notes || body.reason || null;
    } catch {
      // Body is optional
    }

    // Update application
    await env.DB.prepare(
      `UPDATE applications SET
        status = 'rejected',
        rejected_at = datetime('now'),
        ai_notes = COALESCE(?, ai_notes),
        updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(aiNotes, applicationId)
      .run();

    // Notify operator
    await createNotificationWithEmail(env.DB, env, {
      recipientId: application.operator_id,
      type: 'application_rejected',
      title: 'Application Not Selected',
      body: `Your application for '${application.deal_title}' was not selected`,
      referenceType: 'application',
      referenceId: applicationId,
      metadata: { deal_title: application.deal_title, deal_id: application.deal_id },
    });

    return success(
      {
        application_id: applicationId,
        status: 'rejected',
        message: 'Application rejected',
      },
      requestId
    );
  } catch (e) {
    console.error('Reject application error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Bulk update applications (AI Agent)
 *
 * POST /api/ai/missions/:dealId/applications/bulk
 *
 * Allows AI to process multiple applications at once
 */
export async function bulkUpdateApplications(
  request: Request,
  env: Env,
  context: AuthContext,
  dealId: string
): Promise<Response> {
  const { requestId, agent } = context;

  try {
    // Verify the agent owns this deal
    const deal = await env.DB.prepare(
      `SELECT * FROM deals WHERE id = ? AND agent_id = ?`
    )
      .bind(dealId, agent.id)
      .first();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    const body = await request.json<{
      shortlist?: string[];
      select?: string[];
      reject?: string[];
    }>();

    const results: {
      shortlisted: string[];
      selected: string[];
      rejected: string[];
      errors: { id: string; error: string }[];
    } = {
      shortlisted: [],
      selected: [],
      rejected: [],
      errors: [],
    };

    // Process shortlist
    if (body.shortlist?.length) {
      for (const appId of body.shortlist) {
        try {
          const response = await shortlistApplication(request, env, context, appId);
          if (response.status === 200) {
            results.shortlisted.push(appId);
          } else {
            const error = await response.json<{ error?: { message?: string } }>();
            results.errors.push({ id: appId, error: error.error?.message || 'Unknown error' });
          }
        } catch (e) {
          results.errors.push({ id: appId, error: 'Processing failed' });
        }
      }
    }

    // Process select
    if (body.select?.length) {
      for (const appId of body.select) {
        try {
          const response = await selectApplication(request, env, context, appId);
          if (response.status === 201) {
            results.selected.push(appId);
          } else {
            const error = await response.json<{ error?: { message?: string } }>();
            results.errors.push({ id: appId, error: error.error?.message || 'Unknown error' });
          }
        } catch (e) {
          results.errors.push({ id: appId, error: 'Processing failed' });
        }
      }
    }

    // Process reject
    if (body.reject?.length) {
      for (const appId of body.reject) {
        try {
          const response = await rejectApplication(request, env, context, appId);
          if (response.status === 200) {
            results.rejected.push(appId);
          } else {
            const error = await response.json<{ error?: { message?: string } }>();
            results.errors.push({ id: appId, error: error.error?.message || 'Unknown error' });
          }
        } catch (e) {
          results.errors.push({ id: appId, error: 'Processing failed' });
        }
      }
    }

    return success(
      {
        results,
        message: `Processed ${results.shortlisted.length} shortlisted, ${results.selected.length} selected, ${results.rejected.length} rejected`,
      },
      requestId
    );
  } catch (e) {
    console.error('Bulk update applications error:', e);
    return errors.internalError(requestId);
  }
}
