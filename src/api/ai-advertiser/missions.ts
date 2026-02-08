// AI Advertiser Mission Endpoints
// POST /api/v1/missions - Create a mission (deal)
// GET /api/v1/missions/mine - List my missions
// GET /api/v1/missions/:id - Get mission details
// POST /api/v1/missions/:id/hide - Hide a mission from public listings

import type { Env } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { success, error, errors } from '../../utils/response';
import { generateRandomString } from '../../utils/crypto';
import { validateLanguage } from '../../utils/format';
import { getMissionNextActions } from '../../utils/next-actions';

interface CreateMissionRequest {
  mode: 'test' | 'production';
  title: string;
  brief: string;
  requirements: {
    must_include_text?: string;
    must_include_hashtags?: string[];
    must_mention?: string[];
    must_include_urls?: string[];
  };
  deadline_at: string; // ISO 8601
  payout: {
    token: 'hUSD' | 'USDC';
    amount: string; // Decimal string
  };
  max_claims: number;
}

/**
 * Create a new mission (deal)
 *
 * POST /api/v1/missions
 *
 * Request body: CreateMissionRequest
 *
 * Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "mission_id": "deal_xxx",
 *     "title": "...",
 *     "status": "active",
 *     "max_claims": 50,
 *     "current_claims": 0
 *   }
 * }
 */
export async function handleCreateMission(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  // Enforce: advertiser must be active (claimed and verified)
  if (advertiser.status !== 'active') {
    return error(
      'ADVERTISER_NOT_ACTIVE',
      'Cannot create missions. Your advertiser must be active (status: "active"). Complete human claim and X verification first.',
      requestId,
      403
    );
  }

  // Parse request body
  let body: CreateMissionRequest;
  try {
    body = await request.json();
  } catch (e) {
    return errors.badRequest(requestId, 'Invalid JSON in request body');
  }

  // Validate required fields
  if (!body.title || typeof body.title !== 'string') {
    return errors.badRequest(requestId, 'Missing or invalid field: title');
  }

  if (!body.brief || typeof body.brief !== 'string') {
    return errors.badRequest(requestId, 'Missing or invalid field: brief');
  }

  if (!body.mode || (body.mode !== 'test' && body.mode !== 'production')) {
    return errors.badRequest(requestId, 'Invalid mode. Must be "test" or "production"');
  }

  // Enforce: mode must match advertiser mode
  if (body.mode !== advertiser.mode) {
    return error(
      'MODE_MISMATCH',
      `Mission mode "${body.mode}" does not match advertiser mode "${advertiser.mode}". Your advertiser is in ${advertiser.mode} mode.`,
      requestId,
      400
    );
  }

  if (!body.deadline_at || typeof body.deadline_at !== 'string') {
    return errors.badRequest(requestId, 'Missing or invalid field: deadline_at');
  }

  if (!body.payout || typeof body.payout !== 'object') {
    return errors.badRequest(requestId, 'Missing or invalid field: payout');
  }

  if (!body.payout.token || typeof body.payout.token !== 'string') {
    return errors.badRequest(requestId, 'Missing or invalid field: payout.token');
  }

  if (!body.payout.amount || typeof body.payout.amount !== 'string') {
    return errors.badRequest(requestId, 'Missing or invalid field: payout.amount');
  }

  if (!body.max_claims || typeof body.max_claims !== 'number' || body.max_claims < 1) {
    return errors.badRequest(requestId, 'Missing or invalid field: max_claims (must be >= 1)');
  }

  // Validate language (English only)
  const titleLangError = validateLanguage(body.title, 'title');
  if (titleLangError) {
    return errors.badRequest(requestId, titleLangError);
  }

  const briefLangError = validateLanguage(body.brief, 'brief');
  if (briefLangError) {
    return errors.badRequest(requestId, briefLangError);
  }

  if (body.requirements?.must_include_text) {
    const textLangError = validateLanguage(body.requirements.must_include_text, 'requirements.must_include_text');
    if (textLangError) {
      return errors.badRequest(requestId, textLangError);
    }
  }

  // Validate payout token matches mode
  if (body.mode === 'test' && body.payout.token !== 'hUSD') {
    return error(
      'INVALID_TOKEN',
      'Test mode must use hUSD token',
      requestId,
      400
    );
  }

  if (body.mode === 'production' && body.payout.token !== 'USDC') {
    return error(
      'INVALID_TOKEN',
      'Production mode must use USDC token',
      requestId,
      400
    );
  }

  // Parse payout amount
  let payoutAmountCents: number;
  try {
    const payoutFloat = parseFloat(body.payout.amount);
    if (isNaN(payoutFloat) || payoutFloat <= 0) {
      return errors.badRequest(requestId, 'payout.amount must be a positive number');
    }
    payoutAmountCents = Math.round(payoutFloat * 100); // Convert to cents/smallest unit
  } catch (e) {
    return errors.badRequest(requestId, 'Invalid payout.amount format');
  }

  // Validate deadline is in the future
  const deadlineDate = new Date(body.deadline_at);
  if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
    return errors.badRequest(requestId, 'deadline_at must be a valid future date');
  }

  // Generate mission ID
  const missionId = `deal_${generateRandomString(16)}`;

  // Prepare metadata (store ai_advertiser_id and payment profile here)
  const metadata = JSON.stringify({
    ai_advertiser_id: advertiser.id,
    ai_advertiser_name: advertiser.name,
    payout_token: body.payout.token,
    payment_profile: body.mode === 'test' ? 'sepolia_husd' : 'base_usdc',
    created_via: 'ai_advertiser_api'
  });

  // Prepare requirements JSON
  const requirements = JSON.stringify(body.requirements);

  // Ensure agents table has a record for this advertiser (deals.agent_id FK → agents.id)
  await env.DB
    .prepare(`
      INSERT OR IGNORE INTO agents (id, name, email, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
    `)
    .bind(
      advertiser.id,
      advertiser.name,
      `${advertiser.id}@ai-advertiser.humanadsai.com`,
      `AI Advertiser: ${advertiser.name}`
    )
    .run();

  const result = await env.DB
    .prepare(`
      INSERT INTO deals (
        id, agent_id, title, description, requirements,
        reward_amount, max_participants, current_participants,
        status, expires_at, metadata,
        created_at, updated_at, slots_total, slots_selected,
        applications_count, payment_model, auf_percentage, visibility
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active', ?, ?, datetime('now'), datetime('now'), ?, 0, 0, 'a_plan', 10, 'visible')
    `)
    .bind(
      missionId,
      advertiser.id, // Use ai_advertiser.id as agent_id for now
      body.title,
      body.brief,
      requirements,
      payoutAmountCents,
      body.max_claims,
      body.deadline_at,
      metadata,
      body.max_claims // slots_total
    )
    .run();

  if (!result.success) {
    console.error('[CreateMission] Database insert failed:', result);
    return errors.internalError(requestId);
  }

  return success({
    mission_id: missionId,
    title: body.title,
    status: 'active',
    max_claims: body.max_claims,
    current_claims: 0,
    deadline_at: body.deadline_at,
    payout: body.payout
  }, requestId, 201);
}

/**
 * List my missions
 *
 * GET /api/v1/missions/mine
 *
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "missions": [...]
 *   }
 * }
 */
export async function handleListMyMissions(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  // Query deals where agent_id = advertiser.id, with submission counts
  const missions = await env.DB
    .prepare(`
      SELECT
        d.id, d.title, d.description, d.reward_amount, d.max_participants,
        d.current_participants, d.status, d.expires_at, d.created_at, d.updated_at,
        d.slots_total, d.slots_selected, d.applications_count, d.metadata,
        (SELECT COUNT(*) FROM applications a WHERE a.deal_id = d.id AND a.status = 'applied') as pending_applications_count,
        (SELECT COUNT(*) FROM missions m WHERE m.deal_id = d.id AND m.status = 'submitted') as pending_submissions_count,
        (SELECT COUNT(*) FROM missions m WHERE m.deal_id = d.id AND m.status IN ('verified', 'approved', 'paid_partial')) as verified_submissions_count
      FROM deals d
      WHERE d.agent_id = ?
      ORDER BY d.created_at DESC
    `)
    .bind(advertiser.id)
    .all();

  if (!missions.success) {
    console.error('[ListMyMissions] Database query failed:', missions);
    return errors.internalError(requestId);
  }

  // Format missions for response
  const formattedMissions = missions.results.map((m: any) => {
    let metadata = {};
    try {
      if (m.metadata) {
        metadata = JSON.parse(m.metadata);
      }
    } catch (e) {
      // Ignore parse errors
    }

    const missionData = {
      mission_id: m.id,
      title: m.title,
      brief: m.description,
      status: m.status,
      max_claims: m.max_participants || m.slots_total,
      current_claims: m.current_participants || m.slots_selected,
      applications_count: m.applications_count || 0,
      pending_applications_count: m.pending_applications_count || 0,
      pending_submissions_count: m.pending_submissions_count || 0,
      verified_submissions_count: m.verified_submissions_count || 0,
      reward_amount_cents: m.reward_amount,
      deadline_at: m.expires_at,
      created_at: m.created_at,
      updated_at: m.updated_at,
      payout_token: (metadata as any).payout_token || 'hUSD'
    };
    return {
      ...missionData,
      next_actions: getMissionNextActions(missionData),
    };
  });

  return success({
    missions: formattedMissions,
    total: formattedMissions.length
  }, requestId);
}

/**
 * Get mission details
 *
 * GET /api/v1/missions/:id
 *
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "mission_id": "...",
 *     "title": "...",
 *     ...
 *   }
 * }
 */
export async function handleGetMission(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  missionId: string
): Promise<Response> {
  const { advertiser, requestId } = context;

  // Query the mission with submission counts
  const mission = await env.DB
    .prepare(`
      SELECT
        d.id, d.agent_id, d.title, d.description, d.requirements, d.reward_amount,
        d.max_participants, d.current_participants, d.status, d.expires_at,
        d.created_at, d.updated_at, d.slots_total, d.slots_selected,
        d.applications_count, d.metadata,
        (SELECT COUNT(*) FROM applications a WHERE a.deal_id = d.id AND a.status = 'applied') as pending_applications_count,
        (SELECT COUNT(*) FROM missions m WHERE m.deal_id = d.id AND m.status = 'submitted') as pending_submissions_count,
        (SELECT COUNT(*) FROM missions m WHERE m.deal_id = d.id AND m.status IN ('verified', 'approved', 'paid_partial')) as verified_submissions_count
      FROM deals d
      WHERE d.id = ?
    `)
    .bind(missionId)
    .first();

  if (!mission) {
    return errors.notFound(requestId, 'Mission not found');
  }

  // Verify ownership (mission belongs to this advertiser)
  if (mission.agent_id !== advertiser.id) {
    return error(
      'FORBIDDEN',
      'You do not have permission to access this mission',
      requestId,
      403
    );
  }

  // Parse metadata and requirements
  let metadata = {};
  let requirements = {};
  try {
    if (mission.metadata) {
      metadata = JSON.parse(mission.metadata as string);
    }
    if (mission.requirements) {
      requirements = JSON.parse(mission.requirements as string);
    }
  } catch (e) {
    // Ignore parse errors
  }

  const missionData = {
    mission_id: mission.id as string,
    title: mission.title,
    brief: mission.description,
    requirements,
    status: mission.status as string,
    max_claims: mission.max_participants || mission.slots_total,
    current_claims: mission.current_participants || mission.slots_selected,
    applications_count: (mission.applications_count || 0) as number,
    pending_applications_count: (mission.pending_applications_count || 0) as number,
    pending_submissions_count: (mission.pending_submissions_count || 0) as number,
    verified_submissions_count: (mission.verified_submissions_count || 0) as number,
    reward_amount_cents: mission.reward_amount,
    deadline_at: mission.expires_at,
    created_at: mission.created_at,
    updated_at: mission.updated_at,
    payout_token: (metadata as any).payout_token || 'hUSD'
  };

  return success({
    ...missionData,
    next_actions: getMissionNextActions(missionData),
  }, requestId);
}

/**
 * Hide (unpublish) a mission
 * POST /api/v1/missions/:id/hide
 */
export async function handleHideMission(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  missionId: string
): Promise<Response> {
  const { advertiser, requestId } = context;

  // Get mission and verify ownership
  const mission = await env.DB
    .prepare('SELECT id, agent_id, status, visibility FROM deals WHERE id = ?')
    .bind(missionId)
    .first();

  if (!mission) {
    return errors.notFound(requestId, 'Mission not found');
  }

  if (mission.agent_id !== advertiser.id) {
    return error('NOT_YOUR_MISSION', 'You do not have permission to hide this mission', requestId, 403);
  }

  // Check if there are selected promoters or active missions
  const activeMissions = await env.DB
    .prepare(`SELECT COUNT(*) as count FROM missions WHERE deal_id = ? AND status IN ('accepted', 'submitted')`)
    .bind(missionId)
    .first();

  if (activeMissions && (activeMissions.count as number) > 0) {
    return error('HAS_ACTIVE_MISSIONS', 'Cannot hide mission with active promoters or pending submissions', requestId, 409);
  }

  const selectedApps = await env.DB
    .prepare(`SELECT COUNT(*) as count FROM applications WHERE deal_id = ? AND status = 'selected'`)
    .bind(missionId)
    .first();

  if (selectedApps && (selectedApps.count as number) > 0) {
    return error('HAS_SELECTED_PROMOTERS', 'Cannot hide mission with selected promoters', requestId, 409);
  }

  const previousVisibility = mission.visibility || 'visible';

  // Update visibility to hidden
  await env.DB
    .prepare(`UPDATE deals SET visibility = 'hidden', updated_at = datetime('now') WHERE id = ?`)
    .bind(missionId)
    .run();

  return success({
    mission_id: missionId,
    previous_visibility: previousVisibility,
    visibility: 'hidden',
    message: 'Mission hidden from public listings'
  }, requestId);
}
