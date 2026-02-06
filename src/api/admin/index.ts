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

    const agent = await env.DB.prepare('SELECT * FROM agents WHERE id = ?')
      .bind(agentId)
      .first<Agent>();

    return success({ agent }, requestId);
  } catch (e) {
    console.error('Update agent error:', e);
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
    const paymentModel = body.payment_model || 'a_plan';
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

    const validStatuses = ['pending', 'shortlisted', 'selected', 'rejected', 'withdrawn'];
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

    let query = `SELECT m.*, o.x_handle, o.display_name, d.title as deal_title, d.reward_amount
                 FROM missions m
                 LEFT JOIN operators o ON m.operator_id = o.id
                 LEFT JOIN deals d ON m.deal_id = d.id`;
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (dealId) {
      conditions.push('m.deal_id = ?');
      params.push(dealId);
    }
    if (status) {
      conditions.push('m.status = ?');
      params.push(status);
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

    if (!['ledger', 'testnet', 'mainnet'].includes(body.mode)) {
      return errors.invalidRequest(requestId, { message: 'mode must be ledger, testnet, or mainnet' });
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

    // Only Sepolia supported for testnet
    const chain = 'sepolia';
    const token = body.token || 'USDC';
    const payoutConfig = getPayoutConfig(env);

    let result: {
      mode: string;
      chain: string;
      token: string;
      auf_amount_cents: number;
      payout_amount_cents: number;
      treasury_address: string;
      operator_address: string | null;
      simulated_auf_tx?: string;
      simulated_payout_tx?: string;
      message: string;
    };

    if (body.mode === 'ledger') {
      // Simulated payout - no real blockchain transaction
      const aufAmount = Math.floor(mission.reward_amount * (mission.auf_percentage / 100));
      const payoutAmount = mission.reward_amount - aufAmount;

      result = {
        mode: 'ledger',
        chain,
        token,
        auf_amount_cents: aufAmount,
        payout_amount_cents: payoutAmount,
        treasury_address: FEE_RECIPIENTS.evm,
        operator_address: operator?.evm_wallet_address || null,
        simulated_auf_tx: generateSimulatedTxHash(),
        simulated_payout_tx: generateSimulatedTxHash(),
        message: 'Ledger mode: transactions are simulated, no real funds transferred',
      };
    } else if (body.mode === 'testnet') {
      // Testnet payout - real transaction on test network
      const aufAmount = Math.floor(mission.reward_amount * (mission.auf_percentage / 100));
      const payoutAmount = mission.reward_amount - aufAmount;

      result = {
        mode: 'testnet',
        chain,
        token,
        auf_amount_cents: aufAmount,
        payout_amount_cents: payoutAmount,
        treasury_address: FEE_RECIPIENTS.evm,
        operator_address: operator?.evm_wallet_address || null,
        message: 'Testnet mode: use testnet faucet to fund transactions. Chain: sepolia',
      };
    } else {
      // Mainnet payout - real transaction
      const aufAmount = Math.floor(mission.reward_amount * (mission.auf_percentage / 100));
      const payoutAmount = mission.reward_amount - aufAmount;

      result = {
        mode: 'mainnet',
        chain: 'base', // Default to Base for mainnet
        token,
        auf_amount_cents: aufAmount,
        payout_amount_cents: payoutAmount,
        treasury_address: FEE_RECIPIENTS.evm,
        operator_address: operator?.evm_wallet_address || null,
        message: 'Mainnet mode: REAL funds will be transferred!',
      };
    }

    return success(result, requestId);
  } catch (e) {
    console.error('Test payout error:', e);
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
           VALUES (?, ?, 'Scenario Test Deal', 'Created by admin scenario runner', '{"content_type":"original_post","disclosure":"#ad"}', 1000, 10, 'active', 'a_plan', 10)`
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
      conditions.push('endpoint LIKE ?');
      params.push(`%${endpoint}%`);
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
    const treasuryBalance = await getHusdBalance(env, config.treasuryAddress);
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
        address: config.adminAddress,
        husd_cents: adminHusd,
        husd_display: `$${(adminHusd / 100).toFixed(2)}`,
        eth: adminEth,
      },
      config: {
        chain_id: config.chainId,
        husd_contract: config.husdContract,
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
        treasury: config.treasuryAddress,
        admin: config.adminAddress,
        husd_contract: config.husdContract,
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
