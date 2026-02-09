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
import { escrowDepositOnBehalf, escrowRefund, getOnchainConfig, getHusdBalance, getHusdAllowance } from '../../services/onchain';

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
  // Image creative (optional)
  required_media?: 'none' | 'image' | 'image_optional';
  image_url?: string;
  media_instructions?: string;
}

const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB (match X limit)

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

  // Validate image creative fields
  const requiredMedia = body.required_media || 'none';
  if (!['none', 'image', 'image_optional'].includes(requiredMedia)) {
    return errors.badRequest(requestId, 'Invalid required_media. Must be "none", "image", or "image_optional"');
  }

  let imageAssetId: string | null = null;
  let validatedImageUrl: string | null = null;

  if (requiredMedia === 'image' || requiredMedia === 'image_optional') {
    if (!body.image_url) {
      if (requiredMedia === 'image') {
        return error('MISSING_IMAGE_URL', 'required_media is "image" but no image_url provided', requestId, 400);
      }
    }

    if (body.image_url) {
      // Validate URL format
      let imageUrlObj: URL;
      try {
        imageUrlObj = new URL(body.image_url);
      } catch {
        return error('INVALID_IMAGE_URL', 'image_url is not a valid URL', requestId, 400);
      }
      if (imageUrlObj.protocol !== 'https:') {
        return error('INVALID_IMAGE_URL', 'image_url must use HTTPS', requestId, 400);
      }

      // Check extension
      const pathname = imageUrlObj.pathname.toLowerCase();
      const hasValidExt = ALLOWED_IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext));
      if (!hasValidExt) {
        return error('INVALID_IMAGE_URL', `image_url must end with one of: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`, requestId, 400);
      }

      // SSRF protection: block private/reserved IPs
      const hostname = imageUrlObj.hostname;
      if (/^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.|localhost|::1|\[::1\])/.test(hostname)) {
        return error('SSRF_BLOCKED', 'image_url resolves to a private/reserved IP', requestId, 400);
      }

      // HEAD request to validate image (5s timeout)
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const headRes = await fetch(body.image_url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow',
        });
        clearTimeout(timeout);

        if (!headRes.ok) {
          return error('INVALID_IMAGE_URL', `Image URL returned HTTP ${headRes.status}`, requestId, 400);
        }

        const contentType = headRes.headers.get('content-type') || '';
        if (!contentType.startsWith('image/')) {
          return error('INVALID_IMAGE_TYPE', `Image URL content-type is "${contentType}", expected image/*`, requestId, 400);
        }

        const contentLength = parseInt(headRes.headers.get('content-length') || '0', 10);
        if (contentLength > MAX_IMAGE_BYTES) {
          return error('IMAGE_TOO_LARGE', `Image is ${(contentLength / 1024 / 1024).toFixed(1)} MB, max is ${MAX_IMAGE_BYTES / 1024 / 1024} MB`, requestId, 400);
        }

        // Derive MIME type
        const mimeType = contentType.split(';')[0].trim();

        // Create media_assets record
        imageAssetId = crypto.randomUUID().replace(/-/g, '');
        await env.DB.prepare(`
          INSERT INTO media_assets (id, owner_advertiser_id, type, status, storage_provider,
            mime_type, file_bytes, source_url, public_url, moderation_status, created_at, updated_at)
          VALUES (?, ?, 'image', 'active', 'external', ?, ?, ?, ?, 'approved', datetime('now'), datetime('now'))
        `).bind(imageAssetId, advertiser.id, mimeType, contentLength || null, body.image_url, body.image_url).run();

        validatedImageUrl = body.image_url;
      } catch (e: any) {
        if (e.name === 'AbortError') {
          return error('INVALID_IMAGE_URL', 'Image URL request timed out (5s)', requestId, 400);
        }
        return error('INVALID_IMAGE_URL', `Could not reach image URL: ${e.message || 'network error'}`, requestId, 400);
      }
    }
  }

  // Validate media_instructions
  if (body.media_instructions) {
    if (typeof body.media_instructions !== 'string' || body.media_instructions.length > 500) {
      return errors.badRequest(requestId, 'media_instructions must be a string of max 500 characters');
    }
    const instrLangError = validateLanguage(body.media_instructions, 'media_instructions');
    if (instrLangError) {
      return errors.badRequest(requestId, instrLangError);
    }
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

  // All missions use escrow payment model
  const paymentModel = 'escrow';

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
        applications_count, payment_model, auf_percentage, visibility,
        required_media_type, image_asset_id, image_url, media_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active', ?, ?, datetime('now'), datetime('now'), ?, 0, 0, ?, 10, 'visible', ?, ?, ?, ?)
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
      body.max_claims, // slots_total
      paymentModel,
      requiredMedia,
      imageAssetId,
      validatedImageUrl,
      body.media_instructions || null
    )
    .run();

  if (!result.success) {
    console.error('[CreateMission] Database insert failed:', result);
    return errors.internalError(requestId);
  }

  // Check on-chain hUSD balance and find stored permit
  const totalDepositCents = payoutAmountCents * body.max_claims;
  let escrowDepositTx: string | undefined;

  if (body.payout.token === 'hUSD') {
    // Require wallet
    if (!advertiser.wallet_address) {
      await env.DB.prepare('DELETE FROM deals WHERE id = ?').bind(missionId).run();
      return error(
        'NO_WALLET',
        'Set your wallet address first: POST /advertisers/wallet',
        requestId,
        400
      );
    }

    // Check on-chain hUSD balance and allowance
    let onchainBalanceCents: number;
    let currentAllowanceCents: number;
    const config = getOnchainConfig(env);

    try {
      [onchainBalanceCents, currentAllowanceCents] = await Promise.all([
        getHusdBalance(env, advertiser.wallet_address),
        getHusdAllowance(env, advertiser.wallet_address, config.escrowContract),
      ]);
    } catch (e) {
      console.error('[CreateMission] RPC error checking balance/allowance:', e);
      await env.DB.prepare('DELETE FROM deals WHERE id = ?').bind(missionId).run();
      return error(
        'RPC_ERROR',
        'Failed to check on-chain balance via RPC. This is a temporary server-side issue — please retry in a few seconds.',
        requestId,
        502
      );
    }

    if (onchainBalanceCents < totalDepositCents) {
      await env.DB.prepare('DELETE FROM deals WHERE id = ?').bind(missionId).run();
      return error(
        'INSUFFICIENT_BALANCE',
        `Insufficient on-chain hUSD balance. Required: ${(totalDepositCents / 100).toFixed(2)} hUSD, Available: ${(onchainBalanceCents / 100).toFixed(2)} hUSD. Get hUSD first (faucet or transfer).`,
        requestId,
        402,
        { required_cents: totalDepositCents, available_cents: onchainBalanceCents }
      );
    }

    if (currentAllowanceCents < totalDepositCents) {
      await env.DB.prepare('DELETE FROM deals WHERE id = ?').bind(missionId).run();
      const requiredHusd = (totalDepositCents / 100).toFixed(2);
      const currentHusd = (currentAllowanceCents / 100).toFixed(2);
      const suggestedAmount = Math.ceil(totalDepositCents / 100);
      return error(
        'INSUFFICIENT_ALLOWANCE',
        `Insufficient escrow allowance. Required: ${requiredHusd} hUSD, Current allowance: ${currentHusd} hUSD. Approve more: GET /advertisers/deposit/approve?amount=${suggestedAmount}`,
        requestId,
        402,
        { required_cents: totalDepositCents, current_allowance_cents: currentAllowanceCents }
      );
    }

    // Deposit on behalf of advertiser (advertiser's hUSD decreases on-chain via existing allowance)
    const depositResult = await escrowDepositOnBehalf(
      env, missionId, advertiser.wallet_address, totalDepositCents,
      body.max_claims, body.deadline_at
    );

    if (!depositResult.success) {
      await env.DB.prepare('DELETE FROM deals WHERE id = ?').bind(missionId).run();
      return error('ESCROW_DEPOSIT_FAILED', depositResult.error || 'Failed to deposit into escrow contract', requestId, 502);
    }

    escrowDepositTx = depositResult.depositTxHash;

    // Record spend in advertiser_deposits for audit trail
    const spendId = crypto.randomUUID().replace(/-/g, '');
    await env.DB
      .prepare(
        `INSERT INTO advertiser_deposits (id, advertiser_id, type, amount_cents, deal_id, tx_hash, memo, created_at)
         VALUES (?, ?, 'spend', ?, ?, ?, ?, datetime('now'))`
      )
      .bind(spendId, advertiser.id, -totalDepositCents, missionId, escrowDepositTx || null, `Mission deposit: ${body.title}`)
      .run();
  }

  return success({
    mission_id: missionId,
    title: body.title,
    status: 'active',
    payment_model: paymentModel,
    max_claims: body.max_claims,
    current_claims: 0,
    deadline_at: body.deadline_at,
    payout: body.payout,
    required_media: requiredMedia,
    image_url: validatedImageUrl,
    image_asset_id: imageAssetId,
    media_instructions: body.media_instructions || null,
    escrow_deposit_tx: escrowDepositTx || null,
    escrow_contract: paymentModel === 'escrow' ? (getOnchainConfig(env).escrowContract) : null,
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
        d.slots_total, d.slots_selected, d.applications_count, d.metadata, d.payment_model,
        d.required_media_type, d.image_url, d.image_asset_id, d.media_instructions,
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
      payment_model: m.payment_model || 'escrow',
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
      payout_token: (metadata as any).payout_token || 'hUSD',
      required_media: m.required_media_type || 'none',
      image_url: m.image_url || null,
      image_asset_id: m.image_asset_id || null,
      media_instructions: m.media_instructions || null,
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
        d.applications_count, d.metadata, d.payment_model,
        d.required_media_type, d.image_url, d.image_asset_id, d.media_instructions, d.media_policy,
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

  const pmModel = (mission.payment_model as string) || 'escrow';
  const missionData = {
    mission_id: mission.id as string,
    title: mission.title,
    brief: mission.description,
    requirements,
    status: mission.status as string,
    payment_model: pmModel,
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
    payout_token: (metadata as any).payout_token || 'hUSD',
    required_media: (mission.required_media_type as string) || 'none',
    image_url: (mission.image_url as string) || null,
    image_asset_id: (mission.image_asset_id as string) || null,
    media_instructions: (mission.media_instructions as string) || null,
    media_policy: (mission.media_policy as string) || null,
  };

  return success({
    ...missionData,
    escrow_contract: pmModel === 'escrow' ? getOnchainConfig(env).escrowContract : null,
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
    .prepare('SELECT id, agent_id, status, visibility, payment_model FROM deals WHERE id = ?')
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

  // If escrow deal, refund remaining escrowed funds
  let escrowRefundTx: string | null = null;
  if (mission.payment_model === 'escrow') {
    const refundResult = await escrowRefund(env, missionId);
    if (refundResult.success) {
      escrowRefundTx = refundResult.txHash || null;

      // Credit back the unspent portion to advertiser_deposits
      // Refund = total deposited (abs of spend) - total released for this deal
      const spendRow = await env.DB
        .prepare(
          `SELECT COALESCE(SUM(ABS(amount_cents)), 0) as total_spent
           FROM advertiser_deposits WHERE advertiser_id = ? AND deal_id = ? AND type = 'spend'`
        )
        .bind(advertiser.id, missionId)
        .first<{ total_spent: number }>();
      const alreadyRefundedRow = await env.DB
        .prepare(
          `SELECT COALESCE(SUM(amount_cents), 0) as total_refunded
           FROM advertiser_deposits WHERE advertiser_id = ? AND deal_id = ? AND type = 'refund'`
        )
        .bind(advertiser.id, missionId)
        .first<{ total_refunded: number }>();
      const totalSpent = spendRow?.total_spent || 0;
      const alreadyRefunded = alreadyRefundedRow?.total_refunded || 0;
      // Determine how many payouts were made for this deal
      const paidCount = await env.DB
        .prepare(
          `SELECT COUNT(*) as count FROM missions m
           WHERE m.deal_id = ? AND m.status IN ('paid', 'paid_partial', 'paid_complete')`
        )
        .bind(missionId)
        .first<{ count: number }>();
      // Get per-slot payout from deal
      const dealInfo = await env.DB
        .prepare('SELECT reward_amount FROM deals WHERE id = ?')
        .bind(missionId)
        .first<{ reward_amount: number }>();
      const perSlotCents = dealInfo?.reward_amount || 0;
      const paidSlots = paidCount?.count || 0;
      const releasedCents = perSlotCents * paidSlots;
      const refundCents = totalSpent - releasedCents - alreadyRefunded;

      if (refundCents > 0) {
        const refundId = crypto.randomUUID().replace(/-/g, '');
        await env.DB
          .prepare(
            `INSERT INTO advertiser_deposits (id, advertiser_id, type, amount_cents, deal_id, tx_hash, memo, created_at)
             VALUES (?, ?, 'refund', ?, ?, ?, ?, datetime('now'))`
          )
          .bind(refundId, advertiser.id, refundCents, missionId, escrowRefundTx, `Refund for hidden mission`)
          .run();
      }
    } else {
      console.error(`[HideMission] Escrow refund failed for ${missionId}: ${refundResult.error}`);
      // Non-blocking: still hide the mission even if refund fails
    }
  }

  // Update visibility to hidden
  await env.DB
    .prepare(`UPDATE deals SET visibility = 'hidden', updated_at = datetime('now') WHERE id = ?`)
    .bind(missionId)
    .run();

  return success({
    mission_id: missionId,
    previous_visibility: previousVisibility,
    visibility: 'hidden',
    payment_model: mission.payment_model || 'escrow',
    escrow_refund_tx: escrowRefundTx,
    message: escrowRefundTx
      ? 'Mission hidden. Remaining escrow funds refunded.'
      : 'Mission hidden from public listings'
  }, requestId);
}
