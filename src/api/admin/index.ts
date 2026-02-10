import type {
  Env,
  AdminContext,
  AdminCreateAgentRequest,
  AdminUpdateAgentRequest,
  AdminCreateDealRequest,
  AdminSeedApplicationRequest,
  AdminCreateSubmissionRequest,
  AdminReviewActionRequest,
  AdminPayoutTestRequest,
  AdminDashboardStats,
  Agent,
  Deal,
  Mission,
  Application,
  Operator,
  FeeRecipientConfig,
} from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { requireAdmin } from '../../middleware/admin';
import { getPayoutConfig, generateSimulatedTxHash } from '../../config/payout';
import { createBatchNotifications } from '../../services/notifications';
import {
  getOnchainConfig,
  hasTreasuryKey,
  getHusdBalance,
  getEthBalance,
  checkFaucetCooldown,
  recordTokenOp,
  updateTokenOpStatus,
  transferHusd,
  normalizeAddress,
} from '../../services/onchain';

// Fee recipient addresses
const FEE_RECIPIENTS: FeeRecipientConfig = {
  solana: '5xQeP26JTDyyUCdG7Sq63vyCWgEbATewCj5N2P7H5X8A',
  evm: '0x5acd3371DB99f7D17DFaFD14b522148260862DE8',
};

// ============================================
// Dashboard Stats
// ============================================

export async function getAdminDashboardStats(
  request: Request,
  env: Env
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const [
      agentStats,
      operatorStats,
      dealStats,
      missionStats,
      applicationStats,
      pendingSubmissions,
      pendingPayouts,
    ] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as active FROM agents`).first(),
      env.DB.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified FROM operators`).first(),
      env.DB.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM deals`).first(),
      env.DB.prepare(`SELECT COUNT(*) as total FROM missions`).first(),
      env.DB.prepare(`SELECT COUNT(*) as total FROM applications`).first(),
      env.DB.prepare(`SELECT COUNT(*) as count FROM missions WHERE status = 'submitted'`).first(),
      env.DB.prepare(`SELECT COUNT(*) as count FROM missions WHERE status IN ('verified', 'approved', 'address_unlocked')`).first(),
    ]);

    const stats: AdminDashboardStats = {
      total_agents: (agentStats as { total: number })?.total || 0,
      active_agents: (agentStats as { active: number })?.active || 0,
      total_operators: (operatorStats as { total: number })?.total || 0,
      verified_operators: (operatorStats as { verified: number })?.verified || 0,
      total_deals: (dealStats as { total: number })?.total || 0,
      active_deals: (dealStats as { active: number })?.active || 0,
      total_missions: (missionStats as { total: number })?.total || 0,
      total_applications: (applicationStats as { total: number })?.total || 0,
      pending_submissions: (pendingSubmissions as { count: number })?.count || 0,
      pending_payouts: (pendingPayouts as { count: number })?.count || 0,
    };

    return success({ stats, fee_recipients: FEE_RECIPIENTS }, requestId);
  } catch (e) {
    console.error('Admin dashboard stats error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// Agent Management
// ============================================

export async function listAgents(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = 'SELECT * FROM agents';
    const params: string[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const result = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all<Agent>();

    return success({ agents: result.results, count: result.results.length }, requestId);
  } catch (e) {
    console.error('List agents error:', e);
    return errors.internalError(requestId);
  }
}

export async function getAgent(
  request: Request,
  env: Env,
  agentId: string
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const agent = await env.DB.prepare('SELECT * FROM agents WHERE id = ?')
      .bind(agentId)
      .first<Agent>();

    if (!agent) {
      return errors.notFound(requestId, 'Agent');
    }

    // Get agent's deals count
    const dealsCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM deals WHERE agent_id = ?'
    )
      .bind(agentId)
      .first<{ count: number }>();

    // Get agent's API keys (without hash)
    const apiKeys = await env.DB.prepare(
      'SELECT id, key_prefix, scopes, status, rate_limit_per_min, last_used_at, expires_at, created_at FROM agent_api_keys WHERE agent_id = ?'
    )
      .bind(agentId)
      .all();

    return success({
      agent,
      deals_count: dealsCount?.count || 0,
      api_keys: apiKeys.results,
    }, requestId);
  } catch (e) {
    console.error('Get agent error:', e);
    return errors.internalError(requestId);
  }
}

export async function createAgent(
  request: Request,
  env: Env
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<AdminCreateAgentRequest>();

    if (!body.name || !body.email) {
      return errors.invalidRequest(requestId, { message: 'name and email are required' });
    }

    // Check if email already exists
    const existing = await env.DB.prepare('SELECT id FROM agents WHERE email = ?')
      .bind(body.email)
      .first();

    if (existing) {
      return errors.conflict(requestId, 'An agent with this email already exists');
    }

    const agentId = crypto.randomUUID().replace(/-/g, '');
    const status = body.status || 'approved'; // Admin-created agents are approved by default

    await env.DB.prepare(
      `INSERT INTO agents (id, name, email, description, status) VALUES (?, ?, ?, ?, ?)`
    )
      .bind(agentId, body.name, body.email, body.description || null, status)
      .run();

    const agent = await env.DB.prepare('SELECT * FROM agents WHERE id = ?')
      .bind(agentId)
      .first<Agent>();

    return success({ agent }, requestId, 201);
  } catch (e) {
    console.error('Create agent error:', e);
    return errors.internalError(requestId);
  }
}

export async function updateAgent(
  request: Request,
  env: Env,
  agentId: string
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<AdminUpdateAgentRequest>();

    // Check if agent exists
    const existing = await env.DB.prepare('SELECT * FROM agents WHERE id = ?')
      .bind(agentId)
      .first<Agent>();

    if (!existing) {
      return errors.notFound(requestId, 'Agent');
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      values.push(body.name);
    }
    if (body.email !== undefined) {
      updates.push('email = ?');
      values.push(body.email);
    }
    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description);
    }
    if (body.status !== undefined) {
      updates.push('status = ?');
      values.push(body.status);
    }
    if (body.max_deal_amount !== undefined) {
      updates.push('max_deal_amount = ?');
      values.push(body.max_deal_amount);
    }
    if (body.daily_volume_limit !== undefined) {
      updates.push('daily_volume_limit = ?');
      values.push(body.daily_volume_limit);
    }
    if (body.open_deals_limit !== undefined) {
      updates.push('open_deals_limit = ?');
      values.push(body.open_deals_limit);
    }

    if (updates.length === 0) {
      return errors.invalidRequest(requestId, { message: 'No fields to update' });
    }

    updates.push("updated_at = datetime('now')");
    values.push(agentId);

    await env.DB.prepare(
      `UPDATE agents SET ${updates.join(', ')} WHERE id = ?`
    )
      .bind(...values)
      .run();

    // Sync status to ai_advertisers table
    if (body.status !== undefined) {
      const advStatus = body.status === 'approved' ? 'active' : body.status;
      await env.DB.prepare(
        `UPDATE ai_advertisers SET status = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(advStatus, agentId).run();

      // If suspending, also hide deals
      if (body.status === 'suspended') {
        await env.DB.prepare(
          `UPDATE deals SET visibility = 'hidden', updated_at = datetime('now') WHERE agent_id = ? AND COALESCE(visibility, 'visible') = 'visible'`
        ).bind(agentId).run();
      }
      // If restoring to active, restore deals visibility
      if (body.status === 'active' || body.status === 'approved') {
        await env.DB.prepare(
          `UPDATE deals SET visibility = 'visible', updated_at = datetime('now') WHERE agent_id = ? AND visibility = 'hidden'`
        ).bind(agentId).run();
      }
    }

    const agent = await env.DB.prepare('SELECT * FROM agents WHERE id = ?')
      .bind(agentId)
      .first<Agent>();

    return success({ agent }, requestId);
  } catch (e) {
    console.error('Update agent error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * DELETE /api/admin/agents/:id - Soft-delete (revoke) an agent
 * Also revokes the corresponding ai_advertiser and hides all deals.
 */
export async function deleteAgent(
  request: Request,
  env: Env,
  agentId: string
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const existing = await env.DB.prepare('SELECT * FROM agents WHERE id = ?')
      .bind(agentId)
      .first<Agent>();

    if (!existing) {
      return errors.notFound(requestId, 'Agent');
    }

    // Revoke agent
    await env.DB.prepare(
      `UPDATE agents SET status = 'revoked', updated_at = datetime('now') WHERE id = ?`
    ).bind(agentId).run();

    // Also revoke corresponding ai_advertiser (same id)
    await env.DB.prepare(
      `UPDATE ai_advertisers SET status = 'revoked', updated_at = datetime('now') WHERE id = ?`
    ).bind(agentId).run();

    // Hide all deals belonging to this agent
    await env.DB.prepare(
      `UPDATE deals SET visibility = 'hidden', updated_at = datetime('now') WHERE agent_id = ?`
    ).bind(agentId).run();

    return success({ agent_id: agentId, status: 'revoked', message: 'Agent revoked and all deals hidden' }, requestId);
  } catch (e) {
    console.error('Delete agent error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// Deal Management (Deploy Testing)
// ============================================

export async function listDeals(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const agentId = url.searchParams.get('agent_id');
    const visibility = url.searchParams.get('visibility');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = 'SELECT d.*, a.name as agent_name FROM deals d LEFT JOIN agents a ON d.agent_id = a.id';
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status) {
      conditions.push('d.status = ?');
      params.push(status);
    }
    if (agentId) {
      conditions.push('d.agent_id = ?');
      params.push(agentId);
    }
    if (visibility) {
      conditions.push("COALESCE(d.visibility, 'visible') = ?");
      params.push(visibility);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';

    const result = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();

    return success({ deals: result.results, count: result.results.length }, requestId);
  } catch (e) {
    console.error('List deals error:', e);
    return errors.internalError(requestId);
  }
}

export async function createDeal(
  request: Request,
  env: Env
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<AdminCreateDealRequest>();

    if (!body.agent_id || !body.title || !body.requirements || !body.reward_amount || !body.max_participants) {
      return errors.invalidRequest(requestId, {
        message: 'agent_id, title, requirements, reward_amount, and max_participants are required',
      });
    }

    // Verify agent exists
    const agent = await env.DB.prepare('SELECT * FROM agents WHERE id = ?')
      .bind(body.agent_id)
      .first<Agent>();

    if (!agent) {
      return errors.notFound(requestId, 'Agent');
    }

    const dealId = crypto.randomUUID().replace(/-/g, '');
    const paymentModel = body.payment_model || 'escrow';
    const aufPercentage = body.auf_percentage || 10;

    await env.DB.prepare(
      `INSERT INTO deals (id, agent_id, title, description, requirements, reward_amount, max_participants, status, payment_model, auf_percentage, starts_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)`
    )
      .bind(
        dealId,
        body.agent_id,
        body.title,
        body.description || null,
        JSON.stringify(body.requirements),
        body.reward_amount,
        body.max_participants,
        paymentModel,
        aufPercentage,
        body.starts_at || null,
        body.expires_at || null
      )
      .run();

    const deal = await env.DB.prepare('SELECT * FROM deals WHERE id = ?')
      .bind(dealId)
      .first<Deal>();

    return success({ deal }, requestId, 201);
  } catch (e) {
    console.error('Create deal error:', e);
    return errors.internalError(requestId);
  }
}

export async function updateDealStatus(
  request: Request,
  env: Env,
  dealId: string
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<{ status: string }>();

    if (!body.status) {
      return errors.invalidRequest(requestId, { message: 'status is required' });
    }

    const validStatuses = ['draft', 'funded', 'active', 'completed', 'cancelled', 'expired'];
    if (!validStatuses.includes(body.status)) {
      return errors.invalidRequest(requestId, { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    await env.DB.prepare(
      `UPDATE deals SET status = ?, updated_at = datetime('now') WHERE id = ?`
    )
      .bind(body.status, dealId)
      .run();

    const deal = await env.DB.prepare('SELECT * FROM deals WHERE id = ?')
      .bind(dealId)
      .first<Deal>();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    return success({ deal }, requestId);
  } catch (e) {
    console.error('Update deal status error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// Deal Visibility (Hide / Delete / Restore)
// ============================================

export async function updateDealVisibility(
  request: Request,
  env: Env,
  dealId: string
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId, operator } = authResult.context!;

  try {
    const body = await request.json<{ action: string; reason?: string }>();

    if (!body.action) {
      return errors.invalidRequest(requestId, { message: 'action is required' });
    }

    const validActions = ['hide', 'unhide', 'delete', 'restore'];
    if (!validActions.includes(body.action)) {
      return errors.invalidRequest(requestId, {
        message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
      });
    }

    // Get current deal
    const deal = await env.DB.prepare('SELECT * FROM deals WHERE id = ?')
      .bind(dealId)
      .first<Deal>();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    const currentVisibility = deal.visibility || 'visible';

    // State transition validation
    const transitions: Record<string, { from: string[]; to: string }> = {
      hide: { from: ['visible'], to: 'hidden' },
      unhide: { from: ['hidden'], to: 'visible' },
      delete: { from: ['visible', 'hidden'], to: 'deleted' },
      restore: { from: ['deleted', 'hidden'], to: 'visible' },
    };

    const transition = transitions[body.action];
    if (!transition.from.includes(currentVisibility)) {
      return errors.invalidRequest(requestId, {
        message: `Cannot ${body.action} a deal with visibility '${currentVisibility}'`,
      });
    }

    const newVisibility = transition.to;

    // Count related data for logging
    const [missionCount, applicationCount, paymentCount] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as count FROM missions WHERE deal_id = ?').bind(dealId).first<{ count: number }>(),
      env.DB.prepare('SELECT COUNT(*) as count FROM applications WHERE deal_id = ?').bind(dealId).first<{ count: number }>(),
      env.DB.prepare(
        `SELECT COUNT(*) as count FROM payments WHERE mission_id IN (SELECT id FROM missions WHERE deal_id = ?)`
      ).bind(dealId).first<{ count: number }>(),
    ]);

    const relatedCounts = {
      missions: missionCount?.count || 0,
      applications: applicationCount?.count || 0,
      payments: paymentCount?.count || 0,
    };

    // Update deal visibility
    await env.DB.prepare(
      `UPDATE deals SET
        visibility = ?,
        visibility_changed_at = datetime('now'),
        visibility_changed_by = ?,
        admin_note = COALESCE(?, admin_note),
        updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(newVisibility, operator.x_handle || operator.id, body.reason || null, dealId)
      .run();

    // Log admin action
    await env.DB.prepare(
      `INSERT INTO admin_actions (admin_id, admin_handle, action, target_type, target_id, previous_value, new_value, reason, metadata)
       VALUES (?, ?, ?, 'deal', ?, ?, ?, ?, ?)`
    )
      .bind(
        operator.id,
        operator.x_handle || null,
        body.action,
        dealId,
        currentVisibility,
        newVisibility,
        body.reason || null,
        JSON.stringify({ related: relatedCounts, deal_title: deal.title })
      )
      .run();

    // Notify operators when deal is hidden by admin
    if (body.action === 'hide') {
      const affectedOperators = await env.DB
        .prepare(
          `SELECT DISTINCT m.operator_id FROM missions m WHERE m.deal_id = ?
           UNION
           SELECT DISTINCT a.operator_id FROM applications a WHERE a.deal_id = ? AND a.status IN ('applied', 'shortlisted', 'selected')`
        )
        .bind(dealId, dealId)
        .all<{ operator_id: string }>();

      if (affectedOperators.results && affectedOperators.results.length > 0) {
        await createBatchNotifications(
          env.DB,
          affectedOperators.results.map((op) => ({
            recipientId: op.operator_id,
            type: 'deal_hidden',
            title: 'Mission Suspended',
            body: `Mission '${deal.title}' has been suspended by admin`,
            referenceType: 'deal',
            referenceId: dealId,
            metadata: { deal_title: deal.title },
          }))
        );
      }
    }

    const updated = await env.DB.prepare('SELECT d.*, a.name as agent_name FROM deals d LEFT JOIN agents a ON d.agent_id = a.id WHERE d.id = ?')
      .bind(dealId)
      .first();

    return success({
      deal: updated,
      action: body.action,
      previous_visibility: currentVisibility,
      new_visibility: newVisibility,
      related: relatedCounts,
    }, requestId);
  } catch (e) {
    console.error('Update deal visibility error:', e);
    return errors.internalError(requestId);
  }
}

export async function getAdminActions(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const url = new URL(request.url);
    const targetType = url.searchParams.get('target_type');
    const targetId = url.searchParams.get('target_id');
    const action = url.searchParams.get('action');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = 'SELECT * FROM admin_actions';
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (targetType) {
      conditions.push('target_type = ?');
      params.push(targetType);
    }
    if (targetId) {
      conditions.push('target_id = ?');
      params.push(targetId);
    }
    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const result = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();

    return success({ actions: result.results, count: result.results.length }, requestId);
  } catch (e) {
    console.error('Get admin actions error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// Operator Management
// ============================================

export async function listOperators(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const role = url.searchParams.get('role');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = `SELECT id, x_handle, x_user_id, display_name, x_profile_image_url, status, role, verified_at, total_missions_completed, total_earnings, x_followers_count, created_at FROM operators`;
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const result = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();

    return success({ operators: result.results, count: result.results.length }, requestId);
  } catch (e) {
    console.error('List operators error:', e);
    return errors.internalError(requestId);
  }
}

export async function updateOperatorRole(
  request: Request,
  env: Env,
  operatorId: string
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<{ role: 'user' | 'admin' }>();

    if (!body.role || !['user', 'admin'].includes(body.role)) {
      return errors.invalidRequest(requestId, { message: 'role must be "user" or "admin"' });
    }

    await env.DB.prepare(
      `UPDATE operators SET role = ?, updated_at = datetime('now') WHERE id = ?`
    )
      .bind(body.role, operatorId)
      .run();

    const operator = await env.DB.prepare(
      `SELECT id, x_handle, display_name, status, role FROM operators WHERE id = ?`
    )
      .bind(operatorId)
      .first();

    if (!operator) {
      return errors.notFound(requestId, 'Operator');
    }

    return success({ operator }, requestId);
  } catch (e) {
    console.error('Update operator role error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// Application Management (Seeding)
// ============================================

export async function listApplications(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const url = new URL(request.url);
    const dealId = url.searchParams.get('deal_id');
    const operatorId = url.searchParams.get('operator_id');
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = `SELECT a.*, o.x_handle, o.display_name, d.title as deal_title
                 FROM applications a
                 LEFT JOIN operators o ON a.operator_id = o.id
                 LEFT JOIN deals d ON a.deal_id = d.id`;
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (dealId) {
      conditions.push('a.deal_id = ?');
      params.push(dealId);
    }
    if (operatorId) {
      conditions.push('a.operator_id = ?');
      params.push(operatorId);
    }
    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';

    const result = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();

    return success({ applications: result.results, count: result.results.length }, requestId);
  } catch (e) {
    console.error('List applications error:', e);
    return errors.internalError(requestId);
  }
}

export async function updateApplication(
  request: Request,
  env: Env,
  applicationId: string
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<{ status: string }>();

    if (!body.status) {
      return errors.invalidRequest(requestId, { message: 'status is required' });
    }

    const validStatuses = ['pending', 'shortlisted', 'selected', 'rejected', 'cancelled'];
    if (!validStatuses.includes(body.status)) {
      return errors.invalidRequest(requestId, { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Check if application exists
    const existing = await env.DB.prepare('SELECT * FROM applications WHERE id = ?')
      .bind(applicationId)
      .first<Application>();

    if (!existing) {
      return errors.notFound(requestId, 'Application');
    }

    // Update application
    const selectedAt = body.status === 'selected' ? "datetime('now')" : 'selected_at';
    await env.DB.prepare(
      `UPDATE applications SET
         status = ?,
         selected_at = ${body.status === 'selected' ? "datetime('now')" : 'selected_at'},
         updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(body.status, applicationId)
      .run();

    // If selected, create a mission
    if (body.status === 'selected') {
      const missionId = crypto.randomUUID().replace(/-/g, '');
      await env.DB.prepare(
        `INSERT INTO missions (id, deal_id, operator_id, status) VALUES (?, ?, ?, 'accepted')`
      ).bind(missionId, existing.deal_id, existing.operator_id).run();
    }

    const application = await env.DB.prepare(
      `SELECT a.*, o.x_handle, d.title as deal_title
       FROM applications a
       LEFT JOIN operators o ON a.operator_id = o.id
       LEFT JOIN deals d ON a.deal_id = d.id
       WHERE a.id = ?`
    )
      .bind(applicationId)
      .first();

    return success({ application }, requestId);
  } catch (e) {
    console.error('Update application error:', e);
    return errors.internalError(requestId);
  }
}

export async function seedApplication(
  request: Request,
  env: Env
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<AdminSeedApplicationRequest>();

    if (!body.deal_id || !body.operator_id) {
      return errors.invalidRequest(requestId, { message: 'deal_id and operator_id are required' });
    }

    // Verify deal and operator exist
    const [deal, operator] = await Promise.all([
      env.DB.prepare('SELECT * FROM deals WHERE id = ?').bind(body.deal_id).first<Deal>(),
      env.DB.prepare('SELECT * FROM operators WHERE id = ?').bind(body.operator_id).first<Operator>(),
    ]);

    if (!deal) return errors.notFound(requestId, 'Deal');
    if (!operator) return errors.notFound(requestId, 'Operator');

    // Check if application already exists
    const existing = await env.DB.prepare(
      'SELECT id FROM applications WHERE deal_id = ? AND operator_id = ?'
    )
      .bind(body.deal_id, body.operator_id)
      .first();

    if (existing) {
      return errors.conflict(requestId, 'Application already exists for this deal and operator');
    }

    const applicationId = crypto.randomUUID().replace(/-/g, '');
    const status = body.status || 'applied';

    await env.DB.prepare(
      `INSERT INTO applications (id, deal_id, operator_id, status, proposed_angle, draft_copy, accept_disclosure, accept_no_engagement_buying, applied_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, datetime('now'))`
    )
      .bind(
        applicationId,
        body.deal_id,
        body.operator_id,
        status,
        body.proposed_angle || 'Admin seeded application',
        body.draft_copy || null
      )
      .run();

    const application = await env.DB.prepare('SELECT * FROM applications WHERE id = ?')
      .bind(applicationId)
      .first<Application>();

    return success({ application }, requestId, 201);
  } catch (e) {
    console.error('Seed application error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// Mission Management
// ============================================

export async function listMissions(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const url = new URL(request.url);
    const dealId = url.searchParams.get('deal_id');
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = `SELECT m.*, o.x_handle, o.display_name, d.title as deal_title, d.reward_amount, d.agent_id as deal_agent_id, a.name as agent_name
                 FROM missions m
                 LEFT JOIN operators o ON m.operator_id = o.id
                 LEFT JOIN deals d ON m.deal_id = d.id
                 LEFT JOIN agents a ON d.agent_id = a.id`;
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (dealId) {
      conditions.push('m.deal_id = ?');
      params.push(dealId);
    }
    if (status) {
      // 'paid' filter should include both 'paid' and 'paid_complete'
      if (status === 'paid') {
        conditions.push("m.status IN ('paid', 'paid_complete')");
      } else {
        conditions.push('m.status = ?');
        params.push(status);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';

    const result = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();

    return success({ missions: result.results, count: result.results.length }, requestId);
  } catch (e) {
    console.error('List missions error:', e);
    return errors.internalError(requestId);
  }
}

export async function createSubmission(
  request: Request,
  env: Env
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<AdminCreateSubmissionRequest>();

    if (!body.mission_id || !body.submission_url) {
      return errors.invalidRequest(requestId, { message: 'mission_id and submission_url are required' });
    }

    // Get mission
    const mission = await env.DB.prepare('SELECT * FROM missions WHERE id = ?')
      .bind(body.mission_id)
      .first<Mission>();

    if (!mission) {
      return errors.notFound(requestId, 'Mission');
    }

    // Update mission with submission
    await env.DB.prepare(
      `UPDATE missions SET
         status = 'submitted',
         submission_url = ?,
         submission_content = ?,
         submitted_at = datetime('now'),
         updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(body.submission_url, body.submission_content || null, body.mission_id)
      .run();

    const updated = await env.DB.prepare('SELECT * FROM missions WHERE id = ?')
      .bind(body.mission_id)
      .first<Mission>();

    return success({ mission: updated }, requestId);
  } catch (e) {
    console.error('Create submission error:', e);
    return errors.internalError(requestId);
  }
}

export async function reviewMission(
  request: Request,
  env: Env,
  missionId: string
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<AdminReviewActionRequest>();

    if (!body.action || !['verify', 'reject'].includes(body.action)) {
      return errors.invalidRequest(requestId, { message: 'action must be "verify" or "reject"' });
    }

    // Get mission
    const mission = await env.DB.prepare('SELECT * FROM missions WHERE id = ?')
      .bind(missionId)
      .first<Mission>();

    if (!mission) {
      return errors.notFound(requestId, 'Mission');
    }

    if (mission.status !== 'submitted') {
      return errors.invalidRequest(requestId, { message: 'Mission must be in submitted status to review' });
    }

    const newStatus = body.action === 'verify' ? 'verified' : 'rejected';
    const verifiedAt = body.action === 'verify' ? "datetime('now')" : 'NULL';

    await env.DB.prepare(
      `UPDATE missions SET
         status = ?,
         verified_at = ${body.action === 'verify' ? "datetime('now')" : 'verified_at'},
         verification_result = ?,
         updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(newStatus, body.verification_result || null, missionId)
      .run();

    const updated = await env.DB.prepare('SELECT * FROM missions WHERE id = ?')
      .bind(missionId)
      .first<Mission>();

    return success({ mission: updated }, requestId);
  } catch (e) {
    console.error('Review mission error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// Payout Testing
// ============================================

export async function testPayout(
  request: Request,
  env: Env
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<AdminPayoutTestRequest>();

    if (!body.mission_id || !body.mode) {
      return errors.invalidRequest(requestId, { message: 'mission_id and mode are required' });
    }

    if (!['ledger', 'testnet'].includes(body.mode)) {
      return errors.invalidRequest(requestId, { message: 'mode must be ledger or testnet. Mainnet is disabled until proper safeguards are implemented.' });
    }

    // Get mission with deal info
    const mission = await env.DB.prepare(
      `SELECT m.*, d.reward_amount, d.auf_percentage, d.payment_model
       FROM missions m
       JOIN deals d ON m.deal_id = d.id
       WHERE m.id = ?`
    )
      .bind(body.mission_id)
      .first<Mission & { reward_amount: number; auf_percentage: number; payment_model: string }>();

    if (!mission) {
      return errors.notFound(requestId, 'Mission');
    }

    // Get operator wallet address
    const operator = await env.DB.prepare(
      'SELECT evm_wallet_address, solana_wallet_address FROM operators WHERE id = ?'
    )
      .bind(mission.operator_id)
      .first<{ evm_wallet_address: string | null; solana_wallet_address: string | null }>();

    const chain = 'sepolia';
    const token = body.token || 'USDC';
    const payoutConfig = getPayoutConfig(env);
    const aufAmount = Math.floor(mission.reward_amount * (mission.auf_percentage / 100));
    const payoutAmount = mission.reward_amount - aufAmount;

    // If execute=true, actually send onchain transactions
    if (body.execute && body.mode === 'testnet') {
      if (!hasTreasuryKey(env)) {
        return errors.invalidRequest(requestId, {
          message: 'TREASURY_PRIVATE_KEY is not configured. Cannot execute onchain transactions.',
        });
      }

      if (!operator?.evm_wallet_address) {
        return errors.invalidRequest(requestId, {
          message: 'Operator has no EVM wallet address configured.',
        });
      }

      const txResults: {
        auf_tx?: { success: boolean; txHash?: string; explorerUrl?: string; error?: string };
        payout_tx?: { success: boolean; txHash?: string; explorerUrl?: string; error?: string };
      } = {};

      // 1. AUF fee transfer (treasury → fee recipient)
      if (aufAmount > 0) {
        const aufResult = await transferHusd(env, FEE_RECIPIENTS.evm, aufAmount, { forceOnchain: true });
        txResults.auf_tx = aufResult;

        // Record the token op
        await recordTokenOp(env, {
          opType: 'transfer',
          fromAddress: getOnchainConfig(env).treasuryAddress,
          toAddress: FEE_RECIPIENTS.evm,
          amountCents: aufAmount,
          txHash: aufResult.txHash,
          status: aufResult.success ? 'submitted' : 'failed',
          errorMessage: aufResult.error,
        });
      }

      // 2. Payout transfer (treasury → operator)
      if (payoutAmount > 0) {
        const payoutResult = await transferHusd(env, operator.evm_wallet_address, payoutAmount, { forceOnchain: true });
        txResults.payout_tx = payoutResult;

        // Record the token op
        await recordTokenOp(env, {
          opType: 'transfer',
          fromAddress: getOnchainConfig(env).treasuryAddress,
          toAddress: operator.evm_wallet_address,
          amountCents: payoutAmount,
          txHash: payoutResult.txHash,
          status: payoutResult.success ? 'submitted' : 'failed',
          errorMessage: payoutResult.error,
          operatorId: mission.operator_id,
        });
      }

      // Check results
      const aufSuccess = !txResults.auf_tx || txResults.auf_tx.success;
      const payoutSuccess = !txResults.payout_tx || txResults.payout_tx.success;
      const allSuccess = aufSuccess && payoutSuccess;

      if (allSuccess) {
        await env.DB.prepare(
          "UPDATE missions SET status = 'paid', paid_at = datetime('now') WHERE id = ?"
        ).bind(body.mission_id).run();
      } else if (aufSuccess && !payoutSuccess) {
        // AUF succeeded but payout failed — partial failure
        // Keep mission status as-is (verified) so admin can retry
        return success({
          mode: body.mode,
          chain,
          token,
          execute: true,
          partial_failure: true,
          auf_amount_cents: aufAmount,
          payout_amount_cents: payoutAmount,
          treasury_address: normalizeAddress(getOnchainConfig(env).treasuryAddress),
          operator_address: operator.evm_wallet_address,
          transactions: txResults,
          all_success: false,
          message: 'PARTIAL FAILURE: AUF fee was sent successfully but operator payout failed. Mission status kept as-is. Manual intervention required to retry the payout.',
        }, requestId);
      }

      return success({
        mode: body.mode,
        chain,
        token,
        execute: true,
        auf_amount_cents: aufAmount,
        payout_amount_cents: payoutAmount,
        treasury_address: getOnchainConfig(env).treasuryAddress,
        operator_address: operator.evm_wallet_address,
        transactions: txResults,
        all_success: allSuccess,
        message: allSuccess
          ? `Onchain payout executed successfully on ${chain}`
          : 'Some transactions failed. Check transaction details.',
      }, requestId);
    }

    // Preview mode (execute=false or ledger mode) - return calculation only
    let result: {
      mode: string;
      chain: string;
      token: string;
      execute: boolean;
      auf_amount_cents: number;
      payout_amount_cents: number;
      treasury_address: string;
      operator_address: string | null;
      simulated_auf_tx?: string;
      simulated_payout_tx?: string;
      has_treasury_key: boolean;
      message: string;
    };

    if (body.mode === 'ledger') {
      result = {
        mode: 'ledger',
        chain,
        token,
        execute: false,
        auf_amount_cents: aufAmount,
        payout_amount_cents: payoutAmount,
        treasury_address: normalizeAddress(FEE_RECIPIENTS.evm),
        operator_address: operator?.evm_wallet_address || null,
        simulated_auf_tx: generateSimulatedTxHash(),
        simulated_payout_tx: generateSimulatedTxHash(),
        has_treasury_key: hasTreasuryKey(env),
        message: 'Ledger mode: transactions are simulated, no real funds transferred',
      };
    } else {
      result = {
        mode: 'testnet',
        chain,
        token,
        execute: false,
        auf_amount_cents: aufAmount,
        payout_amount_cents: payoutAmount,
        treasury_address: getOnchainConfig(env).treasuryAddress,
        operator_address: operator?.evm_wallet_address || null,
        has_treasury_key: hasTreasuryKey(env),
        message: hasTreasuryKey(env)
          ? 'Preview: click Execute to send real hUSD on Sepolia testnet'
          : 'TREASURY_PRIVATE_KEY not set. Configure it to execute testnet transactions.',
      };
    }

    return success(result, requestId);
  } catch (e) {
    console.error('Test payout error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// Smoke Test Cleanup
// ============================================

async function cleanupSmokeTest(env: Env): Promise<void> {
  try {
    // Get smoke test advertiser IDs (deals use agent_id = advertiser.id)
    const advRows = await env.DB.prepare(
      "SELECT id FROM ai_advertisers WHERE name LIKE '[SMOKE_TEST]%'"
    ).all<{ id: string }>();
    const advIds = advRows.results?.map(r => r.id) || [];

    for (const advId of advIds) {
      // Get deal IDs for this advertiser
      const dealRows = await env.DB.prepare(
        "SELECT id FROM deals WHERE agent_id = ?"
      ).bind(advId).all<{ id: string }>();
      const dealIds = dealRows.results?.map(r => r.id) || [];

      for (const dealId of dealIds) {
        // Collect operator IDs from missions (test-submission creates operators)
        const opRows = await env.DB.prepare(
          "SELECT DISTINCT operator_id FROM missions WHERE deal_id = ?"
        ).bind(dealId).all<{ operator_id: string }>();
        const opIds = opRows.results?.map(r => r.operator_id) || [];

        // Delete payments linked to missions of this deal
        await env.DB.prepare(
          "DELETE FROM payments WHERE mission_id IN (SELECT id FROM missions WHERE deal_id = ?)"
        ).bind(dealId).run().catch(() => {});

        // Delete reviews linked to missions of this deal
        await env.DB.prepare(
          "DELETE FROM reviews WHERE mission_id IN (SELECT id FROM missions WHERE deal_id = ?)"
        ).bind(dealId).run().catch(() => {});

        // Delete token_operations linked to these operators
        for (const opId of opIds) {
          await env.DB.prepare(
            "DELETE FROM token_operations WHERE operator_id = ?"
          ).bind(opId).run().catch(() => {});
        }

        // Delete missions
        await env.DB.prepare(
          "DELETE FROM missions WHERE deal_id = ?"
        ).bind(dealId).run().catch(() => {});

        // Delete applications
        await env.DB.prepare(
          "DELETE FROM applications WHERE deal_id = ?"
        ).bind(dealId).run().catch(() => {});

        // Delete test operators created by test-submission
        for (const opId of opIds) {
          await env.DB.prepare(
            "DELETE FROM operators WHERE id = ?"
          ).bind(opId).run().catch(() => {});
        }
      }

      // Delete deals
      await env.DB.prepare(
        "DELETE FROM deals WHERE agent_id = ?"
      ).bind(advId).run().catch(() => {});

      // Delete media_assets owned by this advertiser
      await env.DB.prepare(
        "DELETE FROM media_assets WHERE owner_advertiser_id = ?"
      ).bind(advId).run().catch(() => {});
    }

    // Delete advertiser-level tables (must come before advertiser deletion due to FKs)
    for (const advId of advIds) {
      await env.DB.prepare("DELETE FROM advertiser_deposits WHERE advertiser_id = ?").bind(advId).run().catch(() => {});
      await env.DB.prepare("DELETE FROM advertiser_approvals WHERE advertiser_id = ?").bind(advId).run().catch(() => {});
      await env.DB.prepare("DELETE FROM advertiser_permits WHERE advertiser_id = ?").bind(advId).run().catch(() => {});
      await env.DB.prepare("DELETE FROM advertiser_eth_funding WHERE advertiser_id = ?").bind(advId).run().catch(() => {});
      await env.DB.prepare("DELETE FROM agents WHERE id = ?").bind(advId).run().catch(() => {});
    }

    // Delete smoke test advertisers
    await env.DB.prepare(
      "DELETE FROM ai_advertisers WHERE name LIKE '[SMOKE_TEST]%'"
    ).run().catch(() => {});
  } catch (e) {
    console.error('Smoke test cleanup error:', e);
  }
}

// ============================================
// Smoke Test Init / Cleanup (Admin Endpoints)
// ============================================

export async function smokeTestInit(
  request: Request,
  env: Env
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;
  const { requestId } = authResult.context!;

  try {
    // Clean up any leftover smoke test data first
    await cleanupSmokeTest(env);

    // Register via internal request
    const origin = new URL(request.url).origin;
    const regReq = new Request(origin + '/api/v1/advertisers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '[SMOKE_TEST] API Health Check', mode: 'test' }),
    });
    const { handleRequest } = await import('../../router');
    const regRes = await handleRequest(regReq, env);
    const regJson = await regRes.json() as Record<string, unknown>;
    const regData = regJson.data as Record<string, unknown> | undefined;
    const advInfo = regData?.advertiser as Record<string, unknown> | undefined;
    const apiKey = (advInfo?.api_key as string) || '';

    if (!apiKey) {
      return errors.invalidRequest(requestId, 'Register failed: no api_key returned');
    }

    // Activate directly in DB and set Treasury wallet (has hUSD balance for smoke test deposits)
    const prefix = apiKey.substring(0, 17);
    const treasuryAddress = '0x0B9F043D4BcD45B95B72d4D595dEA8a31acdc017';
    await env.DB.prepare("UPDATE ai_advertisers SET status='active', claimed_at=datetime('now'), wallet_address=? WHERE api_key_prefix=?")
      .bind(treasuryAddress, prefix).run();

    return success({ api_key: apiKey }, requestId);
  } catch (e) {
    console.error('Smoke test init error:', e);
    return errors.internalError(requestId);
  }
}

export async function smokeTestCleanupEndpoint(
  request: Request,
  env: Env
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;
  const { requestId } = authResult.context!;

  try {
    await cleanupSmokeTest(env);
    return success({ cleaned: true }, requestId);
  } catch (e) {
    console.error('Smoke test cleanup endpoint error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// Scenario Runner (E2E Testing)
// ============================================

export async function runScenario(
  request: Request,
  env: Env
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<{ scenario: string; params?: Record<string, string> }>();

    if (!body.scenario) {
      return errors.invalidRequest(requestId, { message: 'scenario is required' });
    }

    const scenarios: Record<string, () => Promise<unknown>> = {
      // Full mission lifecycle
      'full-lifecycle': async () => {
        // 1. Create agent (or use existing)
        let agent = await env.DB.prepare("SELECT * FROM agents WHERE status = 'approved' LIMIT 1").first<Agent>();
        if (!agent) {
          const agentId = crypto.randomUUID().replace(/-/g, '');
          await env.DB.prepare(
            "INSERT INTO agents (id, name, email, status) VALUES (?, 'Test Agent', 'test@admin.scenario', 'approved')"
          ).bind(agentId).run();
          agent = await env.DB.prepare('SELECT * FROM agents WHERE id = ?').bind(agentId).first<Agent>();
        }

        // 2. Create deal
        const dealId = crypto.randomUUID().replace(/-/g, '');
        await env.DB.prepare(
          `INSERT INTO deals (id, agent_id, title, description, requirements, reward_amount, max_participants, status, payment_model, auf_percentage)
           VALUES (?, ?, 'Scenario Test Deal', 'Created by admin scenario runner', '{"content_type":"original_post","disclosure":"#ad"}', 1000, 10, 'active', 'escrow', 10)`
        ).bind(dealId, agent!.id).run();

        // 3. Get a verified operator
        let operator = await env.DB.prepare("SELECT * FROM operators WHERE status = 'verified' LIMIT 1").first<Operator>();
        if (!operator) {
          return {
            success: false,
            error: 'No verified operator found. Please create one first.',
            steps_completed: ['agent', 'deal'],
          };
        }

        // 4. Create application
        const appId = crypto.randomUUID().replace(/-/g, '');
        await env.DB.prepare(
          `INSERT INTO applications (id, deal_id, operator_id, status, proposed_angle, accept_disclosure, accept_no_engagement_buying, applied_at)
           VALUES (?, ?, ?, 'applied', 'Scenario test application', 1, 1, datetime('now'))`
        ).bind(appId, dealId, operator.id).run();

        // 5. Select application (creates mission)
        await env.DB.prepare(
          "UPDATE applications SET status = 'selected', selected_at = datetime('now') WHERE id = ?"
        ).bind(appId).run();

        const missionId = crypto.randomUUID().replace(/-/g, '');
        await env.DB.prepare(
          `INSERT INTO missions (id, deal_id, operator_id, status) VALUES (?, ?, ?, 'accepted')`
        ).bind(missionId, dealId, operator.id).run();

        return {
          success: true,
          scenario: 'full-lifecycle',
          created: {
            agent_id: agent!.id,
            deal_id: dealId,
            operator_id: operator.id,
            application_id: appId,
            mission_id: missionId,
          },
          message: 'Full lifecycle created. Mission is ready for submission testing.',
        };
      },

      // Full lifecycle with real onchain payout (testnet)
      'full-lifecycle-onchain': async () => {
        // Check prerequisites
        if (!hasTreasuryKey(env)) {
          return {
            success: false,
            error: 'TREASURY_PRIVATE_KEY is not configured. Cannot execute onchain payout.',
          };
        }

        // 1. Run the standard full-lifecycle to create all entities
        const lifecycleResult = await scenarios['full-lifecycle']() as {
          success: boolean;
          error?: string;
          created?: { agent_id: string; deal_id: string; operator_id: string; application_id: string; mission_id: string };
        };

        if (!lifecycleResult.success || !lifecycleResult.created) {
          return {
            success: false,
            error: lifecycleResult.error || 'Failed to create lifecycle entities',
            scenario: 'full-lifecycle-onchain',
          };
        }

        const { mission_id, deal_id, operator_id } = lifecycleResult.created;

        // 2. Submit the mission
        await env.DB.prepare(
          "UPDATE missions SET status = 'submitted', submission_url = 'https://x.com/test/status/scenario123', submitted_at = datetime('now') WHERE id = ?"
        ).bind(mission_id).run();

        // 3. Verify the mission
        await env.DB.prepare(
          "UPDATE missions SET status = 'verified', verified_at = datetime('now') WHERE id = ?"
        ).bind(mission_id).run();

        // 4. Execute onchain payout
        const deal = await env.DB.prepare(
          'SELECT reward_amount, auf_percentage FROM deals WHERE id = ?'
        ).bind(deal_id).first<{ reward_amount: number; auf_percentage: number }>();

        const operator = await env.DB.prepare(
          'SELECT evm_wallet_address FROM operators WHERE id = ?'
        ).bind(operator_id).first<{ evm_wallet_address: string | null }>();

        if (!operator?.evm_wallet_address) {
          return {
            success: false,
            error: 'Operator has no EVM wallet address. Cannot execute onchain payout.',
            scenario: 'full-lifecycle-onchain',
            steps_completed: ['lifecycle', 'submit', 'verify'],
            created: lifecycleResult.created,
          };
        }

        const aufAmount = Math.floor(deal!.reward_amount * (deal!.auf_percentage / 100));
        const payoutAmount = deal!.reward_amount - aufAmount;

        const txResults: {
          auf_tx?: { success: boolean; txHash?: string; explorerUrl?: string; error?: string };
          payout_tx?: { success: boolean; txHash?: string; explorerUrl?: string; error?: string };
        } = {};

        // AUF fee
        if (aufAmount > 0) {
          txResults.auf_tx = await transferHusd(env, FEE_RECIPIENTS.evm, aufAmount, { forceOnchain: true });
          await recordTokenOp(env, {
            opType: 'transfer',
            fromAddress: getOnchainConfig(env).treasuryAddress,
            toAddress: FEE_RECIPIENTS.evm,
            amountCents: aufAmount,
            txHash: txResults.auf_tx.txHash,
            status: txResults.auf_tx.success ? 'submitted' : 'failed',
            errorMessage: txResults.auf_tx.error,
          });
        }

        // Operator payout
        if (payoutAmount > 0) {
          txResults.payout_tx = await transferHusd(env, operator.evm_wallet_address, payoutAmount, { forceOnchain: true });
          await recordTokenOp(env, {
            opType: 'transfer',
            fromAddress: getOnchainConfig(env).treasuryAddress,
            toAddress: operator.evm_wallet_address,
            amountCents: payoutAmount,
            txHash: txResults.payout_tx.txHash,
            status: txResults.payout_tx.success ? 'submitted' : 'failed',
            errorMessage: txResults.payout_tx.error,
            operatorId: operator_id,
          });
        }

        const allSuccess = (!txResults.auf_tx || txResults.auf_tx.success) &&
                           (!txResults.payout_tx || txResults.payout_tx.success);

        if (allSuccess) {
          await env.DB.prepare(
            "UPDATE missions SET status = 'paid', paid_at = datetime('now') WHERE id = ?"
          ).bind(mission_id).run();
        }

        return {
          success: true,
          scenario: 'full-lifecycle-onchain',
          created: lifecycleResult.created,
          steps: ['agent', 'deal', 'application', 'mission', 'submit', 'verify', 'onchain-payout'],
          transactions: txResults,
          all_success: allSuccess,
          message: allSuccess
            ? 'Full lifecycle with onchain payout completed successfully on Sepolia!'
            : 'Lifecycle completed but some transactions failed. Check transaction details.',
        };
      },

      // API Smoke Test — hit all AI Advertiser API endpoints
      'api-smoke-test': async () => {
        const steps: { step: string; status: 'pass' | 'fail' | 'warn'; detail?: string }[] = [];
        const origin = new URL(request.url).origin;

        // Helper: internal request via router (avoids 522 on self-fetch through Cloudflare edge)
        async function apiFetch(method: string, path: string, body?: unknown, apiKey?: string) {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
          const req = new Request(origin + path, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
          });
          const { handleRequest } = await import('../../router');
          const res = await handleRequest(req, env);
          return { status: res.status, data: await res.json() as Record<string, unknown> };
        }

        let apiKey = '';
        let advertiserId = '';
        let missionId = '';
        let submissionId = '';

        try {
          // Step 1: Register
          try {
            const reg = await apiFetch('POST', '/api/v1/advertisers/register', {
              name: '[SMOKE_TEST] API Health Check',
              mode: 'test',
            });
            const advData = reg.data?.data as Record<string, unknown> | undefined;
            const advInfo = advData?.advertiser as Record<string, unknown> | undefined;
            apiKey = (advInfo?.api_key as string) || '';
            if (reg.data?.success && apiKey) {
              steps.push({ step: '1. Register', status: 'pass', detail: 'API key obtained' });
            } else {
              steps.push({ step: '1. Register', status: 'fail', detail: JSON.stringify(reg.data?.error || 'No api_key') });
            }
          } catch (e) {
            steps.push({ step: '1. Register', status: 'fail', detail: (e as Error).message });
          }

          if (!apiKey) {
            return { steps, passed: steps.filter(s => s.status === 'pass').length, total: steps.length };
          }

          // Step 2: GET /me (auth check)
          try {
            const me = await apiFetch('GET', '/api/v1/advertisers/me', undefined, apiKey);
            const meData = me.data?.data as Record<string, unknown> | undefined;
            advertiserId = (meData?.id as string) || '';
            if (me.data?.success && meData?.status === 'pending_claim') {
              steps.push({ step: '2. GET /me', status: 'pass', detail: 'status=pending_claim' });
            } else {
              steps.push({ step: '2. GET /me', status: 'fail', detail: `status=${meData?.status || 'unknown'}` });
            }
          } catch (e) {
            steps.push({ step: '2. GET /me', status: 'fail', detail: (e as Error).message });
          }

          // Step 3: Activate advertiser (DB direct — skip X verification for smoke test)
          try {
            const prefix = apiKey.substring(0, 17); // humanads_ (9) + 8 random chars
            await env.DB.prepare("UPDATE ai_advertisers SET status='active', claimed_at=datetime('now') WHERE api_key_prefix=?")
              .bind(prefix).run();
            const check = await env.DB.prepare("SELECT status FROM ai_advertisers WHERE api_key_prefix=?").bind(prefix).first<{ status: string }>();
            if (check?.status === 'active') {
              steps.push({ step: '3. Activate (DB)', status: 'pass', detail: 'status=active' });
            } else {
              steps.push({ step: '3. Activate (DB)', status: 'fail', detail: `status=${check?.status || 'not found'}` });
            }
          } catch (e) {
            steps.push({ step: '3. Activate (DB)', status: 'fail', detail: (e as Error).message });
          }

          // Step 4: Create Mission
          try {
            const mission = await apiFetch('POST', '/api/v1/advertisers/missions', {
              mode: 'test',
              title: '[SMOKE_TEST] Health Check Mission',
              brief: 'Automated API smoke test — will be cleaned up',
              requirements: {},
              deadline_at: new Date(Date.now() + 86400000).toISOString(),
              payout: { token: 'hUSD', amount: '1.00' },
              max_claims: 1,
            }, apiKey);
            const mData = mission.data?.data as Record<string, unknown> | undefined;
            missionId = (mData?.mission_id as string) || '';
            if (mission.data?.success && missionId) {
              steps.push({ step: '4. Create Mission', status: 'pass', detail: `mission_id=${missionId.substring(0, 8)}...` });
            } else {
              steps.push({ step: '4. Create Mission', status: 'fail', detail: JSON.stringify(mission.data?.error || 'No mission_id') });
            }
          } catch (e) {
            steps.push({ step: '4. Create Mission', status: 'fail', detail: (e as Error).message });
          }

          if (!missionId) {
            // Cleanup and return early
            await cleanupSmokeTest(env);
            return { steps, passed: steps.filter(s => s.status === 'pass').length, total: steps.length };
          }

          // Step 5: List Missions
          try {
            const list = await apiFetch('GET', '/api/v1/advertisers/missions/mine', undefined, apiKey);
            const listData = list.data?.data as Record<string, unknown> | undefined;
            const missions = listData?.missions as unknown[];
            if (list.data?.success && missions && missions.length >= 1) {
              steps.push({ step: '5. List Missions', status: 'pass', detail: `count=${missions.length}` });
            } else {
              steps.push({ step: '5. List Missions', status: 'fail', detail: 'No missions returned' });
            }
          } catch (e) {
            steps.push({ step: '5. List Missions', status: 'fail', detail: (e as Error).message });
          }

          // Step 6: Get Mission by ID
          try {
            const get = await apiFetch('GET', `/api/v1/advertisers/missions/${missionId}`, undefined, apiKey);
            const gData = get.data?.data as Record<string, unknown> | undefined;
            if (get.data?.success && (gData?.title as string)?.includes('[SMOKE_TEST]')) {
              steps.push({ step: '6. Get Mission', status: 'pass', detail: 'title matches' });
            } else {
              steps.push({ step: '6. Get Mission', status: 'fail', detail: `title=${gData?.title || 'unknown'}` });
            }
          } catch (e) {
            steps.push({ step: '6. Get Mission', status: 'fail', detail: (e as Error).message });
          }

          // Step 7: Create Test Submission
          try {
            const sub = await apiFetch('POST', `/api/v1/advertisers/missions/${missionId}/test-submission`, {}, apiKey);
            const subData = sub.data?.data as Record<string, unknown> | undefined;
            const promoters = subData?.promoters as Array<Record<string, unknown>> | undefined;
            if (sub.data?.success && promoters && promoters.length > 0) {
              submissionId = (promoters[0].submission_id as string) || '';
              steps.push({ step: '7. Test Submission', status: 'pass', detail: `${promoters.length} promoters seeded` });
            } else {
              steps.push({ step: '7. Test Submission', status: 'fail', detail: JSON.stringify(sub.data?.error || 'No promoters') });
            }
          } catch (e) {
            steps.push({ step: '7. Test Submission', status: 'fail', detail: (e as Error).message });
          }

          if (!submissionId) {
            await cleanupSmokeTest(env);
            return { steps, passed: steps.filter(s => s.status === 'pass').length, total: steps.length };
          }

          // Step 8: Approve Submission
          try {
            const approve = await apiFetch('POST', `/api/v1/submissions/${submissionId}/approve`, {
              verification_result: 'Smoke test auto-approval',
            }, apiKey);
            if (approve.data?.success) {
              steps.push({ step: '8. Approve Submission', status: 'pass', detail: 'approved' });
            } else {
              steps.push({ step: '8. Approve Submission', status: 'fail', detail: JSON.stringify(approve.data?.error || 'Failed') });
            }
          } catch (e) {
            steps.push({ step: '8. Approve Submission', status: 'fail', detail: (e as Error).message });
          }

          // Step 9: Execute Payout (may fail without treasury key — warn, not fail)
          try {
            const payout = await apiFetch('POST', `/api/v1/submissions/${submissionId}/payout/execute`, {}, apiKey);
            if (payout.data?.success) {
              steps.push({ step: '9. Execute Payout', status: 'pass', detail: 'payout executed' });
            } else {
              const errMsg = ((payout.data?.error as Record<string, unknown>)?.message as string) || 'Failed';
              // No treasury key is expected in some environments — warn instead of fail
              if (errMsg.includes('treasury') || errMsg.includes('TREASURY') || errMsg.includes('not configured')) {
                steps.push({ step: '9. Execute Payout', status: 'warn', detail: errMsg });
              } else {
                steps.push({ step: '9. Execute Payout', status: 'fail', detail: errMsg });
              }
            }
          } catch (e) {
            steps.push({ step: '9. Execute Payout', status: 'warn', detail: (e as Error).message });
          }

          // Step 10: Submit Review
          try {
            const review = await apiFetch('POST', `/api/v1/submissions/${submissionId}/review`, {
              rating: 5,
              comment: '[SMOKE_TEST] Automated health check review',
              tags: ['high_quality', 'on_time'],
            }, apiKey);
            if (review.data?.success) {
              steps.push({ step: '10. Submit Review', status: 'pass', detail: 'review submitted' });
            } else {
              steps.push({ step: '10. Submit Review', status: 'fail', detail: JSON.stringify(review.data?.error || 'Failed') });
            }
          } catch (e) {
            steps.push({ step: '10. Submit Review', status: 'fail', detail: (e as Error).message });
          }

          // Cleanup
          await cleanupSmokeTest(env);

          const passed = steps.filter(s => s.status === 'pass').length;
          const warned = steps.filter(s => s.status === 'warn').length;
          return {
            steps,
            passed,
            warned,
            total: steps.length,
            message: `API smoke test complete: ${passed}/${steps.length} passed` + (warned ? `, ${warned} warnings` : ''),
          };
        } catch (e) {
          // Cleanup even on unexpected error
          await cleanupSmokeTest(env);
          steps.push({ step: 'Unexpected Error', status: 'fail', detail: (e as Error).message });
          return { steps, passed: steps.filter(s => s.status === 'pass').length, total: steps.length };
        }
      },

      // Quick test setup
      'quick-setup': async () => {
        // Just returns available test resources
        const agent = await env.DB.prepare("SELECT id, name FROM agents WHERE status = 'approved' LIMIT 1").first();
        const operator = await env.DB.prepare("SELECT id, x_handle FROM operators WHERE status = 'verified' LIMIT 1").first();
        const deal = await env.DB.prepare("SELECT id, title FROM deals WHERE status = 'active' LIMIT 1").first();

        return {
          success: true,
          scenario: 'quick-setup',
          available: {
            agent,
            operator,
            deal,
          },
          message: agent && operator && deal
            ? 'Resources available for testing'
            : 'Some resources missing. Run full-lifecycle scenario first.',
        };
      },
    };

    const scenarioFn = scenarios[body.scenario];
    if (!scenarioFn) {
      return errors.invalidRequest(requestId, {
        message: `Unknown scenario: ${body.scenario}`,
        available_scenarios: Object.keys(scenarios),
      });
    }

    const result = await scenarioFn();
    return success(result, requestId);
  } catch (e) {
    console.error('Run scenario error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// Logging & Debug
// ============================================

export async function getAuditLogs(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agent_id');
    const endpoint = url.searchParams.get('endpoint');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = 'SELECT * FROM audit_logs';
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (agentId) {
      conditions.push('agent_id = ?');
      params.push(agentId);
    }
    if (endpoint) {
      // Escape LIKE wildcards in user input to prevent pattern injection
      const escapedEndpoint = endpoint.replace(/%/g, '\\%').replace(/_/g, '\\_');
      conditions.push("endpoint LIKE ? ESCAPE '\\'");
      params.push(`%${escapedEndpoint}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const result = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();

    return success({ logs: result.results, count: result.results.length }, requestId);
  } catch (e) {
    console.error('Get audit logs error:', e);
    return errors.internalError(requestId);
  }
}

export async function getPayments(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const url = new URL(request.url);
    const missionId = url.searchParams.get('mission_id');
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = 'SELECT * FROM payments';
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (missionId) {
      conditions.push('mission_id = ?');
      params.push(missionId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const result = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();

    return success({ payments: result.results, count: result.results.length }, requestId);
  } catch (e) {
    console.error('Get payments error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// Fee Recipient Configuration
// ============================================

export async function getFeeRecipients(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  return success({ fee_recipients: FEE_RECIPIENTS }, requestId);
}

// ============================================
// Token Operations (hUSD Faucet)
// ============================================

/**
 * POST /api/admin/faucet
 * Send hUSD from treasury to an advertiser address
 */
export async function handleFaucet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId, operator } = authResult.context!;

  try {
    // FAIL-FAST: Check treasury key before any other operations
    if (!hasTreasuryKey(env)) {
      return errors.invalidRequest(requestId, {
        code: 'TREASURY_KEY_NOT_SET',
        message: 'Treasury private key is not configured. Set TREASURY_PRIVATE_KEY secret in Cloudflare Dashboard.',
        help: 'Go to Workers & Pages > humanadsai > Settings > Variables > Secrets and add TREASURY_PRIVATE_KEY',
      });
    }

    const body = await request.json<{ advertiser_address: string }>();

    if (!body.advertiser_address) {
      return errors.invalidRequest(requestId, { message: 'advertiser_address is required' });
    }

    // Validate and normalize address to EIP-55 checksum
    const rawAddress = body.advertiser_address.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(rawAddress)) {
      return errors.invalidRequest(requestId, { message: 'Invalid EVM address format' });
    }
    const address = normalizeAddress(rawAddress);

    const config = getOnchainConfig(env);

    // Check cooldown
    const cooldown = await checkFaucetCooldown(env, address);
    if (!cooldown.allowed) {
      return errors.invalidRequest(requestId, {
        code: 'FAUCET_COOLDOWN',
        message: `Faucet cooldown active. Next available: ${cooldown.nextAvailable}`,
        next_available: cooldown.nextAvailable,
        last_faucet: cooldown.lastFaucet,
      });
    }

    // Check treasury balance
    let treasuryBalance: number;
    try {
      treasuryBalance = await getHusdBalance(env, config.treasuryAddress);
    } catch (e) {
      console.error('[AdminFaucet] RPC error checking treasury balance:', e);
      return errors.internalError(requestId);
    }
    if (treasuryBalance < config.faucetAmount) {
      return errors.invalidRequest(requestId, {
        code: 'INSUFFICIENT_TREASURY',
        message: `Treasury balance too low. Has: $${(treasuryBalance / 100).toFixed(2)}, needs: $${(config.faucetAmount / 100).toFixed(2)}`,
        treasury_balance_cents: treasuryBalance,
        required_cents: config.faucetAmount,
      });
    }

    // Record pending operation
    const opId = await recordTokenOp(env, {
      opType: 'faucet',
      fromAddress: config.treasuryAddress,
      toAddress: address,
      amountCents: config.faucetAmount,
      status: 'pending',
      operatorId: operator.id,
    });

    // Execute transfer
    const result = await transferHusd(env, address, config.faucetAmount);

    if (result.success) {
      // Update to confirmed
      await updateTokenOpStatus(env, opId, 'confirmed', result.txHash);

      return success({
        message: `Sent $${(config.faucetAmount / 100).toFixed(2)} hUSD to ${address}`,
        tx_hash: result.txHash,
        explorer_url: result.explorerUrl,
        amount_cents: config.faucetAmount,
        to_address: address,
        op_id: opId,
      }, requestId);
    } else {
      // Update to failed
      await updateTokenOpStatus(env, opId, 'failed', undefined, result.error);

      return errors.invalidRequest(requestId, {
        code: 'TRANSFER_FAILED',
        message: result.error || 'Transfer failed',
        op_id: opId,
      });
    }
  } catch (e) {
    console.error('Faucet error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * GET /api/admin/token-ops
 * List token operations
 */
export async function getTokenOps(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const url = new URL(request.url);
    const opType = url.searchParams.get('op_type');
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = 'SELECT * FROM token_ops';
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (opType) {
      conditions.push('op_type = ?');
      params.push(opType);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const result = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();

    return success({
      token_ops: result.results,
      count: result.results.length,
    }, requestId);
  } catch (e) {
    console.error('Get token ops error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * GET /api/admin/token-ops/balances
 * Get treasury and admin token balances
 */
export async function getTokenBalances(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const config = getOnchainConfig(env);

    const [treasuryHusd, treasuryEth, adminHusd, adminEth] = await Promise.all([
      getHusdBalance(env, config.treasuryAddress),
      getEthBalance(env, config.treasuryAddress),
      getHusdBalance(env, config.adminAddress),
      getEthBalance(env, config.adminAddress),
    ]);

    return success({
      treasury: {
        address: config.treasuryAddress,
        husd_cents: treasuryHusd,
        husd_display: `$${(treasuryHusd / 100).toFixed(2)}`,
        eth: treasuryEth,
      },
      admin: {
        address: normalizeAddress(config.adminAddress),
        husd_cents: adminHusd,
        husd_display: `$${(adminHusd / 100).toFixed(2)}`,
        eth: adminEth,
      },
      config: {
        chain_id: config.chainId,
        husd_contract: normalizeAddress(config.husdContract),
        faucet_amount_cents: config.faucetAmount,
        faucet_cooldown_seconds: config.faucetCooldown,
        has_treasury_key: hasTreasuryKey(env),
        payout_mode: env.PAYOUT_MODE || 'ledger',
      },
    }, requestId);
  } catch (e) {
    console.error('Get token balances error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/admin/token-ops/log
 * Log an owner mint/transfer operation (executed via MetaMask)
 */
export async function logTokenOp(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId, operator } = authResult.context!;

  try {
    const body = await request.json<{
      type: string;
      tx_hash: string;
      from_address: string;
      to_address: string;
      amount_cents: number;
      chain_id: number;
    }>();

    // Validate required fields
    if (!body.type || !body.tx_hash || !body.to_address || !body.amount_cents) {
      return errors.invalidRequest(requestId, { message: 'type, tx_hash, to_address, and amount_cents are required' });
    }

    // Validate type
    const validTypes = ['owner_mint', 'owner_transfer'];
    if (!validTypes.includes(body.type)) {
      return errors.invalidRequest(requestId, { message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    // Validate chain_id (Sepolia only)
    if (body.chain_id && body.chain_id !== 11155111) {
      return errors.invalidRequest(requestId, { message: 'Only Sepolia (chainId 11155111) is supported' });
    }

    // Validate and normalize addresses
    if (body.to_address && !/^0x[a-fA-F0-9]{40}$/.test(body.to_address.trim())) {
      return errors.invalidRequest(requestId, { message: 'Invalid to_address format' });
    }
    if (body.from_address && !/^0x[a-fA-F0-9]{40}$/.test(body.from_address.trim())) {
      return errors.invalidRequest(requestId, { message: 'Invalid from_address format' });
    }

    // Record the operation
    const opId = await recordTokenOp(env, {
      opType: body.type as 'mint' | 'transfer' | 'faucet',
      fromAddress: body.from_address ? normalizeAddress(body.from_address) : undefined,
      toAddress: normalizeAddress(body.to_address),
      amountCents: body.amount_cents,
      txHash: body.tx_hash,
      status: 'submitted',
      operatorId: operator.id,
    });

    return success({
      message: 'Token operation logged',
      op_id: opId,
      type: body.type,
      tx_hash: body.tx_hash,
    }, requestId);
  } catch (e) {
    console.error('Log token op error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * GET /api/admin/env-check
 * Lightweight check for treasury key availability and payout mode
 */
export async function getEnvCheck(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  return success({
    hasTreasuryKey: hasTreasuryKey(env),
    mode: env.PAYOUT_MODE || 'ledger',
  }, requestId);
}

/**
 * GET /api/admin/env
 * Get environment configuration status (secrets as booleans only)
 */
export async function getEnvStatus(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const config = getOnchainConfig(env);

    return success({
      // Secrets (boolean only - never expose actual values)
      secrets: {
        treasury_private_key: hasTreasuryKey(env),
        x_client_id: !!env.X_CLIENT_ID,
        x_client_secret: !!env.X_CLIENT_SECRET,
        x_bearer_token: !!env.X_BEARER_TOKEN,
        advertiser_test_key_id: !!env.ADVERTISER_TEST_KEY_ID,
        advertiser_test_secret: !!env.ADVERTISER_TEST_SECRET,
      },
      // Environment variables
      vars: {
        environment: env.ENVIRONMENT || 'development',
        payout_mode: env.PAYOUT_MODE || 'ledger',
        chain_id: config.chainId,
        evm_network: env.EVM_NETWORK || 'sepolia',
        rpc_url_configured: !!env.RPC_URL,
      },
      // Addresses (public info)
      addresses: {
        treasury: normalizeAddress(config.treasuryAddress),
        admin: normalizeAddress(config.adminAddress),
        husd_contract: normalizeAddress(config.husdContract),
      },
      // Faucet config
      faucet: {
        amount_cents: config.faucetAmount,
        cooldown_seconds: config.faucetCooldown,
      },
    }, requestId);
  } catch (e) {
    console.error('Get env status error:', e);
    return errors.internalError(requestId);
  }
}
