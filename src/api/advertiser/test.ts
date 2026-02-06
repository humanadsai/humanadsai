/**
 * Advertiser Test API
 *
 * Backend proxy for /advertiser/test page.
 * Provides server-side HMAC signature generation for testing
 * the full AI Advertiser E2E payment flow on mobile.
 */

import type { Env, Deal, Mission, Application, Operator } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { requireAdmin } from '../../middleware/admin';
import { buildCanonicalStringHmac, generateHmacSignature } from '../../services/signature';
import { getPayoutConfig } from '../../config/payout';

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

/**
 * Handle all advertiser test API routes
 */
export async function handleAdvertiserTestApi(
  request: Request,
  env: Env,
  path: string,
  method: string
): Promise<Response> {
  // Remove the /api/advertiser/test prefix to get the sub-path
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

  // POST /api/advertiser/test/tx/verify
  if (subPath === '/tx/verify' && method === 'POST') {
    return verifyTransaction(request, env);
  }

  return errors.notFound(generateRequestId(), 'Endpoint');
}

/**
 * GET /api/advertiser/test/environment
 * Returns environment info and test credentials status
 */
async function getEnvironment(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  const payoutConfig = getPayoutConfig(env);

  // Check if test credentials are configured
  const hasTestCredentials = !!(env.ADVERTISER_TEST_KEY_ID && env.ADVERTISER_TEST_SECRET);

  // Get test agent if exists
  const testAgent = await env.DB.prepare(
    `SELECT id, name, status FROM agents
     WHERE id LIKE 'agent_test_%' OR email LIKE '%@test.humanads%'
     ORDER BY created_at DESC LIMIT 1`
  ).first<{ id: string; name: string; status: string }>();

  return success({
    environment: env.ENVIRONMENT || 'development',
    payout_mode: payoutConfig.mode,
    has_test_credentials: hasTestCredentials,
    test_key_id: hasTestCredentials ? env.ADVERTISER_TEST_KEY_ID?.slice(0, 8) + '...' : null,
    test_agent: testAgent,
    chains: {
      base_sepolia: TESTNET_CHAINS.base_sepolia,
      sepolia: TESTNET_CHAINS.sepolia,
    },
    treasury_address: FEE_VAULT_ADDRESSES.base_sepolia,
  }, requestId);
}

/**
 * POST /api/advertiser/test/deals/create
 * Creates a test deal via /v1/deals/create with HMAC signature
 */
async function createTestDeal(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    // Check test credentials
    if (!env.ADVERTISER_TEST_KEY_ID || !env.ADVERTISER_TEST_SECRET) {
      return errors.invalidRequest(requestId, {
        code: 'TEST_CREDENTIALS_NOT_CONFIGURED',
        message: 'ADVERTISER_TEST_KEY_ID and ADVERTISER_TEST_SECRET must be configured. Run: wrangler secret put ADVERTISER_TEST_KEY_ID && wrangler secret put ADVERTISER_TEST_SECRET',
      });
    }

    // Parse request body
    const body = await request.json<{ reward_amount?: number; chain?: string }>();
    const rewardAmount = body.reward_amount || 500; // Default $5.00
    const chain = body.chain || 'base_sepolia';

    // Create deal request body
    const dealRequest = {
      title: `Test Deal - ${new Date().toISOString().slice(0, 16)}`,
      description: 'Advertiser Test Page - E2E Payment Flow',
      requirements: {
        post_type: 'tweet',
        content_template: 'Test post for payment flow verification',
        hashtags: ['HumanAdsTest'],
        verification_method: 'manual',
      },
      reward_amount: rewardAmount,
      max_participants: 1,
    };

    // Call /v1/deals/create with HMAC signature
    const v1Response = await callV1Api(
      request,
      env,
      '/v1/deals/create',
      'POST',
      dealRequest
    );

    if (!v1Response.ok) {
      const errorData = await v1Response.json();
      return errors.invalidRequest(requestId, {
        code: 'V1_API_ERROR',
        message: 'Failed to create deal via /v1/deals/create',
        v1_error: errorData,
      });
    }

    const result = await v1Response.json<{ success: boolean; data?: { deal: Deal }; error?: unknown }>();

    if (!result.success || !result.data?.deal) {
      return errors.invalidRequest(requestId, {
        code: 'V1_API_FAILED',
        message: 'Deal creation failed',
        v1_response: result,
      });
    }

    return success({
      deal_id: result.data.deal.id,
      deal: result.data.deal,
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

    // Verify deal exists
    const deal = await env.DB.prepare('SELECT * FROM deals WHERE id = ?')
      .bind(body.deal_id)
      .first<Deal>();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    // 1. Create or get test operator
    const testOperatorId = 'op_test_advertiser';
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
      `INSERT INTO applications (id, deal_id, operator_id, status, proposed_angle, accept_disclosure, accept_no_engagement_buying, applied_at)
       VALUES (?, ?, ?, 'applied', 'Test application for E2E payment flow', 1, 1, datetime('now'))`
    ).bind(applicationId, body.deal_id, testOperatorId).run();

    // 3. Create mission with status=verified (so it can be approved)
    const missionId = crypto.randomUUID().replace(/-/g, '');
    await env.DB.prepare(
      `INSERT INTO missions (id, deal_id, operator_id, status, submission_url, submitted_at, verified_at)
       VALUES (?, ?, ?, 'verified', 'https://x.com/test_promoter/status/test_123', datetime('now'), datetime('now'))`
    ).bind(missionId, body.deal_id, testOperatorId).run();

    // 4. Update application to selected
    await env.DB.prepare(
      `UPDATE applications SET status = 'selected', selected_at = datetime('now') WHERE id = ?`
    ).bind(applicationId).run();

    return success({
      operator_id: testOperatorId,
      application_id: applicationId,
      mission_id: missionId,
      operator_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00',
      message: 'Test data seeded successfully. Mission is ready for approval.',
    }, requestId);
  } catch (e) {
    console.error('Seed test data error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/advertiser/test/applications/:id/select
 * Proxies to /v1/applications/:id/select
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
    if (!env.ADVERTISER_TEST_KEY_ID || !env.ADVERTISER_TEST_SECRET) {
      return errors.invalidRequest(requestId, {
        code: 'TEST_CREDENTIALS_NOT_CONFIGURED',
        message: 'Test credentials not configured',
      });
    }

    const v1Response = await callV1Api(
      request,
      env,
      `/v1/applications/${applicationId}/select`,
      'POST',
      {}
    );

    const result = await v1Response.json();
    return Response.json(result, { status: v1Response.status });
  } catch (e) {
    console.error('Select test application error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/advertiser/test/applications/:id/approve
 * Proxies to /v1/applications/:id/approve
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
    if (!env.ADVERTISER_TEST_KEY_ID || !env.ADVERTISER_TEST_SECRET) {
      return errors.invalidRequest(requestId, {
        code: 'TEST_CREDENTIALS_NOT_CONFIGURED',
        message: 'Test credentials not configured',
      });
    }

    // Get request body (optional deadline hours)
    let bodyJson = {};
    try {
      bodyJson = await request.json();
    } catch {
      // Empty body is OK
    }

    const v1Response = await callV1Api(
      request,
      env,
      `/v1/applications/${applicationId}/approve`,
      'POST',
      bodyJson
    );

    const result = await v1Response.json<{
      success: boolean;
      data?: {
        auf_amount_cents: number;
        fee_vault_addresses: { evm: string };
        payout_deadline_at: string;
      };
    }>();

    if (result.success && result.data) {
      // Enhance response with payment deep link info
      const aufCents = result.data.auf_amount_cents;
      const treasury = result.data.fee_vault_addresses.evm;

      const chainInfo = TESTNET_CHAINS.base_sepolia;
      // USDC has 6 decimals, cents to micro-USDC: cents * 10000
      const amountMicroUsdc = aufCents * 10000;

      const walletDeepLink = `ethereum:${chainInfo.usdcAddress}@${chainInfo.chainId}/transfer?address=${treasury}&uint256=${amountMicroUsdc}`;

      return success({
        ...result.data,
        payment_info: {
          chain: 'base_sepolia',
          chain_id: chainInfo.chainId,
          token: 'USDC',
          token_address: chainInfo.usdcAddress,
          to_address: treasury,
          amount_cents: aufCents,
          amount_micro_usdc: amountMicroUsdc,
          wallet_deep_link: walletDeepLink,
        },
      }, requestId);
    }

    return Response.json(result, { status: v1Response.status });
  } catch (e) {
    console.error('Approve test mission error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/advertiser/test/applications/:id/unlock-address
 * Proxies to /v1/applications/:id/unlock-address
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
    if (!env.ADVERTISER_TEST_KEY_ID || !env.ADVERTISER_TEST_SECRET) {
      return errors.invalidRequest(requestId, {
        code: 'TEST_CREDENTIALS_NOT_CONFIGURED',
        message: 'Test credentials not configured',
      });
    }

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

    const v1Response = await callV1Api(
      request,
      env,
      `/v1/applications/${applicationId}/unlock-address`,
      'POST',
      body
    );

    const result = await v1Response.json<{
      success: boolean;
      data?: {
        wallet_address: string;
        payout_amount_cents: number;
        chain: string;
      };
    }>();

    if (result.success && result.data) {
      // Enhance response with payout deep link info
      const payoutCents = result.data.payout_amount_cents;
      const promoterWallet = result.data.wallet_address;

      const chainInfo = TESTNET_CHAINS[body.chain] || TESTNET_CHAINS.base_sepolia;
      const amountMicroUsdc = payoutCents * 10000;

      const walletDeepLink = `ethereum:${chainInfo.usdcAddress}@${chainInfo.chainId}/transfer?address=${promoterWallet}&uint256=${amountMicroUsdc}`;

      return success({
        ...result.data,
        payment_info: {
          chain: body.chain,
          chain_id: chainInfo.chainId,
          token: body.token,
          token_address: chainInfo.usdcAddress,
          to_address: promoterWallet,
          amount_cents: payoutCents,
          amount_micro_usdc: amountMicroUsdc,
          wallet_deep_link: walletDeepLink,
        },
      }, requestId);
    }

    return Response.json(result, { status: v1Response.status });
  } catch (e) {
    console.error('Unlock test address error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/advertiser/test/applications/:id/confirm-payout
 * Proxies to /v1/applications/:id/confirm-payout
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
    if (!env.ADVERTISER_TEST_KEY_ID || !env.ADVERTISER_TEST_SECRET) {
      return errors.invalidRequest(requestId, {
        code: 'TEST_CREDENTIALS_NOT_CONFIGURED',
        message: 'Test credentials not configured',
      });
    }

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

    const v1Response = await callV1Api(
      request,
      env,
      `/v1/applications/${applicationId}/confirm-payout`,
      'POST',
      body
    );

    const result = await v1Response.json();
    return Response.json(result, { status: v1Response.status });
  } catch (e) {
    console.error('Confirm test payout error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/advertiser/test/tx/verify
 * Verifies a transaction hash without changing state
 */
async function verifyTransaction(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const body = await request.json<{
      tx_hash: string;
      chain: string;
      expected_to?: string;
      expected_amount_cents?: number;
    }>();

    if (!body.tx_hash || !body.chain) {
      return errors.invalidRequest(requestId, {
        message: 'tx_hash and chain are required',
      });
    }

    const payoutConfig = getPayoutConfig(env);

    // In ledger mode, any tx starting with SIMULATED_ is valid
    if (payoutConfig.mode === 'ledger' && body.tx_hash.startsWith('SIMULATED_')) {
      return success({
        verified: true,
        mode: 'ledger',
        tx_hash: body.tx_hash,
        message: 'Simulated transaction accepted in ledger mode',
      }, requestId);
    }

    // For onchain mode, return info about what would be verified
    const chainInfo = TESTNET_CHAINS[body.chain];
    if (!chainInfo) {
      return errors.invalidRequest(requestId, {
        message: `Unsupported chain: ${body.chain}. Supported: ${Object.keys(TESTNET_CHAINS).join(', ')}`,
      });
    }

    return success({
      verified: 'pending',
      mode: payoutConfig.mode,
      tx_hash: body.tx_hash,
      chain: body.chain,
      chain_id: chainInfo.chainId,
      explorer_url: `https://sepolia.basescan.org/tx/${body.tx_hash}`,
      message: 'Transaction verification would be performed on-chain',
    }, requestId);
  } catch (e) {
    console.error('Verify transaction error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Helper: Call /v1 API with HMAC signature
 */
async function callV1Api(
  request: Request,
  env: Env,
  path: string,
  method: string,
  body: unknown
): Promise<Response> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const bodyStr = JSON.stringify(body);

  // Build canonical string: {ts}|{nonce}|{METHOD}|{PATH}|{BODY}
  const canonical = buildCanonicalStringHmac(method, path, timestamp, nonce, bodyStr);

  // Generate HMAC signature
  const signature = await generateHmacSignature(canonical, env.ADVERTISER_TEST_SECRET!);

  // Build absolute URL for internal fetch
  const url = new URL(request.url);
  const v1Url = `${url.origin}${path}`;

  // Make the request
  const response = await fetch(v1Url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-AdClaw-Key-Id': env.ADVERTISER_TEST_KEY_ID!,
      'X-AdClaw-Timestamp': timestamp,
      'X-AdClaw-Nonce': nonce,
      'X-AdClaw-Signature': signature,
    },
    body: bodyStr,
  });

  return response;
}
