// AI Advertiser Permit Endpoints
// GET  /api/v1/advertisers/deposit/permit  — Get EIP-712 typed data for permit signing
// POST /api/v1/advertisers/deposit/permit  — Store signed permit

import type { Env } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { success, error, errors } from '../../utils/response';
import { getOnchainConfig, rpcCall } from '../../services/onchain';

/**
 * Get EIP-712 typed data for the advertiser to sign a permit.
 *
 * GET /api/v1/advertisers/deposit/permit?amount=100.00
 *
 * Returns the domain, types, and message that the AI should sign
 * with its private key (no RPC needed, no gas needed).
 */
export async function handleGetPermitData(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  if (!advertiser.wallet_address) {
    return error('NO_WALLET', 'Set your wallet address first: POST /advertisers/wallet', requestId, 400);
  }

  const url = new URL(request.url);
  const amountStr = url.searchParams.get('amount');
  if (!amountStr) {
    return errors.badRequest(requestId, 'Missing query parameter: amount (e.g. ?amount=100.00)');
  }

  const amountFloat = parseFloat(amountStr);
  if (isNaN(amountFloat) || amountFloat <= 0) {
    return errors.badRequest(requestId, 'amount must be a positive number');
  }

  const amountCents = Math.round(amountFloat * 100);
  // Convert cents to base units (6 decimals): 1 cent = 10_000 base units
  const amountBaseUnits = (BigInt(amountCents) * BigInt(10_000)).toString();

  const config = getOnchainConfig(env);

  // Fetch the permit nonce for this advertiser from the hUSD contract
  // nonces(address) selector = 0x7ecebe00
  const nonceSelector = '0x7ecebe00';
  const paddedAddress = advertiser.wallet_address.toLowerCase().replace('0x', '').padStart(64, '0');

  let nonce: string;
  try {
    const result = await rpcCall(config.rpcUrl, 'eth_call', [
      { to: config.husdContract, data: nonceSelector + paddedAddress },
      'latest',
    ]) as string;
    nonce = BigInt(result).toString();
  } catch (e) {
    console.error('[GetPermitData] nonce RPC error:', e);
    return error('RPC_ERROR', 'Failed to fetch permit nonce from RPC', requestId, 502);
  }

  // Deadline: 1 hour from now
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  // Spender = escrow contract (not Treasury!)
  const spender = config.escrowContract;

  // EIP-712 domain for hUSD
  // Real hUSD on Sepolia: name="HumanAds USD", version="1"
  // We return the typed data so the AI can sign it locally
  const typedData = {
    domain: {
      name: 'HumanAds USD',
      version: '1',
      chainId: config.chainId,
      verifyingContract: config.husdContract,
    },
    types: {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'Permit',
    message: {
      owner: advertiser.wallet_address,
      spender,
      value: amountBaseUnits,
      nonce,
      deadline: String(deadline),
    },
  };

  return success({
    typed_data: typedData,
    amount_husd: amountFloat.toFixed(2),
    amount_cents: amountCents,
    amount_base_units: amountBaseUnits,
    deadline,
    nonce,
    spender,
    instructions: 'Sign the typed_data with eth_signTypedData_v4 using your private key, then POST the signature to /advertisers/deposit/permit',
  }, requestId);
}

/**
 * Store a signed permit for later use during mission creation.
 *
 * POST /api/v1/advertisers/deposit/permit
 * Body: { amount: "100.00", deadline: 1234567890, v: 28, r: "0x...", s: "0x..." }
 */
export async function handleStorePermit(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  if (!advertiser.wallet_address) {
    return error('NO_WALLET', 'Set your wallet address first: POST /advertisers/wallet', requestId, 400);
  }

  let body: {
    amount?: string;
    deadline?: number;
    v?: number;
    r?: string;
    s?: string;
  };
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON in request body');
  }

  // Validate fields
  if (!body.amount || typeof body.amount !== 'string') {
    return errors.badRequest(requestId, 'Missing or invalid field: amount (string, e.g. "100.00")');
  }

  const amountFloat = parseFloat(body.amount);
  if (isNaN(amountFloat) || amountFloat <= 0) {
    return errors.badRequest(requestId, 'amount must be a positive number');
  }

  if (!body.deadline || typeof body.deadline !== 'number') {
    return errors.badRequest(requestId, 'Missing or invalid field: deadline (unix timestamp)');
  }

  if (body.deadline <= Math.floor(Date.now() / 1000)) {
    return errors.badRequest(requestId, 'deadline must be in the future');
  }

  if (body.v === undefined || typeof body.v !== 'number') {
    return errors.badRequest(requestId, 'Missing or invalid field: v (number)');
  }

  if (!body.r || typeof body.r !== 'string' || !body.r.startsWith('0x')) {
    return errors.badRequest(requestId, 'Missing or invalid field: r (hex string)');
  }

  if (!body.s || typeof body.s !== 'string' || !body.s.startsWith('0x')) {
    return errors.badRequest(requestId, 'Missing or invalid field: s (hex string)');
  }

  const amountCents = Math.round(amountFloat * 100);
  const permitId = crypto.randomUUID().replace(/-/g, '');

  await env.DB
    .prepare(
      `INSERT INTO advertiser_permits (id, advertiser_id, amount_cents, deadline, v, r, s, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'))`
    )
    .bind(
      permitId,
      advertiser.id,
      amountCents,
      body.deadline,
      body.v,
      body.r,
      body.s
    )
    .run();

  return success({
    permit_id: permitId,
    amount_cents: amountCents,
    amount_husd: amountFloat.toFixed(2),
    deadline: body.deadline,
    status: 'active',
    message: 'Permit stored. It will be used automatically when you create a mission.',
  }, requestId, 201);
}
