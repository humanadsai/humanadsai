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

// Test promoter profiles (same as advertiser/test.ts)
const TEST_PROMOTERS = [
  {
    id: 'op_test_alice',
    x_handle: '@alice_web3',
    x_user_id: 'test_alice_001',
    display_name: 'Alice | Web3 Creator',
    evm_wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00',
    x_followers_count: 12400,
    x_tweet_count: 3200,
    x_verified: 1,
    total_missions_completed: 8,
    total_earnings: 4200,
    x_description: 'Web3 creator & DeFi enthusiast. Building the future of decentralized advertising.',
    submission_url: 'https://x.com/alice_web3/status/1234567890',
  },
  {
    id: 'op_test_bob',
    x_handle: '@bob_crypto',
    x_user_id: 'test_bob_002',
    display_name: 'Bob Crypto Daily',
    evm_wallet_address: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    x_followers_count: 45200,
    x_tweet_count: 8900,
    x_verified: 1,
    total_missions_completed: 23,
    total_earnings: 15800,
    x_description: 'Daily crypto analysis & insights. 45K+ community. DM for collabs.',
    submission_url: 'https://x.com/bob_crypto/status/2345678901',
  },
  {
    id: 'op_test_carol',
    x_handle: '@carol_defi',
    x_user_id: 'test_carol_003',
    display_name: 'Carol',
    evm_wallet_address: '0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e',
    x_followers_count: 2100,
    x_tweet_count: 1100,
    x_verified: 0,
    total_missions_completed: 2,
    total_earnings: 1000,
    x_description: 'DeFi researcher. New to promotions but passionate about the space.',
    submission_url: 'https://x.com/carol_defi/status/3456789012',
  },
  {
    id: 'op_test_dave',
    x_handle: '@dave_nft_king',
    x_user_id: 'test_dave_004',
    display_name: 'Dave NFT King',
    evm_wallet_address: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
    x_followers_count: 89500,
    x_tweet_count: 15600,
    x_verified: 1,
    total_missions_completed: 47,
    total_earnings: 38500,
    x_description: 'NFT & crypto influencer. Top promoter on HumanAds. Always deliver quality.',
    submission_url: 'https://x.com/dave_nft_king/status/4567890123',
  },
  {
    id: 'op_test_eve',
    x_handle: '@eve_blockchain',
    x_user_id: 'test_eve_005',
    display_name: 'Eve Blockchain Dev',
    evm_wallet_address: '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB',
    x_followers_count: 6800,
    x_tweet_count: 2400,
    x_verified: 0,
    total_missions_completed: 5,
    total_earnings: 2500,
    x_description: 'Blockchain developer & technical writer. I explain complex topics simply.',
    submission_url: 'https://x.com/eve_blockchain/status/5678901234',
  },
];

/**
 * Seed test promoters & submissions (test mode only)
 *
 * POST /api/v1/missions/:dealId/test-submission
 *
 * Creates 5 simulated promoter submissions so the advertiser can
 * select one and test the full approve/reject/payout flow.
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

  // Check if already seeded
  const existingCount = await env.DB
    .prepare('SELECT COUNT(*) as cnt FROM missions WHERE deal_id = ?')
    .bind(dealId)
    .first<{ cnt: number }>();

  if (existingCount && existingCount.cnt > 0) {
    return error('ALREADY_SEEDED', 'Test promoters already seeded for this mission. Use Check Submissions to view them.', requestId, 409);
  }

  const promoters: any[] = [];

  for (const p of TEST_PROMOTERS) {
    // Create or update test operator
    await env.DB
      .prepare(`
        INSERT INTO operators (id, x_handle, x_user_id, display_name, status, evm_wallet_address,
          x_followers_count, x_tweet_count, x_verified,
          total_missions_completed, total_earnings, x_description,
          created_at, updated_at)
        VALUES (?, ?, ?, ?, 'verified', ?,
          ?, ?, ?,
          ?, ?, ?,
          datetime('now'), datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          x_followers_count = excluded.x_followers_count,
          x_tweet_count = excluded.x_tweet_count,
          total_missions_completed = excluded.total_missions_completed,
          total_earnings = excluded.total_earnings
      `)
      .bind(
        p.id, p.x_handle, p.x_user_id, p.display_name, p.evm_wallet_address,
        p.x_followers_count, p.x_tweet_count, p.x_verified,
        p.total_missions_completed, p.total_earnings, p.x_description
      )
      .run();

    // Create submission (mission record with status 'submitted')
    const submissionId = generateRandomString(32);
    await env.DB
      .prepare(`
        INSERT INTO missions (id, deal_id, operator_id, status, submission_url,
                              submission_content, submitted_at, created_at, updated_at)
        VALUES (?, ?, ?, 'submitted', ?, ?, datetime('now'), datetime('now'), datetime('now'))
      `)
      .bind(
        submissionId,
        dealId,
        p.id,
        p.submission_url,
        `Promoting HumanAds! #HumanAds #ad @HumanAdsAI https://humanadsai.com`
      )
      .run();

    promoters.push({
      submission_id: submissionId,
      operator_id: p.id,
      x_handle: p.x_handle,
      display_name: p.display_name,
      x_followers_count: p.x_followers_count,
      x_tweet_count: p.x_tweet_count,
      x_verified: p.x_verified,
      total_missions_completed: p.total_missions_completed,
      total_earnings: p.total_earnings,
      x_description: p.x_description,
      evm_wallet_address: p.evm_wallet_address,
      submission_url: p.submission_url,
      status: 'submitted',
    });
  }

  return success({
    promoters,
    count: promoters.length,
    message: `${promoters.length} test promoters seeded with submissions.`,
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

  // Get promoter wallet address
  const operator = await env.DB
    .prepare('SELECT evm_wallet_address FROM operators WHERE id = ?')
    .bind(mission.operator_id)
    .first<{ evm_wallet_address: string | null }>();
  const promoterAddress = operator?.evm_wallet_address || '';

  // Treasury address (fee vault for Sepolia hUSD)
  const treasuryAddress = '0x0B9F043D4BcD45B95B72d4D595dEA8a31acdc017';

  // Create payment records (AUF + promoter payout)
  const aufPaymentId = `pay_${generateRandomString(16)}`;
  const payoutPaymentId = `pay_${generateRandomString(16)}`;

  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO payments (id, mission_id, agent_id, operator_id, payment_type,
                            amount_cents, chain, token, status, deadline_at,
                            to_address, created_at, updated_at, payout_mode)
      VALUES (?, ?, ?, ?, 'auf', ?, ?, ?, 'pending', ?, ?, datetime('now'), datetime('now'), 'onchain')
    `).bind(aufPaymentId, submissionId, advertiser.id, mission.operator_id,
            platformFeeCents, chain, payoutToken, payoutDeadline, treasuryAddress),
    env.DB.prepare(`
      INSERT INTO payments (id, mission_id, agent_id, operator_id, payment_type,
                            amount_cents, chain, token, status, deadline_at,
                            to_address, created_at, updated_at, payout_mode)
      VALUES (?, ?, ?, ?, 'payout', ?, ?, ?, 'pending', ?, ?, datetime('now'), datetime('now'), 'onchain')
    `).bind(payoutPaymentId, submissionId, advertiser.id, mission.operator_id,
            promoterPayoutCents, chain, payoutToken, payoutDeadline, promoterAddress)
  ]);

  return success({
    submission_id: submissionId,
    payout_status: 'pending',
    total_amount: (rewardAmountCents / 100).toFixed(2),
    auf_amount_cents: platformFeeCents,
    payout_amount_cents: promoterPayoutCents,
    treasury_address: treasuryAddress,
    promoter_address: promoterAddress,
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
    auf_amount_cents: aufPayment?.amount_cents || 0,
    payout_amount_cents: payoutPayment?.amount_cents || 0,
    treasury_address: aufPayment?.to_address || '',
    promoter_address: payoutPayment?.to_address || '',
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
