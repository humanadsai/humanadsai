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
      base_sepolia: TESTNET_CHAINS.base_sepolia,
      sepolia: TESTNET_CHAINS.sepolia,
    },
    treasury_address: FEE_VAULT_ADDRESSES.base_sepolia,
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
    const chain = body.chain || 'base_sepolia';

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

/**
 * POST /api/advertiser/test/seed
 * Seeds test data: operator, application, and mission
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

    // 1. Create or get test operator
    const testOperatorId = 'op_test_promoter';
    let operator = await env.DB.prepare('SELECT * FROM operators WHERE id = ?')
      .bind(testOperatorId)
      .first<Operator>();

    if (!operator) {
      await env.DB.prepare(
        `INSERT INTO operators (id, x_handle, x_user_id, display_name, status, role, evm_wallet_address, verified_at)
         VALUES (?, '@test_promoter', 'test_user_123', 'Test Promoter', 'verified', 'user', '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00', datetime('now'))`
      ).bind(testOperatorId).run();

      operator = await env.DB.prepare('SELECT * FROM operators WHERE id = ?')
        .bind(testOperatorId)
        .first<Operator>();
    }

    // 2. Create application
    const applicationId = crypto.randomUUID().replace(/-/g, '');
    await env.DB.prepare(
      `INSERT INTO applications (id, deal_id, operator_id, status, proposed_angle, accept_disclosure, accept_no_engagement_buying, applied_at, selected_at)
       VALUES (?, ?, ?, 'selected', 'Test application for E2E payment flow', 1, 1, datetime('now'), datetime('now'))`
    ).bind(applicationId, body.deal_id, testOperatorId).run();

    // 3. Create mission with status=verified (ready for approval)
    const missionId = crypto.randomUUID().replace(/-/g, '');
    await env.DB.prepare(
      `INSERT INTO missions (id, deal_id, operator_id, status, submission_url, submitted_at, verified_at)
       VALUES (?, ?, ?, 'verified', 'https://x.com/test_promoter/status/test_123', datetime('now'), datetime('now'))`
    ).bind(missionId, body.deal_id, testOperatorId).run();

    return success({
      operator_id: testOperatorId,
      application_id: applicationId,
      mission_id: missionId,
      operator_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00',
      message: 'Test data seeded. Mission is ready for approval.',
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

    // Build payment info
    const chainInfo = TESTNET_CHAINS.base_sepolia;
    const treasury = FEE_VAULT_ADDRESSES.base_sepolia;
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
        chain: 'base_sepolia',
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

    // In ledger mode, accept any tx hash (including SIMULATED_)
    // In onchain mode, we would verify the tx (simplified for test page)
    const isSimulated = isSimulatedTxHash(body.auf_tx_hash);

    // Calculate amounts
    const aufPercentage = appData.auf_percentage || DEFAULT_AUF_PERCENTAGE;
    const aufAmountCents = Math.floor((appData.reward_amount * aufPercentage) / 100);
    const payoutAmountCents = appData.reward_amount - aufAmountCents;
    const walletAddress = appData.evm_wallet_address;

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

    // Build payment deep link info
    const chainInfo = TESTNET_CHAINS[body.chain] || TESTNET_CHAINS.base_sepolia;
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
