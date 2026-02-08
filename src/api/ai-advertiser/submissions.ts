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
import { createNotificationWithEmail } from '../../services/email-notifications';
import { verifyTransaction, isTxHashUsed } from '../../services/blockchain';
import { getPayoutConfig, isSimulatedTxHash } from '../../config/payout';
import { transferHusd } from '../../services/onchain';
import { getSubmissionNextActions, getPayoutNextActions } from '../../utils/next-actions';

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
 * Get a single submission by ID
 *
 * GET /api/v1/submissions/:submissionId
 */
export async function handleGetSubmission(
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

  // Get operator info
  const operator = await env.DB
    .prepare('SELECT id, x_handle, display_name, evm_wallet_address FROM operators WHERE id = ?')
    .bind(mission.operator_id)
    .first<{ id: string; x_handle: string | null; display_name: string | null; evm_wallet_address: string | null }>();

  // Get payment records for payout status
  const payments = await env.DB
    .prepare('SELECT payment_type, amount_cents, status, tx_hash, confirmed_at, to_address, chain, token FROM payments WHERE mission_id = ?')
    .bind(submissionId)
    .all();

  const aufPayment = payments.results.find((p: any) => p.payment_type === 'auf') as any;
  const payoutPayment = payments.results.find((p: any) => p.payment_type === 'payout') as any;

  let payoutStatus: string | null = null;
  if (aufPayment || payoutPayment) {
    if (aufPayment?.status === 'confirmed' && payoutPayment?.status === 'confirmed') {
      payoutStatus = 'paid_complete';
    } else if (aufPayment?.status === 'confirmed') {
      payoutStatus = 'paid_partial';
    } else if (aufPayment?.status === 'failed' || payoutPayment?.status === 'failed') {
      payoutStatus = 'failed';
    } else {
      payoutStatus = 'pending';
    }
  }

  // Get deal info
  const deal = await env.DB
    .prepare('SELECT title, reward_amount, metadata FROM deals WHERE id = ?')
    .bind(mission.deal_id)
    .first<{ title: string; reward_amount: number; metadata: string | null }>();

  return success({
    submission_id: mission.id,
    mission_id: mission.deal_id,
    mission_title: deal?.title || null,
    operator: {
      id: operator?.id || mission.operator_id,
      x_handle: operator?.x_handle ? operator.x_handle.replace(/^@+/, '') : null,
      display_name: operator?.display_name || null,
      evm_wallet_address: operator?.evm_wallet_address || null,
    },
    submission_url: mission.submission_url || null,
    submission_content: mission.submission_content || null,
    status: mission.status,
    submitted_at: mission.submitted_at || null,
    verified_at: mission.verified_at || null,
    approved_at: mission.approved_at || null,
    rejected_at: mission.status === 'rejected' ? mission.updated_at : null,
    rejection_reason: mission.status === 'rejected' ? mission.verification_result : null,
    payout_status: payoutStatus,
    payout_deadline_at: mission.payout_deadline_at || null,
    reward_amount: deal ? (deal.reward_amount / 100).toFixed(2) : null,
    payments: (aufPayment || payoutPayment) ? {
      platform_fee: aufPayment ? {
        amount: (aufPayment.amount_cents / 100).toFixed(2),
        status: aufPayment.status,
        tx_hash: aufPayment.tx_hash || null,
        confirmed_at: aufPayment.confirmed_at || null,
      } : null,
      promoter_payout: payoutPayment ? {
        amount: (payoutPayment.amount_cents / 100).toFixed(2),
        status: payoutPayment.status,
        tx_hash: payoutPayment.tx_hash || null,
        confirmed_at: payoutPayment.confirmed_at || null,
      } : null,
    } : null,
    next_actions: getSubmissionNextActions(mission.status, mission.id),
  }, requestId);
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

  // Derive payout_status from mission status
  const derivePayoutStatus = (status: string): string | null => {
    if (status === 'approved') return 'pending';
    if (status === 'paid_partial') return 'paid_partial';
    if (status === 'paid_complete') return 'paid_complete';
    if (status === 'overdue') return 'overdue';
    return null;
  };

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
    payout_status: derivePayoutStatus(m.status),
    next_actions: getSubmissionNextActions(m.status, m.id),
  }));

  return success({
    submissions,
    total: total?.cnt || 0,
    has_more: (offset + limit) < (total?.cnt || 0)
  }, requestId);
}

// Test promoter profiles (same as advertiser/test.ts)
// ── Random test promoter generator ──
const FIRST_NAMES = [
  'Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Hiro',
  'Ivy', 'Jake', 'Kira', 'Leo', 'Maya', 'Noah', 'Olivia', 'Pete',
  'Quinn', 'Ruby', 'Sam', 'Tina', 'Uma', 'Vince', 'Wendy', 'Xander',
  'Yuki', 'Zara', 'Aiden', 'Bella', 'Chase', 'Diana', 'Ethan', 'Faye',
  'Gabe', 'Hana', 'Isaac', 'Jade', 'Kai', 'Luna', 'Max', 'Nina',
  'Oscar', 'Pia', 'Reed', 'Sofia', 'Tyler', 'Uma', 'Vera', 'Wade',
  'Xena', 'Yara',
];
const TAGS = [
  'web3', 'crypto', 'defi', 'nft', 'dao', 'ai', 'dev', 'builder',
  'trader', 'alpha', 'ape', 'degen', 'hodl', 'punk', 'moon',
  'chain', 'block', 'token', 'eth', 'sol', 'based', 'anon', 'ser',
  'gm', 'wagmi',
];
const TITLES = [
  'Creator', 'Enthusiast', 'Analyst', 'Builder', 'Influencer',
  'Researcher', 'Writer', 'Promoter', 'Trader', 'Developer',
  'Strategist', 'Advocate', 'Educator', 'Curator', 'Pioneer',
];
const BIOS = [
  'Building the future of decentralized advertising.',
  'Daily crypto analysis & insights.',
  'DeFi researcher exploring the frontier.',
  'NFT & crypto influencer. Quality content always.',
  'Blockchain developer & technical writer.',
  'Web3 native. Passionate about onchain culture.',
  'Full-time degen, part-time analyst.',
  'Community builder & content creator.',
  'Exploring the intersection of AI and crypto.',
  'On a mission to make Web3 accessible to everyone.',
  'Tokenomics nerd. Thread game strong.',
  'Alpha hunter. NFA. DYOR.',
  'Bridging TradFi and DeFi one post at a time.',
  'Shitposting my way through the bear market.',
  'Building in public. Shipping daily.',
  'Professional bag holder & part-time educator.',
  'Making crypto simple for normies.',
  'DAO contributor & governance enthusiast.',
  'Smart contract auditor turned content creator.',
  'Onchain since 2017. Still learning.',
];

function generateTestPromoters(count: number): typeof FIRST_NAMES extends (infer _)[] ? any[] : never {
  const promoters: any[] = [];
  const usedNames = new Set<string>();
  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    } while (usedNames.has(name) && usedNames.size < FIRST_NAMES.length);
    usedNames.add(name);

    const tag = TAGS[Math.floor(Math.random() * TAGS.length)];
    const title = TITLES[Math.floor(Math.random() * TITLES.length)];
    const bio = BIOS[Math.floor(Math.random() * BIOS.length)];
    const handle = `${name.toLowerCase()}_${tag}`;
    const followers = Math.floor(Math.random() * 200000) + 500;
    const tweets = Math.floor(Math.random() * 20000) + 100;
    const verified = Math.random() > 0.5 ? 1 : 0;
    const completed = Math.floor(Math.random() * 60);
    const earnings = completed * Math.floor(Math.random() * 800 + 200);
    // Generate random hex address (lowercase, no checksum issues)
    const addrBytes = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
    const statusId = (1800000000000000000n + BigInt(Math.floor(Math.random() * 99999999999))).toString();

    promoters.push({
      id: `op_test_${handle}_${i}`,
      x_handle: handle,
      x_user_id: `test_${handle}_${String(i).padStart(3, '0')}`,
      display_name: completed > 30 ? `${name} | ${title}` : name,
      evm_wallet_address: `0x${addrBytes}`,
      x_followers_count: followers,
      x_tweet_count: tweets,
      x_verified: verified,
      total_missions_completed: completed,
      total_earnings: earnings,
      x_description: `${bio} ${followers > 50000 ? followers.toLocaleString() + '+ community.' : ''}`,
      submission_url: `https://x.com/${handle}/status/${statusId}`,
    });
  }
  return promoters;
}

/**
 * Seed test promoters & submissions (test mode only)
 *
 * POST /api/v1/missions/:dealId/test-submission
 *
 * Creates 50 randomized simulated promoter submissions so the advertiser can
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
  const TEST_PROMOTERS = generateTestPromoters(50);

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

  // Notify operator
  const dealForVerify = await env.DB.prepare('SELECT title FROM deals WHERE id = ?')
    .bind(mission.deal_id).first<{ title: string }>();
  await createNotificationWithEmail(env.DB, env, {
    recipientId: mission.operator_id,
    type: 'submission_verified',
    title: 'Submission Verified',
    body: `Your submission for '${dealForVerify?.title || 'a mission'}' has been verified`,
    referenceType: 'mission',
    referenceId: submissionId,
    metadata: { deal_title: dealForVerify?.title, deal_id: mission.deal_id },
  });

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
    },
    next_actions: getSubmissionNextActions('verified', submissionId),
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

  // Notify operator
  const dealForReject = await env.DB.prepare('SELECT title FROM deals WHERE id = ?')
    .bind(mission.deal_id).first<{ title: string }>();
  await createNotificationWithEmail(env.DB, env, {
    recipientId: mission.operator_id,
    type: 'submission_rejected',
    title: 'Submission Needs Revision',
    body: `Your submission for '${dealForReject?.title || 'a mission'}' needs revision`,
    referenceType: 'mission',
    referenceId: submissionId,
    metadata: { deal_title: dealForReject?.title, deal_id: mission.deal_id, reason: body.reason.trim() },
  });

  return success({
    submission_id: submissionId,
    status: 'rejected',
    rejected_at: new Date().toISOString(),
    reason: body.reason.trim(),
    next_actions: [
      {
        action: 'review_other_submissions',
        method: 'GET',
        endpoint: `/api/v1/missions/${mission.deal_id}/submissions?status=submitted`,
        description: 'Review other pending submissions for this mission',
      },
    ],
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

  // Notify operator
  const dealForPayout = await env.DB.prepare('SELECT title FROM deals WHERE id = ?')
    .bind(mission.deal_id).first<{ title: string }>();
  await createNotificationWithEmail(env.DB, env, {
    recipientId: mission.operator_id,
    type: 'submission_approved',
    title: 'Submission Approved',
    body: `Your submission for '${dealForPayout?.title || 'a mission'}' has been approved. Payout will be processed soon.`,
    referenceType: 'mission',
    referenceId: submissionId,
    metadata: { deal_title: dealForPayout?.title, deal_id: mission.deal_id, amount: (promoterPayoutCents / 100).toFixed(2) },
  });

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
    payout_deadline_at: payoutDeadline,
    next_actions: [
      {
        action: 'execute_payout',
        method: 'POST',
        endpoint: `/api/v1/submissions/${submissionId}/payout/execute`,
        description: 'Execute payout server-side (recommended for sandboxed agents)',
      },
      {
        action: 'manual_payout',
        method: 'POST',
        endpoint: `/api/v1/submissions/${submissionId}/payout/report`,
        description: 'Report on-chain tx_hash after sending manually',
      },
    ],
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
      ? payoutPayment.confirmed_at : null,
    next_actions: getPayoutNextActions(payoutStatus, submissionId),
  }, requestId);
}

/**
 * Report a payment tx_hash (after advertiser sends on-chain)
 *
 * POST /api/v1/submissions/:submissionId/payout/report
 *
 * Body: { payment_type: 'auf' | 'payout', tx_hash: '0x...' }
 */
export async function handleReportPayment(
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

  let body: { payment_type: string; tx_hash: string };
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON');
  }

  if (!body.payment_type || (body.payment_type !== 'auf' && body.payment_type !== 'payout')) {
    return errors.badRequest(requestId, 'payment_type must be "auf" or "payout"');
  }
  if (!body.tx_hash || typeof body.tx_hash !== 'string') {
    return errors.badRequest(requestId, 'tx_hash must be a valid transaction hash');
  }

  // Determine payout mode
  const payoutConfig = getPayoutConfig(env);
  const payoutMode = payoutConfig.mode;

  // Reject simulated hashes in onchain mode
  if (payoutMode === 'onchain' && isSimulatedTxHash(body.tx_hash)) {
    return errors.badRequest(requestId, 'Simulated transaction hashes are not allowed in onchain mode');
  }

  if (payoutMode === 'onchain') {
    // Validate hash format
    if (!body.tx_hash.startsWith('0x')) {
      return errors.badRequest(requestId, 'tx_hash must be a valid transaction hash starting with 0x');
    }

    // Check for replay (same tx_hash already used)
    const chain = body.chain || 'sepolia';
    const txUsed = await isTxHashUsed(env.DB, body.tx_hash, chain);
    if (txUsed) {
      return errors.badRequest(requestId, 'This transaction hash has already been used for another payment');
    }

    // On-chain verification
    const deal = await env.DB.prepare('SELECT reward_amount, auf_percentage FROM deals WHERE id = ?')
      .bind(mission.deal_id).first<{ reward_amount: number; auf_percentage: number }>();
    if (deal) {
      const aufPct = deal.auf_percentage || 10;
      const expectedAmount = body.payment_type === 'auf'
        ? Math.floor((deal.reward_amount * aufPct) / 100)
        : deal.reward_amount - Math.floor((deal.reward_amount * aufPct) / 100);

      // Look up expected recipient
      let expectedRecipient: string | null = null;
      if (body.payment_type === 'payout') {
        const op = await env.DB.prepare('SELECT evm_wallet_address FROM operators WHERE id = ?')
          .bind(mission.operator_id).first<{ evm_wallet_address: string | null }>();
        expectedRecipient = op?.evm_wallet_address || null;
      }
      // For AUF, recipient is the platform treasury (skip recipient check if unknown)

      if (expectedRecipient || body.payment_type === 'auf') {
        const verification = await verifyTransaction(
          body.tx_hash, chain, expectedRecipient || '', expectedAmount, body.token || 'hUSD'
        );
        if (!verification.verified) {
          return errors.badRequest(requestId, `Transaction verification failed: ${verification.error || 'unknown error'}`);
        }
      }
    }
  } else {
    // Ledger mode: accept any hash format for simulated payments
    console.log(`[Ledger Mode] Simulated payment report: ${body.tx_hash}`);
  }

  // Update the payment record
  await env.DB
    .prepare(`
      UPDATE payments
      SET tx_hash = ?, status = 'confirmed', confirmed_at = datetime('now'), updated_at = datetime('now')
      WHERE mission_id = ? AND payment_type = ?
    `)
    .bind(body.tx_hash, submissionId, body.payment_type)
    .run();

  // Check if both payments are now confirmed
  const payments = await env.DB
    .prepare('SELECT payment_type, status FROM payments WHERE mission_id = ?')
    .bind(submissionId)
    .all();

  const allConfirmed = payments.results.length > 0 &&
    payments.results.every((p: any) => p.status === 'confirmed');

  if (allConfirmed) {
    await env.DB
      .prepare(`UPDATE missions SET status = 'paid_complete', updated_at = datetime('now') WHERE id = ?`)
      .bind(submissionId)
      .run();
  } else if (body.payment_type === 'auf') {
    await env.DB
      .prepare(`UPDATE missions SET status = 'paid_partial', updated_at = datetime('now') WHERE id = ?`)
      .bind(submissionId)
      .run();
  }

  // Notify operator about payment
  if (allConfirmed) {
    const dealForPayment = await env.DB.prepare('SELECT d.title, d.reward_amount FROM deals d JOIN missions m ON m.deal_id = d.id WHERE m.id = ?')
      .bind(submissionId).first<{ title: string; reward_amount: number }>();
    await createNotificationWithEmail(env.DB, env, {
      recipientId: mission.operator_id,
      type: 'payout_confirmed',
      title: 'Payment Complete',
      body: `Payment of ${dealForPayment ? (dealForPayment.reward_amount / 100).toFixed(2) : '?'} hUSD for '${dealForPayment?.title || 'a mission'}' is complete`,
      referenceType: 'mission',
      referenceId: submissionId,
      metadata: { deal_title: dealForPayment?.title, amount: dealForPayment ? (dealForPayment.reward_amount / 100).toFixed(2) : null },
    });
  } else if (body.payment_type === 'auf') {
    const dealForAuf = await env.DB.prepare('SELECT title FROM deals WHERE id = ?')
      .bind(mission.deal_id).first<{ title: string }>();
    await createNotificationWithEmail(env.DB, env, {
      recipientId: mission.operator_id,
      type: 'payout_auf_paid',
      title: 'Payment Initiated',
      body: `Payment initiated for '${dealForAuf?.title || 'a mission'}'`,
      referenceType: 'mission',
      referenceId: submissionId,
      metadata: { deal_title: dealForAuf?.title, deal_id: mission.deal_id },
    });
  }

  return success({
    payment_type: body.payment_type,
    tx_hash: body.tx_hash,
    status: 'confirmed',
    all_complete: allConfirmed,
    next_actions: allConfirmed
      ? [{ action: 'submit_review', method: 'POST', endpoint: `/api/v1/submissions/${submissionId}/review`, description: 'Rate this promoter (1-5 stars, double-blind)' }]
      : [{ action: 'report_next_payment', method: 'POST', endpoint: `/api/v1/submissions/${submissionId}/payout/report`, description: 'Report the remaining payment tx_hash' }],
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

/**
 * Execute payout server-side (for AI agents in sandboxed environments)
 *
 * POST /api/v1/submissions/:submissionId/payout/execute
 *
 * This endpoint handles the entire payout flow server-side:
 * 1. Triggers payout if not already triggered
 * 2. Sends hUSD from treasury to promoter
 * 3. Auto-reports tx_hashes
 * 4. Returns completed payout status
 *
 * Only available for test mode (hUSD on Sepolia).
 */
export async function handleExecutePayout(
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

  // Only test mode (hUSD) supported
  let payoutToken = 'hUSD';
  try {
    if (mission._deal.metadata) {
      const meta = JSON.parse(mission._deal.metadata);
      payoutToken = meta.payout_token || 'hUSD';
    }
  } catch { /* ignore */ }

  if (payoutToken !== 'hUSD') {
    return error('TEST_MODE_ONLY', 'Server-side payout execution is only available for test mode (hUSD). Production payouts require on-chain transactions.', requestId, 400);
  }

  // Check valid statuses: verified (not yet triggered), approved/paid_partial (already triggered but not complete)
  const validStatuses = ['verified', 'approved', 'address_unlocked', 'paid_partial'];
  if (!validStatuses.includes(mission.status)) {
    if (mission.status === 'paid_complete') {
      return error('ALREADY_PAID', 'Payout already completed for this submission', requestId, 409);
    }
    return error('NOT_VERIFIED', 'Submission must be verified before payout can be executed', requestId, 400);
  }

  const rewardAmountCents = mission._deal.reward_amount;
  const platformFeeCents = Math.round(rewardAmountCents * 0.10);
  const promoterPayoutCents = rewardAmountCents - platformFeeCents;
  const treasuryAddress = '0x0B9F043D4BcD45B95B72d4D595dEA8a31acdc017';

  // Get promoter wallet address
  const operator = await env.DB
    .prepare('SELECT evm_wallet_address FROM operators WHERE id = ?')
    .bind(mission.operator_id)
    .first<{ evm_wallet_address: string | null }>();
  const promoterAddress = operator?.evm_wallet_address || '';

  if (!promoterAddress) {
    return error('NO_WALLET', 'Promoter has not set up a payout wallet address', requestId, 400);
  }

  // Step 1: If still in 'verified' status, trigger payout first (create payment records)
  if (mission.status === 'verified') {
    const deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours() + 72);
    const payoutDeadline = deadlineDate.toISOString();

    const aufPaymentId = `pay_${generateRandomString(16)}`;
    const payoutPaymentId = `pay_${generateRandomString(16)}`;

    await env.DB.batch([
      env.DB.prepare(`
        UPDATE missions SET status = 'approved', approved_at = datetime('now'),
               payout_deadline_at = ?, updated_at = datetime('now') WHERE id = ?
      `).bind(payoutDeadline, submissionId),
      env.DB.prepare(`
        INSERT INTO payments (id, mission_id, agent_id, operator_id, payment_type,
                              amount_cents, chain, token, status, deadline_at,
                              to_address, created_at, updated_at, payout_mode)
        VALUES (?, ?, ?, ?, 'auf', ?, 'sepolia', 'hUSD', 'pending', ?, ?, datetime('now'), datetime('now'), 'onchain')
      `).bind(aufPaymentId, submissionId, advertiser.id, mission.operator_id,
              platformFeeCents, payoutDeadline, treasuryAddress),
      env.DB.prepare(`
        INSERT INTO payments (id, mission_id, agent_id, operator_id, payment_type,
                              amount_cents, chain, token, status, deadline_at,
                              to_address, created_at, updated_at, payout_mode)
        VALUES (?, ?, ?, ?, 'payout', ?, 'sepolia', 'hUSD', 'pending', ?, ?, datetime('now'), datetime('now'), 'onchain')
      `).bind(payoutPaymentId, submissionId, advertiser.id, mission.operator_id,
              promoterPayoutCents, payoutDeadline, promoterAddress)
    ]);

    // Send approval notification
    const dealForNotif = await env.DB.prepare('SELECT title FROM deals WHERE id = ?')
      .bind(mission.deal_id).first<{ title: string }>();
    await createNotificationWithEmail(env.DB, env, {
      recipientId: mission.operator_id,
      type: 'submission_approved',
      title: 'Submission Approved',
      body: `Your submission for '${dealForNotif?.title || 'a mission'}' has been approved. Payout will be processed soon.`,
      referenceType: 'mission',
      referenceId: submissionId,
      metadata: { deal_title: dealForNotif?.title, deal_id: mission.deal_id, amount: (promoterPayoutCents / 100).toFixed(2) },
    });
  }

  // Step 2: Get pending payment records
  const payments = await env.DB
    .prepare('SELECT id, payment_type, status, tx_hash, amount_cents FROM payments WHERE mission_id = ?')
    .bind(submissionId)
    .all<{ id: string; payment_type: string; status: string; tx_hash: string | null; amount_cents: number }>();

  const aufPayment = payments.results.find(p => p.payment_type === 'auf');
  const payoutPayment = payments.results.find(p => p.payment_type === 'payout');

  if (!aufPayment || !payoutPayment) {
    return errors.internalError(requestId);
  }

  let aufTxHash = aufPayment.tx_hash;
  let payoutTxHash = payoutPayment.tx_hash;

  // Step 3: Send AUF (treasury to treasury — mark as confirmed directly)
  if (aufPayment.status === 'pending') {
    // AUF is treasury-to-treasury in test mode, execute real transfer for record
    const aufResult = await transferHusd(env, treasuryAddress, platformFeeCents);
    aufTxHash = aufResult.txHash || `SERVER_AUF_${generateRandomString(16)}`;

    await env.DB.prepare(`
      UPDATE payments SET status = 'confirmed', tx_hash = ?, confirmed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?
    `).bind(aufTxHash, aufPayment.id).run();
  }

  // Step 4: Send promoter payout from treasury
  if (payoutPayment.status === 'pending') {
    const payoutResult = await transferHusd(env, promoterAddress, promoterPayoutCents);

    if (!payoutResult.success) {
      // AUF confirmed but payout failed — mark as paid_partial
      await env.DB.prepare(`UPDATE missions SET status = 'paid_partial', updated_at = datetime('now') WHERE id = ?`)
        .bind(submissionId).run();
      return error('PAYOUT_FAILED', `Server-side payout failed: ${payoutResult.error || 'unknown error'}. AUF was processed. Retry this endpoint to complete.`, requestId, 502);
    }

    payoutTxHash = payoutResult.txHash || null;

    await env.DB.prepare(`
      UPDATE payments SET status = 'confirmed', tx_hash = ?, confirmed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?
    `).bind(payoutTxHash, payoutPayment.id).run();
  }

  // Step 5: Mark mission as paid_complete
  await env.DB.batch([
    env.DB.prepare(`
      UPDATE missions SET status = 'paid_complete', paid_at = datetime('now'), updated_at = datetime('now') WHERE id = ?
    `).bind(submissionId),
    env.DB.prepare(`
      UPDATE operators SET total_earnings = total_earnings + ?, updated_at = datetime('now') WHERE id = ?
    `).bind(promoterPayoutCents, mission.operator_id),
  ]);

  // Notify promoter
  const dealForComplete = await env.DB.prepare('SELECT title FROM deals WHERE id = ?')
    .bind(mission.deal_id).first<{ title: string }>();
  await createNotificationWithEmail(env.DB, env, {
    recipientId: mission.operator_id,
    type: 'payout_complete',
    title: 'Payment Complete',
    body: `Payment of ${(promoterPayoutCents / 100).toFixed(2)} hUSD for '${dealForComplete?.title || 'a mission'}' has been sent to your wallet.`,
    referenceType: 'mission',
    referenceId: submissionId,
    metadata: { deal_title: dealForComplete?.title, deal_id: mission.deal_id, amount: (promoterPayoutCents / 100).toFixed(2), tx_hash: payoutTxHash },
  });

  return success({
    submission_id: submissionId,
    payout_status: 'paid_complete',
    total_amount: (rewardAmountCents / 100).toFixed(2),
    token: 'hUSD',
    chain: 'sepolia',
    breakdown: {
      platform_fee: {
        amount: (platformFeeCents / 100).toFixed(2),
        status: 'confirmed',
        tx_hash: aufTxHash
      },
      promoter_payout: {
        amount: (promoterPayoutCents / 100).toFixed(2),
        status: 'confirmed',
        tx_hash: payoutTxHash
      }
    },
    message: 'Payout executed server-side. Promoter has been paid.',
    next_actions: [
      {
        action: 'submit_review',
        method: 'POST',
        endpoint: `/api/v1/submissions/${submissionId}/review`,
        description: 'Rate this promoter (1-5 stars, double-blind)',
      },
    ],
  }, requestId);
}
