import type { Env, Deal, Application, ApplyMissionRequest } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { authenticateOperator } from './register';

/**
 * Apply for a mission
 *
 * POST /api/missions/:dealId/apply
 *
 * Creates an application with status 'applied'.
 * Slots are NOT consumed until AI selects the application.
 */
export async function applyForMission(
  request: Request,
  env: Env,
  dealId: string
): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Authenticate
    const authResult = await authenticateOperator(request, env);
    if (!authResult.success) {
      return authResult.error!;
    }

    const operator = authResult.operator!;
    const body = await request.json<ApplyMissionRequest>();

    // Validate required fields
    if (!body.accept_disclosure) {
      return errors.invalidRequest(requestId, {
        message: 'You must accept the disclosure requirement',
      });
    }
    if (!body.accept_no_engagement_buying) {
      return errors.invalidRequest(requestId, {
        message: 'You must confirm no engagement buying',
      });
    }

    // Get deal
    const deal = await env.DB.prepare(
      `SELECT * FROM deals WHERE id = ? AND status = 'active' AND COALESCE(visibility, 'visible') = 'visible'`
    )
      .bind(dealId)
      .first<Deal & { slots_total?: number; slots_selected?: number }>();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    // Check if deal has expired
    if (deal.expires_at && new Date(deal.expires_at) < new Date()) {
      return errors.invalidRequest(requestId, { message: 'Deal has expired' });
    }

    // Check if slots are available (for display purposes, actual slot is consumed on selection)
    const slotsTotal = deal.slots_total ?? deal.max_participants;
    const slotsSelected = deal.slots_selected ?? deal.current_participants;
    if (slotsSelected >= slotsTotal) {
      return errors.invalidRequest(requestId, {
        message: 'All slots have been filled',
      });
    }

    // Check if already applied
    const existing = await env.DB.prepare(
      `SELECT * FROM applications WHERE deal_id = ? AND operator_id = ?`
    )
      .bind(dealId, operator.id)
      .first<Application>();

    if (existing) {
      // Allow re-application if previously withdrawn or cancelled
      if (existing.status === 'withdrawn' || existing.status === 'cancelled') {
        // Check cooldown for cancelled applications
        if (existing.status === 'cancelled' && existing.metadata) {
          try {
            const metadata = JSON.parse(existing.metadata as string);
            if (metadata.cooldown_until) {
              const cooldownUntil = new Date(metadata.cooldown_until);
              const now = new Date();
              if (now < cooldownUntil) {
                const hoursRemaining = Math.ceil((cooldownUntil.getTime() - now.getTime()) / (1000 * 60 * 60));
                return errors.invalidRequest(requestId, {
                  message: `You cannot re-apply to this mission yet. Please wait ${hoursRemaining} more hour${hoursRemaining !== 1 ? 's' : ''}.`,
                  code: 'cooldown_active',
                  cooldown_until: metadata.cooldown_until,
                });
              }
            }
          } catch {
            // Metadata parse error, allow re-application
          }
        }

        await env.DB.prepare(
          `UPDATE applications SET
            status = 'applied',
            proposed_angle = ?,
            estimated_post_time_window = ?,
            draft_copy = ?,
            accept_disclosure = ?,
            accept_no_engagement_buying = ?,
            language = ?,
            audience_fit = ?,
            portfolio_links = ?,
            applied_at = datetime('now'),
            withdrawn_at = NULL,
            metadata = NULL,
            updated_at = datetime('now')
           WHERE id = ?`
        )
          .bind(
            body.proposed_angle || null,
            body.estimated_post_time_window || null,
            body.draft_copy || null,
            body.accept_disclosure ? 1 : 0,
            body.accept_no_engagement_buying ? 1 : 0,
            body.language || null,
            body.audience_fit || null,
            body.portfolio_links || null,
            existing.id
          )
          .run();

        // Increment applications_count
        await env.DB.prepare(
          `UPDATE deals SET applications_count = COALESCE(applications_count, 0) + 1, updated_at = datetime('now') WHERE id = ?`
        )
          .bind(dealId)
          .run();

        return success(
          {
            application_id: existing.id,
            deal_id: dealId,
            status: 'applied',
            message: 'Application re-submitted successfully',
          },
          requestId,
          201
        );
      }

      return errors.conflict(requestId, 'You have already applied for this mission');
    }

    // Create application
    const applicationId = crypto.randomUUID().replace(/-/g, '');

    await env.DB.batch([
      // Create application
      env.DB.prepare(
        `INSERT INTO applications (
          id, deal_id, operator_id, status,
          proposed_angle, estimated_post_time_window, draft_copy,
          accept_disclosure, accept_no_engagement_buying,
          language, audience_fit, portfolio_links
        ) VALUES (?, ?, ?, 'applied', ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        applicationId,
        dealId,
        operator.id,
        body.proposed_angle || null,
        body.estimated_post_time_window || null,
        body.draft_copy || null,
        body.accept_disclosure ? 1 : 0,
        body.accept_no_engagement_buying ? 1 : 0,
        body.language || null,
        body.audience_fit || null,
        body.portfolio_links || null
      ),
      // Increment applications_count on deal
      env.DB.prepare(
        `UPDATE deals SET applications_count = COALESCE(applications_count, 0) + 1, updated_at = datetime('now') WHERE id = ?`
      ).bind(dealId),
    ]);

    return success(
      {
        application_id: applicationId,
        deal_id: dealId,
        status: 'applied',
        message: 'Application submitted successfully. You will be notified when selected.',
      },
      requestId,
      201
    );
  } catch (e) {
    console.error('Apply for mission error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Get my applications
 *
 * GET /api/my/applications
 *
 * Returns all applications for the authenticated operator
 */
export async function getMyApplications(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Authenticate
    const authResult = await authenticateOperator(request, env);
    if (!authResult.success) {
      return authResult.error!;
    }

    const operator = authResult.operator!;

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    let query = `
      SELECT a.*, d.title as deal_title, d.description as deal_description,
             d.requirements, d.reward_amount, d.expires_at as deal_expires_at,
             d.slots_total, d.slots_selected, d.applications_count,
             ag.name as agent_name
      FROM applications a
      JOIN deals d ON a.deal_id = d.id
      JOIN agents ag ON d.agent_id = ag.id
      WHERE a.operator_id = ?
        AND COALESCE(d.visibility, 'visible') = 'visible'
    `;
    const params: (string | number)[] = [operator.id];

    if (status) {
      // Support comma-separated statuses
      const statuses = status.split(',').map((s) => s.trim());
      query += ` AND a.status IN (${statuses.map(() => '?').join(',')})`;
      params.push(...statuses);
    }

    query += ' ORDER BY a.updated_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const applications = await env.DB.prepare(query).bind(...params).all();

    return success(
      {
        applications: applications.results.map((app: Record<string, unknown>) => ({
          id: app.id,
          deal_id: app.deal_id,
          status: app.status,
          proposed_angle: app.proposed_angle,
          estimated_post_time_window: app.estimated_post_time_window,
          draft_copy: app.draft_copy,
          applied_at: app.applied_at,
          shortlisted_at: app.shortlisted_at,
          selected_at: app.selected_at,
          rejected_at: app.rejected_at,
          ai_notes: app.ai_notes,
          deal: {
            title: app.deal_title,
            description: app.deal_description,
            requirements: app.requirements ? JSON.parse(app.requirements as string) : null,
            reward_amount: app.reward_amount,
            expires_at: app.deal_expires_at,
            slots_total: app.slots_total,
            slots_selected: app.slots_selected,
            applications_count: app.applications_count,
            agent_name: app.agent_name,
          },
        })),
        pagination: {
          limit,
          offset,
          total: applications.results.length,
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get my applications error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Withdraw an application
 *
 * POST /api/applications/:id/withdraw
 *
 * Allows operator to withdraw their application before selection
 */
export async function withdrawApplication(
  request: Request,
  env: Env,
  applicationId: string
): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Authenticate
    const authResult = await authenticateOperator(request, env);
    if (!authResult.success) {
      return authResult.error!;
    }

    const operator = authResult.operator!;

    // Get application
    const application = await env.DB.prepare(
      `SELECT * FROM applications WHERE id = ? AND operator_id = ?`
    )
      .bind(applicationId, operator.id)
      .first<Application>();

    if (!application) {
      return errors.notFound(requestId, 'Application');
    }

    // Can only withdraw applied or shortlisted applications
    if (!['applied', 'shortlisted'].includes(application.status)) {
      return errors.invalidRequest(requestId, {
        message: `Cannot withdraw application with status '${application.status}'`,
      });
    }

    // Update application status
    await env.DB.batch([
      env.DB.prepare(
        `UPDATE applications SET
          status = 'withdrawn',
          withdrawn_at = datetime('now'),
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(applicationId),
      // Decrement applications_count on deal
      env.DB.prepare(
        `UPDATE deals SET applications_count = MAX(0, COALESCE(applications_count, 1) - 1), updated_at = datetime('now') WHERE id = ?`
      ).bind(application.deal_id),
    ]);

    return success(
      {
        application_id: applicationId,
        status: 'withdrawn',
        message: 'Application withdrawn successfully',
      },
      requestId
    );
  } catch (e) {
    console.error('Withdraw application error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Get application by ID
 *
 * GET /api/applications/:id
 *
 * Returns detailed application info for the authenticated operator
 */
export async function getApplication(
  request: Request,
  env: Env,
  applicationId: string
): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Authenticate
    const authResult = await authenticateOperator(request, env);
    if (!authResult.success) {
      return authResult.error!;
    }

    const operator = authResult.operator!;

    // Get application with deal info
    const application = await env.DB.prepare(
      `SELECT a.*, d.title as deal_title, d.description as deal_description,
              d.requirements, d.reward_amount, d.expires_at as deal_expires_at,
              d.slots_total, d.slots_selected, d.applications_count,
              ag.name as agent_name,
              m.id as mission_id, m.status as mission_status
       FROM applications a
       JOIN deals d ON a.deal_id = d.id
       JOIN agents ag ON d.agent_id = ag.id
       LEFT JOIN missions m ON m.deal_id = a.deal_id AND m.operator_id = a.operator_id
       WHERE a.id = ? AND a.operator_id = ?`
    )
      .bind(applicationId, operator.id)
      .first<Record<string, unknown>>();

    if (!application) {
      return errors.notFound(requestId, 'Application');
    }

    return success(
      {
        application: {
          id: application.id,
          deal_id: application.deal_id,
          status: application.status,
          proposed_angle: application.proposed_angle,
          estimated_post_time_window: application.estimated_post_time_window,
          draft_copy: application.draft_copy,
          applied_at: application.applied_at,
          shortlisted_at: application.shortlisted_at,
          selected_at: application.selected_at,
          rejected_at: application.rejected_at,
          ai_score: application.ai_score,
          ai_notes: application.ai_notes,
          deal: {
            title: application.deal_title,
            description: application.deal_description,
            requirements: application.requirements
              ? JSON.parse(application.requirements as string)
              : null,
            reward_amount: application.reward_amount,
            expires_at: application.deal_expires_at,
            slots_total: application.slots_total,
            slots_selected: application.slots_selected,
            applications_count: application.applications_count,
            agent_name: application.agent_name,
          },
          mission: application.mission_id
            ? {
                id: application.mission_id,
                status: application.mission_status,
              }
            : null,
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get application error:', e);
    return errors.internalError(requestId);
  }
}
