// AI Advertiser Submission & Payout Endpoints (Phase 5)
//
// GET  /missions/:id/submissions           - List submissions for a mission
// POST /missions/:id/test-submission       - Create test submission (test mode only)
// POST /submissions/:id/approve            - Approve a submission
// POST /submissions/:id/reject             - Reject a submission
// POST /submissions/:id/payout             - Trigger payout
// GET  /submissions/:id/payout             - Check payout status
// GET  /payouts                             - List all payouts

import type { Env, Mission } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { success, error, errors } from '../../utils/response';
import { generateRandomString } from '../../utils/crypto';

// ============================================
// Helper: verify mission belongs to this advertiser
// ============================================
async function getMissionWithOwnership(
  env: Env,
  missionId: string,
  advertiserId: string,
  requestId: string
): Promise<{ mission: any; error?: Response }> {
  const mission = await env.DB
    .prepare('SELECT * FROM missions WHERE id = ?')
    .bind(missionId)
    .first();

  if (!mission) {
    return { mission: null, error: errors.notFound(requestId, 'Submission not found') };
  }

  // Check ownership via deal -> agent_id
  const deal = await env.DB
    .prepare('SELECT agent_id, reward_amount, metadata FROM deals WHERE id = ?')
    .bind(mission.deal_id)
    .first<{ agent_id: string; reward_amount: number; metadata: string | null }>();

  if (!deal || deal.agent_id !== advertiserId) {
    return {
      mission: null,
      error: error('NOT_YOUR_MISSION', 'Submission belongs to another advertiser', requestId, 403)
    };
  }

  return { mission: { ...mission, _deal: deal } };
}

/**
 * List submissions for a mission
 *
 * GET /api/v1/missions/:missionId/submissions
 */
export async function handleListSubmissions(
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
    SELECT m.id, m.deal_id, m.operator_id, m.status, m.submission_url,
           m.submission_content, m.submitted_at, m.verified_at,
           m.verification_result, m.created_at, m.updated_at,
           o.x_handle, o.display_name
    FROM missions m
    LEFT JOIN operators o ON m.operator_id = o.id
    WHERE m.deal_id = ?
  `;
  const params: any[] = [dealId];

  if (statusFilter) {
    query += ' AND m.status = ?';
    params.push(statusFilter);
  }

  query += ' ORDER BY m.submitted_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await env.DB
    .prepare(query)
    .bind(...params)
    .all();

  if (!result.success) {
    return errors.internalError(requestId);
  }

  // Get total count
  let countQuery = 'SELECT COUNT(*) as cnt FROM missions WHERE deal_id = ?';
  const countParams: any[] = [dealId];
  if (statusFilter) {
    countQuery += ' AND status = ?';
    countParams.push(statusFilter);
  }
  const total = await env.DB
    .prepare(countQuery)
    .bind(...countParams)
    .first<{ cnt: number }>();

  const submissions = result.results.map((m: any) => ({
    submission_id: m.id,
    mission_id: m.deal_id,
    operator: {
      id: m.operator_id,
      x_handle: m.x_handle ? m.x_handle.replace(/^@+/, '') : null,
      display_name: m.display_name || null
    },
    submission_url: m.submission_url || null,
    submission_content: m.submission_content || null,
    status: m.status,
    submitted_at: m.submitted_at || null,
    verified_at: m.verified_at || null,
    rejected_at: m.status === 'rejected' ? m.updated_at : null,
    rejection_reason: m.status === 'rejected' ? m.verification_result : null,
    payout_status: null
  }));

  return success({
    submissions,
    total: total?.cnt || 0,
    has_more: (offset + limit) < (total?.cnt || 0)
  }, requestId);
}

/**
 * Create a test submission (test mode only)
 *
 * POST /api/v1/missions/:dealId/test-submission
 *
 * Creates a simulated promoter submission so the advertiser can test
 * the full approve/reject/payout flow in the playground.
 */
export async function handleCreateTestSubmission(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  dealId: string
): Promise<Response> {
  const { advertiser, requestId } = context;

  // Only allowed in test mode
  if (advertiser.mode !== 'test') {
    return error('TEST_MODE_ONLY', 'Test submissions can only be created in test mode', requestId, 403);
  }

  // Verify deal ownership
  const deal = await env.DB
    .prepare('SELECT id, agent_id, reward_amount, metadata FROM deals WHERE id = ?')
    .bind(dealId)
    .first<{ id: string; agent_id: string; reward_amount: number; metadata: string | null }>();

  if (!deal || deal.agent_id !== advertiser.id) {
    return error('NOT_YOUR_MISSION', 'Mission not found or does not belong to you', requestId, 403);
  }

  // Create or get test operator
  const testOperatorId = 'test_promoter_playground';
  await env.DB
    .prepare(`
      INSERT OR IGNORE INTO operators (id, x_handle, display_name, status, created_at, updated_at)
      VALUES (?, '@TestPromoter', 'Test Promoter (Playground)', 'verified', datetime('now'), datetime('now'))
    `)
    .bind(testOperatorId)
    .run();

  // Check for existing test submission on this deal
  const existing = await env.DB
    .prepare('SELECT id FROM missions WHERE deal_id = ? AND operator_id = ?')
    .bind(dealId, testOperatorId)
    .first();

  if (existing) {
    return error('ALREADY_EXISTS', 'A test submission already exists for this mission', requestId, 409);
  }

  // Create submission
  const submissionId = generateRandomString(32);
  const testUrl = 'https://x.com/TestPromoter/status/' + Date.now();

  await env.DB
    .prepare(`
      INSERT INTO missions (id, deal_id, operator_id, status, submission_url,
                            submission_content, submitted_at, created_at, updated_at)
      VALUES (?, ?, ?, 'submitted', ?, ?, datetime('now'), datetime('now'), datetime('now'))
    `)
    .bind(
      submissionId,
      dealId,
      testOperatorId,
      testUrl,
      'Test submission from API Playground. #HumanAds #ad @HumanAdsAI https://humanadsai.com'
    )
    .run();

  return success({
    submission_id: submissionId,
    mission_id: dealId,
    operator: {
      id: testOperatorId,
      x_handle: 'TestPromoter',
      display_name: 'Test Promoter (Playground)'
    },
    submission_url: testUrl,
    status: 'submitted',
    submitted_at: new Date().toISOString()
  }, requestId, 201);
}

/**
 * Approve a submission
 *
 * POST /api/v1/submissions/:submissionId/approve
 */
export async function handleApproveSubmission(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  submissionId: string
): Promise<Response> {
  const { advertiser, requestId } = context;

  const { mission, error: ownershipError } = await getMissionWithOwnership(
    env, submissionId, advertiser.id, requestId
  );
  if (ownershipError) return ownershipError;

  // Check current status
  if (mission.status === 'verified' || mission.status === 'approved' ||
      mission.status === 'paid_complete') {
    return error('ALREADY_REVIEWED', 'Submission already verified or reviewed', requestId, 409);
  }

  if (mission.status !== 'submitted') {
    return error(
      'SUBMISSION_NOT_SUBMITTED',
      `Cannot approve: submission status is "${mission.status}", expected "submitted"`,
      requestId,
      400
    );
  }

  // Parse optional body
  let verificationResult: string | null = null;
  try {
    const body = await request.json() as { verification_result?: string };
    verificationResult = body.verification_result || null;
  } catch {
    // No body is fine
  }

  // Calculate payout breakdown
  const rewardAmountCents = mission._deal.reward_amount;
  const platformFeeCents = Math.round(rewardAmountCents * 0.10); // 10% AUF
  const promoterPayoutCents = rewardAmountCents - platformFeeCents;

  // Parse token from deal metadata
  let payoutToken = 'hUSD';
  try {
    if (mission._deal.metadata) {
      const meta = JSON.parse(mission._deal.metadata);
      payoutToken = meta.payout_token || 'hUSD';
    }
  } catch { /* ignore */ }

  // Update mission status to verified
  await env.DB
    .prepare(`
      UPDATE missions
      SET status = 'verified',
          verified_at = datetime('now'),
          verification_result = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(verificationResult, submissionId)
    .run();

  return success({
    submission_id: submissionId,
    status: 'verified',
    verified_at: new Date().toISOString(),
    payout: {
      status: 'pending',
      total_amount: (rewardAmountCents / 100).toFixed(2),
      token: payoutToken,
      breakdown: {
        platform_fee: (platformFeeCents / 100).toFixed(2),
        promoter_payout: (promoterPayoutCents / 100).toFixed(2)
      }
    }
  }, requestId);
}

/**
 * Reject a submission
 *
 * POST /api/v1/submissions/:submissionId/reject
 */
export async function handleRejectSubmission(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  submissionId: string
): Promise<Response> {
  const { advertiser, requestId } = context;

  const { mission, error: ownershipError } = await getMissionWithOwnership(
    env, submissionId, advertiser.id, requestId
  );
  if (ownershipError) return ownershipError;

  // Check current status
  if (mission.status === 'verified' || mission.status === 'rejected' ||
      mission.status === 'approved' || mission.status === 'paid_complete') {
    return error('ALREADY_REVIEWED', 'Submission already verified or rejected', requestId, 409);
  }

  if (mission.status !== 'submitted') {
    return error(
      'SUBMISSION_NOT_SUBMITTED',
      `Cannot reject: submission status is "${mission.status}", expected "submitted"`,
      requestId,
      400
    );
  }

  // Parse body - reason is required
  let body: { reason: string };
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON in request body');
  }

  if (!body.reason || typeof body.reason !== 'string' || body.reason.trim().length === 0) {
    return errors.badRequest(requestId, 'Missing required field: reason');
  }

  // Update mission status to rejected, store reason in verification_result
  await env.DB
    .prepare(`
      UPDATE missions
      SET status = 'rejected',
          verification_result = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(body.reason.trim(), submissionId)
    .run();

  return success({
    submission_id: submissionId,
    status: 'rejected',
    rejected_at: new Date().toISOString(),
    reason: body.reason.trim()
  }, requestId);
}

/**
 * Trigger payout for a verified submission
 *
 * POST /api/v1/submissions/:submissionId/payout
 */
export async function handleTriggerPayout(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  submissionId: string
): Promise<Response> {
  const { advertiser, requestId } = context;

  const { mission, error: ownershipError } = await getMissionWithOwnership(
    env, submissionId, advertiser.id, requestId
  );
  if (ownershipError) return ownershipError;

  // Must be verified
  if (mission.status !== 'verified') {
    if (mission.status === 'approved' || mission.status === 'address_unlocked' ||
        mission.status === 'paid_partial' || mission.status === 'paid_complete') {
      return error('PAYOUT_ALREADY_INITIATED', 'Payout already initiated for this submission', requestId, 400);
    }
    return error('NOT_VERIFIED', 'Submission must be verified before payout can be triggered', requestId, 400);
  }

  // Calculate payout breakdown
  const rewardAmountCents = mission._deal.reward_amount;
  const platformFeeCents = Math.round(rewardAmountCents * 0.10);
  const promoterPayoutCents = rewardAmountCents - platformFeeCents;

  let payoutToken = 'hUSD';
  let chain = 'sepolia';
  try {
    if (mission._deal.metadata) {
      const meta = JSON.parse(mission._deal.metadata);
      payoutToken = meta.payout_token || 'hUSD';
      if (payoutToken === 'USDC') chain = 'base';
    }
  } catch { /* ignore */ }

  // Set payout deadline (72 hours from now)
  const deadlineDate = new Date();
  deadlineDate.setHours(deadlineDate.getHours() + 72);
  const payoutDeadline = deadlineDate.toISOString();

  // Update mission to approved status
  await env.DB
    .prepare(`
      UPDATE missions
      SET status = 'approved',
          approved_at = datetime('now'),
          payout_deadline_at = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(payoutDeadline, submissionId)
    .run();

  // Create payment records (AUF + promoter payout)
  const aufPaymentId = `pay_${generateRandomString(16)}`;
  const payoutPaymentId = `pay_${generateRandomString(16)}`;

  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO payments (id, mission_id, agent_id, operator_id, payment_type,
                            amount_cents, chain, token, status, deadline_at,
                            created_at, updated_at, payout_mode)
      VALUES (?, ?, ?, ?, 'auf', ?, ?, ?, 'pending', ?, datetime('now'), datetime('now'), 'onchain')
    `).bind(aufPaymentId, submissionId, advertiser.id, mission.operator_id,
            platformFeeCents, chain, payoutToken, payoutDeadline),
    env.DB.prepare(`
      INSERT INTO payments (id, mission_id, agent_id, operator_id, payment_type,
                            amount_cents, chain, token, status, deadline_at,
                            created_at, updated_at, payout_mode)
      VALUES (?, ?, ?, ?, 'payout', ?, ?, ?, 'pending', ?, datetime('now'), datetime('now'), 'onchain')
    `).bind(payoutPaymentId, submissionId, advertiser.id, mission.operator_id,
            promoterPayoutCents, chain, payoutToken, payoutDeadline)
  ]);

  return success({
    submission_id: submissionId,
    payout_status: 'pending',
    total_amount: (rewardAmountCents / 100).toFixed(2),
    token: payoutToken,
    chain,
    breakdown: {
      platform_fee: {
        amount: (platformFeeCents / 100).toFixed(2),
        status: 'pending',
        tx_hash: null
      },
      promoter_payout: {
        amount: (promoterPayoutCents / 100).toFixed(2),
        status: 'pending',
        tx_hash: null
      }
    },
    payout_deadline_at: payoutDeadline
  }, requestId);
}

/**
 * Check payout status for a submission
 *
 * GET /api/v1/submissions/:submissionId/payout
 */
export async function handleGetPayoutStatus(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  submissionId: string
): Promise<Response> {
  const { advertiser, requestId } = context;

  const { mission, error: ownershipError } = await getMissionWithOwnership(
    env, submissionId, advertiser.id, requestId
  );
  if (ownershipError) return ownershipError;

  // Get payment records
  const payments = await env.DB
    .prepare('SELECT * FROM payments WHERE mission_id = ? ORDER BY payment_type ASC')
    .bind(submissionId)
    .all();

  if (!payments.success || payments.results.length === 0) {
    return error('NO_PAYOUT', 'No payout has been initiated for this submission', requestId, 404);
  }

  const aufPayment = payments.results.find((p: any) => p.payment_type === 'auf') as any;
  const payoutPayment = payments.results.find((p: any) => p.payment_type === 'payout') as any;

  const rewardAmountCents = mission._deal.reward_amount;
  let payoutToken = 'hUSD';
  let chain = 'sepolia';
  try {
    if (mission._deal.metadata) {
      const meta = JSON.parse(mission._deal.metadata);
      payoutToken = meta.payout_token || 'hUSD';
      if (payoutToken === 'USDC') chain = 'base';
    }
  } catch { /* ignore */ }

  // Determine overall payout status
  let payoutStatus = 'pending';
  if (aufPayment?.status === 'confirmed' && payoutPayment?.status === 'confirmed') {
    payoutStatus = 'paid_complete';
  } else if (aufPayment?.status === 'confirmed') {
    payoutStatus = 'paid_partial';
  } else if (aufPayment?.status === 'failed' || payoutPayment?.status === 'failed') {
    payoutStatus = 'failed';
  }

  return success({
    submission_id: submissionId,
    payout_status: payoutStatus,
    total_amount: (rewardAmountCents / 100).toFixed(2),
    token: payoutToken,
    chain,
    breakdown: {
      platform_fee: {
        amount: aufPayment ? (aufPayment.amount_cents / 100).toFixed(2) : '0.00',
        status: aufPayment?.status || 'pending',
        tx_hash: aufPayment?.tx_hash || null,
        confirmed_at: aufPayment?.confirmed_at || null
      },
      promoter_payout: {
        amount: payoutPayment ? (payoutPayment.amount_cents / 100).toFixed(2) : '0.00',
        status: payoutPayment?.status || 'pending',
        tx_hash: payoutPayment?.tx_hash || null,
        confirmed_at: payoutPayment?.confirmed_at || null
      }
    },
    paid_complete_at: (payoutStatus === 'paid_complete' && payoutPayment?.confirmed_at)
      ? payoutPayment.confirmed_at : null
  }, requestId);
}

/**
 * List all payouts for this advertiser
 *
 * GET /api/v1/payouts
 */
export async function handleListPayouts(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  let query = `
    SELECT p.id, p.mission_id, p.payment_type, p.amount_cents,
           p.chain, p.token, p.tx_hash, p.status, p.confirmed_at,
           p.created_at, m.deal_id
    FROM payments p
    JOIN missions m ON p.mission_id = m.id
    WHERE p.agent_id = ?
  `;
  const params: any[] = [advertiser.id];

  if (statusFilter) {
    query += ' AND p.status = ?';
    params.push(statusFilter);
  }

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await env.DB
    .prepare(query)
    .bind(...params)
    .all();

  if (!result.success) {
    return errors.internalError(requestId);
  }

  // Get total count
  let countQuery = 'SELECT COUNT(*) as cnt FROM payments WHERE agent_id = ?';
  const countParams: any[] = [advertiser.id];
  if (statusFilter) {
    countQuery += ' AND status = ?';
    countParams.push(statusFilter);
  }
  const total = await env.DB
    .prepare(countQuery)
    .bind(...countParams)
    .first<{ cnt: number }>();

  const payouts = result.results.map((p: any) => ({
    payment_id: p.id,
    submission_id: p.mission_id,
    mission_id: p.deal_id,
    payment_type: p.payment_type,
    amount: (p.amount_cents / 100).toFixed(2),
    token: p.token,
    chain: p.chain,
    status: p.status,
    tx_hash: p.tx_hash || null,
    confirmed_at: p.confirmed_at || null
  }));

  return success({
    payouts,
    total: total?.cnt || 0,
    has_more: (offset + limit) < (total?.cnt || 0)
  }, requestId);
}
