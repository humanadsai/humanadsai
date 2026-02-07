/**
 * Advertiser Test API
 *
 * Backend for /advertiser/test page.
 * Uses direct DB operations for testing the full AI Advertiser E2E payment flow.
 * No external secrets required - works out of the box for admin users.
 */

import type { Env, Deal, Mission, Application, Operator, Agent, PayoutMode } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { requireAdmin } from '../../middleware/admin';
import { getPayoutConfig, isSimulatedTxHash } from '../../config/payout';
import { normalizeAddress } from '../../services/onchain';

// Treasury/Fee Vault addresses
const FEE_VAULT_ADDRESSES: Record<string, string> = {
  ethereum: '0x5acd3371DB99f7D17DFaFD14b522148260862DE8',
  polygon: '0x5acd3371DB99f7D17DFaFD14b522148260862DE8',
  base: '0x5acd3371DB99f7D17DFaFD14b522148260862DE8',
  sepolia: '0x5acd3371DB99f7D17DFaFD14b522148260862DE8',
  base_sepolia: '0x5acd3371DB99f7D17DFaFD14b522148260862DE8',
  solana: '5xQeP26JTDyyUCdG7Sq63vyCWgEbATewCj5N2P7H5X8A',
  solana_devnet: '5xQeP26JTDyyUCdG7Sq63vyCWgEbATewCj5N2P7H5X8A',
};

// Testnet chain configurations for wallet deep links
const TESTNET_CHAINS: Record<string, { chainId: number; name: string; usdcAddress: string }> = {
  base_sepolia: {
    chainId: 84532,
    name: 'Base Sepolia',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  },
};

// Default AUF percentage
const DEFAULT_AUF_PERCENTAGE = 10;
const DEFAULT_PAYOUT_DEADLINE_HOURS = 72;

/**
 * Handle all advertiser test API routes
 */
export async function handleAdvertiserTestApi(
  request: Request,
  env: Env,
  path: string,
  method: string
): Promise<Response> {
  const subPath = path.replace('/api/advertiser/test', '') || '/';

  // GET /api/advertiser/test/environment
  if (subPath === '/environment' && method === 'GET') {
    return getEnvironment(request, env);
  }

  // POST /api/advertiser/test/deals/create
  if (subPath === '/deals/create' && method === 'POST') {
    return createTestDeal(request, env);
  }

  // POST /api/advertiser/test/seed
  if (subPath === '/seed' && method === 'POST') {
    return seedTestData(request, env);
  }

  // POST /api/advertiser/test/applications/:id/select
  const selectMatch = subPath.match(/^\/applications\/([a-zA-Z0-9_]+)\/select$/);
  if (selectMatch && method === 'POST') {
    return selectTestApplication(request, env, selectMatch[1]);
  }

  // POST /api/advertiser/test/applications/:id/approve
  const approveMatch = subPath.match(/^\/applications\/([a-zA-Z0-9_]+)\/approve$/);
  if (approveMatch && method === 'POST') {
    return approveTestMission(request, env, approveMatch[1]);
  }

  // POST /api/advertiser/test/applications/:id/unlock-address
  const unlockMatch = subPath.match(/^\/applications\/([a-zA-Z0-9_]+)\/unlock-address$/);
  if (unlockMatch && method === 'POST') {
    return unlockTestAddress(request, env, unlockMatch[1]);
  }

  // POST /api/advertiser/test/applications/:id/confirm-payout
  const confirmMatch = subPath.match(/^\/applications\/([a-zA-Z0-9_]+)\/confirm-payout$/);
  if (confirmMatch && method === 'POST') {
    return confirmTestPayout(request, env, confirmMatch[1]);
  }

  return errors.notFound(generateRequestId(), 'Endpoint');
}

/**
 * GET /api/advertiser/test/environment
 */
async function getEnvironment(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;
  const payoutConfig = getPayoutConfig(env);

  // Get or create test agent
  let testAgent = await env.DB.prepare(
    `SELECT id, name, status FROM agents WHERE id = 'agent_test_advertiser' LIMIT 1`
  ).first<{ id: string; name: string; status: string }>();

  if (!testAgent) {
    await env.DB.prepare(
      `INSERT INTO agents (id, name, email, status, description)
       VALUES ('agent_test_advertiser', 'Test Advertiser', 'test@advertiser.humanads', 'approved', 'Auto-created for /advertiser/test')`
    ).run();
    testAgent = { id: 'agent_test_advertiser', name: 'Test Advertiser', status: 'approved' };
  }

  return success({
    environment: env.ENVIRONMENT || 'development',
    payout_mode: payoutConfig.mode,
    test_agent: testAgent,
    chains: {
      sepolia: TESTNET_CHAINS.sepolia,
    },
    treasury_address: FEE_VAULT_ADDRESSES.sepolia,
    ready: true,
  }, requestId);
}

/**
 * POST /api/advertiser/test/deals/create
 * Creates a test deal directly in DB
 */
async function createTestDeal(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<{ reward_amount?: number; chain?: string }>();
    const rewardAmount = body.reward_amount || 500;
    // Normalize chain to sepolia (only supported testnet)
    const chain = (body.chain === 'sepolia' || !body.chain) ? 'sepolia' : 'sepolia';

    // Ensure test agent exists
    let agent = await env.DB.prepare(
      `SELECT id FROM agents WHERE id = 'agent_test_advertiser'`
    ).first<{ id: string }>();

    if (!agent) {
      await env.DB.prepare(
        `INSERT INTO agents (id, name, email, status, description)
         VALUES ('agent_test_advertiser', 'Test Advertiser', 'test@advertiser.humanads', 'approved', 'Auto-created for /advertiser/test')`
      ).run();
      agent = { id: 'agent_test_advertiser' };
    }

    // Create deal
    const dealId = crypto.randomUUID().replace(/-/g, '');
    await env.DB.prepare(
      `INSERT INTO deals (id, agent_id, title, description, requirements, reward_amount, max_participants, status, payment_model, auf_percentage)
       VALUES (?, ?, ?, ?, ?, ?, 1, 'active', 'a_plan', 10)`
    ).bind(
      dealId,
      agent.id,
      `Test Deal - ${new Date().toISOString().slice(0, 16)}`,
      'Advertiser Test Page - E2E Payment Flow',
      JSON.stringify({
        post_type: 'tweet',
        content_template: 'Test post for payment flow verification',
        hashtags: ['HumanAdsTest'],
        verification_method: 'manual',
      }),
      rewardAmount
    ).run();

    const deal = await env.DB.prepare('SELECT * FROM deals WHERE id = ?')
      .bind(dealId)
      .first<Deal>();

    return success({
      deal_id: dealId,
      deal,
      chain,
      message: 'Deal created successfully',
    }, requestId);
  } catch (e) {
    console.error('Create test deal error:', e);
    return errors.internalError(requestId);
  }
}

// Test promoter profiles for seed data
const TEST_PROMOTERS = [
  {
    id: 'op_test_alice',
    x_handle: 'alice_web3',
    x_user_id: 'test_alice_001',
    display_name: 'Alice | Web3 Creator',
    evm_wallet_address: '0x742d35cc6634c0532925a3b844bc9e7595f8fe00',
    x_followers_count: 12400,
    x_following_count: 890,
    x_tweet_count: 3200,
    x_verified: 1,
    x_verified_type: 'blue',
    total_missions_completed: 8,
    total_earnings: 4200, // cents = $42
    x_description: 'Web3 creator & DeFi enthusiast. Building the future of decentralized advertising.',
    proposed_angle: 'Will create a thread explaining HumanAds with real use case examples',
    submission_url: 'https://x.com/alice_web3/status/1234567890',
  },
  {
    id: 'op_test_bob',
    x_handle: 'bob_crypto',
    x_user_id: 'test_bob_002',
    display_name: 'Bob Crypto Daily',
    evm_wallet_address: '0x8ba1f109551bd432803012645ac136ddd64dba72',
    x_followers_count: 45200,
    x_following_count: 1200,
    x_tweet_count: 8900,
    x_verified: 1,
    x_verified_type: 'blue',
    total_missions_completed: 23,
    total_earnings: 15800, // cents = $158
    x_description: 'Daily crypto analysis & insights. 45K+ community. DM for collabs.',
    proposed_angle: 'Short-form video + tweet explaining the AI advertiser flow',
    submission_url: 'https://x.com/bob_crypto/status/2345678901',
  },
  {
    id: 'op_test_carol',
    x_handle: 'carol_defi',
    x_user_id: 'test_carol_003',
    display_name: 'Carol',
    evm_wallet_address: '0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e',
    x_followers_count: 2100,
    x_following_count: 450,
    x_tweet_count: 1100,
    x_verified: 0,
    x_verified_type: null,
    total_missions_completed: 2,
    total_earnings: 1000, // cents = $10
    x_description: 'DeFi researcher. New to promotions but passionate about the space.',
    proposed_angle: 'Personal experience post about using HumanAds as a promoter',
    submission_url: 'https://x.com/carol_defi/status/3456789012',
  },
  {
    id: 'op_test_dave',
    x_handle: 'dave_nft_king',
    x_user_id: 'test_dave_004',
    display_name: 'Dave NFT King',
    evm_wallet_address: '0x4b20993bc481177ec7e8f571cecae8a9e22c02db',
    x_followers_count: 89500,
    x_following_count: 3100,
    x_tweet_count: 15600,
    x_verified: 1,
    x_verified_type: 'blue',
    total_missions_completed: 47,
    total_earnings: 38500, // cents = $385
    x_description: 'NFT & crypto influencer. Top promoter on HumanAds. Always deliver quality.',
    proposed_angle: 'Infographic tweet + quote tweet from my NFT community account',
    submission_url: 'https://x.com/dave_nft_king/status/4567890123',
  },
  {
    id: 'op_test_eve',
    x_handle: 'eve_blockchain',
    x_user_id: 'test_eve_005',
    display_name: 'Eve Blockchain Dev',
    evm_wallet_address: '0x78731d3ca6b7e34ac0f824c42a7cc18a495cabab',
    x_followers_count: 6800,
    x_following_count: 720,
    x_tweet_count: 2400,
    x_verified: 0,
    x_verified_type: null,
    total_missions_completed: 5,
    total_earnings: 2500, // cents = $25
    x_description: 'Blockchain developer & technical writer. I explain complex topics simply.',
    proposed_angle: 'Technical breakdown of HumanAds architecture for dev audience',
    submission_url: 'https://x.com/eve_blockchain/status/5678901234',
  },
];

/**
 * POST /api/advertiser/test/seed
 * Seeds test data: 5 promoters with applications and missions
 */
async function seedTestData(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<{ deal_id: string }>();

    if (!body.deal_id) {
      return errors.invalidRequest(requestId, { message: 'deal_id is required' });
    }

    const deal = await env.DB.prepare('SELECT * FROM deals WHERE id = ?')
      .bind(body.deal_id)
      .first<Deal>();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    const applicants: Array<{
      operator_id: string;
      application_id: string;
      mission_id: string;
      x_handle: string;
      display_name: string;
      evm_wallet_address: string;
      x_followers_count: number;
      x_following_count: number;
      x_tweet_count: number;
      x_verified: number;
      x_verified_type: string | null;
      total_missions_completed: number;
      total_earnings: number;
      x_description: string;
      proposed_angle: string;
      submission_url: string;
    }> = [];

    for (const p of TEST_PROMOTERS) {
      // 1. Create or update test operator
      const existing = await env.DB.prepare('SELECT id FROM operators WHERE id = ?')
        .bind(p.id)
        .first<{ id: string }>();

      if (!existing) {
        await env.DB.prepare(
          `INSERT INTO operators (id, x_handle, x_user_id, display_name, status, role, evm_wallet_address, verified_at,
            x_followers_count, x_following_count, x_tweet_count, x_verified, x_verified_type,
            total_missions_completed, total_earnings, x_description)
           VALUES (?, ?, ?, ?, 'verified', 'user', ?, datetime('now'),
            ?, ?, ?, ?, ?,
            ?, ?, ?)`
        ).bind(
          p.id, p.x_handle, p.x_user_id, p.display_name, p.evm_wallet_address,
          p.x_followers_count, p.x_following_count, p.x_tweet_count, p.x_verified, p.x_verified_type,
          p.total_missions_completed, p.total_earnings, p.x_description
        ).run();
      } else {
        await env.DB.prepare(
          `UPDATE operators SET
            x_followers_count = ?, x_following_count = ?, x_tweet_count = ?,
            x_verified = ?, x_verified_type = ?,
            total_missions_completed = ?, total_earnings = ?,
            x_description = ?, display_name = ?
           WHERE id = ?`
        ).bind(
          p.x_followers_count, p.x_following_count, p.x_tweet_count,
          p.x_verified, p.x_verified_type,
          p.total_missions_completed, p.total_earnings,
          p.x_description, p.display_name,
          p.id
        ).run();
      }

      // 2. Create application
      const applicationId = crypto.randomUUID().replace(/-/g, '');
      await env.DB.prepare(
        `INSERT INTO applications (id, deal_id, operator_id, status, proposed_angle, accept_disclosure, accept_no_engagement_buying, applied_at)
         VALUES (?, ?, ?, 'applied', ?, 1, 1, datetime('now'))`
      ).bind(applicationId, body.deal_id, p.id, p.proposed_angle).run();

      // 3. Create mission with status=verified (ready for approval)
      const missionId = crypto.randomUUID().replace(/-/g, '');
      await env.DB.prepare(
        `INSERT INTO missions (id, deal_id, operator_id, status, submission_url, submitted_at, verified_at)
         VALUES (?, ?, ?, 'verified', ?, datetime('now'), datetime('now'))`
      ).bind(missionId, body.deal_id, p.id, p.submission_url).run();

      applicants.push({
        operator_id: p.id,
        application_id: applicationId,
        mission_id: missionId,
        x_handle: p.x_handle,
        display_name: p.display_name,
        evm_wallet_address: p.evm_wallet_address,
        x_followers_count: p.x_followers_count,
        x_following_count: p.x_following_count,
        x_tweet_count: p.x_tweet_count,
        x_verified: p.x_verified,
        x_verified_type: p.x_verified_type,
        total_missions_completed: p.total_missions_completed,
        total_earnings: p.total_earnings,
        x_description: p.x_description,
        proposed_angle: p.proposed_angle,
        submission_url: p.submission_url,
      });
    }

    return success({
      applicants,
      count: applicants.length,
      message: `${applicants.length} test promoters seeded with applications.`,
    }, requestId);
  } catch (e) {
    console.error('Seed test data error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/advertiser/test/applications/:id/select
 * Marks application as selected (usually already done by seed)
 */
async function selectTestApplication(
  request: Request,
  env: Env,
  applicationId: string
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const app = await env.DB.prepare('SELECT * FROM applications WHERE id = ?')
      .bind(applicationId)
      .first<Application>();

    if (!app) {
      return errors.notFound(requestId, 'Application');
    }

    if (app.status === 'selected') {
      return success({ status: 'already_selected', application_id: applicationId }, requestId);
    }

    await env.DB.prepare(
      `UPDATE applications SET status = 'selected', selected_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    ).bind(applicationId).run();

    return success({ status: 'selected', application_id: applicationId }, requestId);
  } catch (e) {
    console.error('Select application error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/advertiser/test/applications/:id/approve
 * Approves mission for payment (VERIFIED → APPROVED)
 */
async function approveTestMission(
  request: Request,
  env: Env,
  applicationId: string
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    // Get application with mission and deal info
    const appData = await env.DB.prepare(
      `SELECT a.*, m.id as mission_id, m.status as mission_status, m.operator_id,
              d.id as deal_id, d.reward_amount, d.auf_percentage
       FROM applications a
       JOIN missions m ON m.deal_id = a.deal_id AND m.operator_id = a.operator_id
       JOIN deals d ON a.deal_id = d.id
       WHERE a.id = ?`
    ).bind(applicationId).first<{
      mission_id: string;
      mission_status: string;
      operator_id: string;
      deal_id: string;
      reward_amount: number;
      auf_percentage: number;
    }>();

    if (!appData) {
      return errors.notFound(requestId, 'Application or Mission');
    }

    if (appData.mission_status !== 'verified') {
      return errors.invalidRequest(requestId, {
        message: `Mission status is '${appData.mission_status}', must be 'verified' to approve`,
      });
    }

    // Calculate amounts
    const aufPercentage = appData.auf_percentage || DEFAULT_AUF_PERCENTAGE;
    const aufAmountCents = Math.floor((appData.reward_amount * aufPercentage) / 100);
    const payoutAmountCents = appData.reward_amount - aufAmountCents;

    // Calculate deadline
    const now = new Date();
    const deadlineAt = new Date(now.getTime() + DEFAULT_PAYOUT_DEADLINE_HOURS * 60 * 60 * 1000);

    // Get payout mode
    const payoutConfig = getPayoutConfig(env);
    const payoutMode: PayoutMode = payoutConfig.mode;

    // Update mission
    await env.DB.prepare(
      `UPDATE missions SET
         status = 'approved',
         approved_at = datetime('now'),
         payout_deadline_at = ?,
         updated_at = datetime('now')
       WHERE id = ?`
    ).bind(deadlineAt.toISOString(), appData.mission_id).run();

    // Create AUF payment record
    const paymentId = crypto.randomUUID().replace(/-/g, '');
    await env.DB.prepare(
      `INSERT INTO payments (id, mission_id, agent_id, operator_id, payment_type, amount_cents, chain, token, status, payout_mode, deadline_at)
       VALUES (?, ?, 'agent_test_advertiser', ?, 'auf', ?, 'pending', 'pending', 'pending', ?, ?)`
    ).bind(paymentId, appData.mission_id, appData.operator_id, aufAmountCents, payoutMode, deadlineAt.toISOString()).run();

    // Build payment info (Sepolia only)
    const chainInfo = TESTNET_CHAINS.sepolia;
    const treasury = FEE_VAULT_ADDRESSES.sepolia;
    const amountMicroUsdc = aufAmountCents * 10000;
    const walletDeepLink = `ethereum:${chainInfo.usdcAddress}@${chainInfo.chainId}/transfer?address=${treasury}&uint256=${amountMicroUsdc}`;

    return success({
      mission_id: appData.mission_id,
      status: 'approved',
      approved_at: now.toISOString(),
      payout_deadline_at: deadlineAt.toISOString(),
      auf_amount_cents: aufAmountCents,
      payout_amount_cents: payoutAmountCents,
      auf_percentage: aufPercentage,
      payout_mode: payoutMode,
      fee_vault_addresses: { evm: treasury },
      payment_info: {
        chain: 'sepolia',
        chain_id: chainInfo.chainId,
        token: 'USDC',
        token_address: chainInfo.usdcAddress,
        to_address: treasury,
        amount_cents: aufAmountCents,
        amount_micro_usdc: amountMicroUsdc,
        wallet_deep_link: walletDeepLink,
      },
    }, requestId);
  } catch (e) {
    console.error('Approve mission error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/advertiser/test/applications/:id/unlock-address
 * Verifies AUF payment and unlocks promoter wallet address
 */
async function unlockTestAddress(
  request: Request,
  env: Env,
  applicationId: string
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<{
      auf_tx_hash: string;
      chain: string;
      token: string;
    }>();

    if (!body.auf_tx_hash || !body.chain || !body.token) {
      return errors.invalidRequest(requestId, {
        message: 'auf_tx_hash, chain, and token are required',
      });
    }

    // Get application with mission and operator info
    const appData = await env.DB.prepare(
      `SELECT a.*, m.id as mission_id, m.status as mission_status, m.payout_deadline_at,
              d.reward_amount, d.auf_percentage,
              o.evm_wallet_address
       FROM applications a
       JOIN missions m ON m.deal_id = a.deal_id AND m.operator_id = a.operator_id
       JOIN deals d ON a.deal_id = d.id
       JOIN operators o ON a.operator_id = o.id
       WHERE a.id = ?`
    ).bind(applicationId).first<{
      mission_id: string;
      mission_status: string;
      payout_deadline_at: string;
      operator_id: string;
      reward_amount: number;
      auf_percentage: number;
      evm_wallet_address: string;
    }>();

    if (!appData) {
      return errors.notFound(requestId, 'Application or Mission');
    }

    if (appData.mission_status !== 'approved') {
      return errors.invalidRequest(requestId, {
        message: `Mission status is '${appData.mission_status}', must be 'approved'`,
      });
    }

    const payoutConfig = getPayoutConfig(env);
    const payoutMode: PayoutMode = payoutConfig.mode;
    const isSimulated = isSimulatedTxHash(body.auf_tx_hash);

    // On-chain tx verification (skip for simulated tx hashes in ledger mode)
    if (!isSimulated) {
      const rpcUrl = env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
      try {
        const receiptRes = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionReceipt',
            params: [body.auf_tx_hash],
          }),
        });
        const receiptData = await receiptRes.json<{ result: { status: string } | null }>();

        if (!receiptData.result) {
          return errors.invalidRequest(requestId, {
            message: 'Transaction not found or not yet confirmed. Please wait for on-chain confirmation and try again.',
          });
        }

        if (receiptData.result.status !== '0x1') {
          return errors.invalidRequest(requestId, {
            message: 'Transaction failed on-chain (reverted). Please check the transaction and try again.',
          });
        }
      } catch (e) {
        console.error('[UnlockAddress] RPC verification error:', e);
        // Fail open only if RPC is unreachable - still log the warning
        console.warn('[UnlockAddress] RPC unreachable, proceeding without on-chain verification');
      }
    }

    // Calculate amounts
    const aufPercentage = appData.auf_percentage || DEFAULT_AUF_PERCENTAGE;
    const aufAmountCents = Math.floor((appData.reward_amount * aufPercentage) / 100);
    const payoutAmountCents = appData.reward_amount - aufAmountCents;
    // Normalize to EIP-55 checksum
    const walletAddress = appData.evm_wallet_address ? normalizeAddress(appData.evm_wallet_address) : null;

    // Update mission status
    await env.DB.prepare(
      `UPDATE missions SET
         status = 'address_unlocked',
         auf_tx_hash = ?,
         auf_confirmed_at = datetime('now'),
         updated_at = datetime('now')
       WHERE id = ?`
    ).bind(body.auf_tx_hash, appData.mission_id).run();

    // Update AUF payment record
    await env.DB.prepare(
      `UPDATE payments SET
         tx_hash = ?,
         chain = ?,
         token = ?,
         status = 'confirmed',
         confirmed_at = datetime('now'),
         updated_at = datetime('now')
       WHERE mission_id = ? AND payment_type = 'auf'`
    ).bind(body.auf_tx_hash, body.chain, body.token, appData.mission_id).run();

    // Create payout payment record
    const payoutPaymentId = crypto.randomUUID().replace(/-/g, '');
    await env.DB.prepare(
      `INSERT INTO payments (id, mission_id, agent_id, operator_id, payment_type, amount_cents, chain, token, to_address, status, payout_mode, deadline_at)
       VALUES (?, ?, 'agent_test_advertiser', ?, 'payout', ?, ?, ?, ?, 'pending', ?, ?)`
    ).bind(
      payoutPaymentId,
      appData.mission_id,
      appData.operator_id,
      payoutAmountCents,
      body.chain,
      body.token,
      walletAddress,
      payoutMode,
      appData.payout_deadline_at
    ).run();

    // Build payment deep link info (fallback to Sepolia)
    const chainInfo = TESTNET_CHAINS[body.chain] || TESTNET_CHAINS.sepolia;
    const amountMicroUsdc = payoutAmountCents * 10000;
    const walletDeepLink = `ethereum:${chainInfo.usdcAddress}@${chainInfo.chainId}/transfer?address=${walletAddress}&uint256=${amountMicroUsdc}`;

    return success({
      mission_id: appData.mission_id,
      status: 'address_unlocked',
      wallet_address: walletAddress,
      payout_amount_cents: payoutAmountCents,
      payout_deadline_at: appData.payout_deadline_at,
      chain: body.chain,
      token: body.token,
      payout_mode: payoutMode,
      is_simulated: isSimulated,
      payment_info: {
        chain: body.chain,
        chain_id: chainInfo.chainId,
        token: body.token,
        token_address: chainInfo.usdcAddress,
        to_address: walletAddress,
        amount_cents: payoutAmountCents,
        amount_micro_usdc: amountMicroUsdc,
        wallet_deep_link: walletDeepLink,
      },
    }, requestId);
  } catch (e) {
    console.error('Unlock address error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/advertiser/test/applications/:id/confirm-payout
 * Confirms 90% payout completion
 */
async function confirmTestPayout(
  request: Request,
  env: Env,
  applicationId: string
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<{
      payout_tx_hash: string;
      chain: string;
      token: string;
    }>();

    if (!body.payout_tx_hash || !body.chain || !body.token) {
      return errors.invalidRequest(requestId, {
        message: 'payout_tx_hash, chain, and token are required',
      });
    }

    // Get application with mission info
    const appData = await env.DB.prepare(
      `SELECT a.*, m.id as mission_id, m.status as mission_status,
              d.reward_amount
       FROM applications a
       JOIN missions m ON m.deal_id = a.deal_id AND m.operator_id = a.operator_id
       JOIN deals d ON a.deal_id = d.id
       WHERE a.id = ?`
    ).bind(applicationId).first<{
      mission_id: string;
      mission_status: string;
      reward_amount: number;
    }>();

    if (!appData) {
      return errors.notFound(requestId, 'Application or Mission');
    }

    if (appData.mission_status !== 'address_unlocked') {
      return errors.invalidRequest(requestId, {
        message: `Mission status is '${appData.mission_status}', must be 'address_unlocked'`,
      });
    }

    const payoutConfig = getPayoutConfig(env);
    const isSimulated = isSimulatedTxHash(body.payout_tx_hash);
    const now = new Date();

    // On-chain tx verification (skip for simulated tx hashes)
    if (!isSimulated) {
      const rpcUrl = env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
      try {
        const receiptRes = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionReceipt',
            params: [body.payout_tx_hash],
          }),
        });
        const receiptData = await receiptRes.json<{ result: { status: string } | null }>();

        if (!receiptData.result) {
          return errors.invalidRequest(requestId, {
            message: 'Transaction not found or not yet confirmed. Please wait for on-chain confirmation and try again.',
          });
        }

        if (receiptData.result.status !== '0x1') {
          return errors.invalidRequest(requestId, {
            message: 'Transaction failed on-chain (reverted). Please check the transaction and try again.',
          });
        }
      } catch (e) {
        console.error('[ConfirmPayout] RPC verification error:', e);
        console.warn('[ConfirmPayout] RPC unreachable, proceeding without on-chain verification');
      }
    }

    // Update mission status to paid_complete
    await env.DB.prepare(
      `UPDATE missions SET
         status = 'paid_complete',
         payout_tx_hash = ?,
         payout_confirmed_at = datetime('now'),
         paid_at = datetime('now'),
         updated_at = datetime('now')
       WHERE id = ?`
    ).bind(body.payout_tx_hash, appData.mission_id).run();

    // Update payout payment record
    await env.DB.prepare(
      `UPDATE payments SET
         tx_hash = ?,
         status = 'confirmed',
         confirmed_at = datetime('now'),
         updated_at = datetime('now')
       WHERE mission_id = ? AND payment_type = 'payout'`
    ).bind(body.payout_tx_hash, appData.mission_id).run();

    return success({
      mission_id: appData.mission_id,
      status: 'paid_complete',
      paid_complete_at: now.toISOString(),
      total_amount_cents: appData.reward_amount,
      payout_mode: payoutConfig.mode,
      is_simulated: isSimulated,
    }, requestId);
  } catch (e) {
    console.error('Confirm payout error:', e);
    return errors.internalError(requestId);
  }
}
