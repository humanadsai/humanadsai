// AI Advertiser Approve Endpoints
// GET  /api/v1/advertisers/deposit/approve  — Get unsigned approve tx for AI to sign
// POST /api/v1/advertisers/deposit/approve  — Broadcast signed approve tx & record

import type { Env } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { success, error, errors } from '../../utils/response';
import { getOnchainConfig, rpcCall, normalizeAddress, getHusdAllowance } from '../../services/onchain';

// approve(address,uint256) selector
const APPROVE_SELECTOR = '0x095ea7b3';

/**
 * Get an unsigned approve transaction for the AI to sign.
 * Approves the escrow contract to spend a specified amount of the advertiser's hUSD.
 *
 * GET /api/v1/advertisers/deposit/approve?amount=1000
 *   amount: hUSD units (e.g. 1000 = 1000 hUSD). Required.
 */
export async function handleGetApproveData(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  if (!advertiser.wallet_address) {
    return error('NO_WALLET', 'Set your wallet address first: POST /advertisers/wallet', requestId, 400);
  }

  const config = getOnchainConfig(env);

  // Parse amount query parameter
  const url = new URL(request.url);
  const amountParam = url.searchParams.get('amount');

  if (!amountParam) {
    return error('MISSING_AMOUNT', 'Query parameter "amount" is required (hUSD units, e.g. ?amount=1000)', requestId, 400);
  }

  const amountHusd = parseFloat(amountParam);
  if (isNaN(amountHusd) || amountHusd <= 0) {
    return error('INVALID_AMOUNT', 'amount must be a positive number (hUSD units)', requestId, 400);
  }

  // Convert hUSD to base units (6 decimals): 1 hUSD = 1_000_000 base units
  const amountBaseUnits = BigInt(Math.round(amountHusd * 1_000_000));

  // Check on-chain allowance
  const currentAllowanceCents = await getHusdAllowance(env, advertiser.wallet_address, config.escrowContract);
  const requiredCents = Math.round(amountHusd * 100);

  if (currentAllowanceCents >= requiredCents) {
    return success({
      already_sufficient: true,
      current_allowance_husd: (currentAllowanceCents / 100).toFixed(2),
      requested_husd: amountHusd.toFixed(2),
      message: `Current allowance (${(currentAllowanceCents / 100).toFixed(2)} hUSD) is already sufficient for ${amountHusd.toFixed(2)} hUSD. You can create missions directly.`,
    }, requestId);
  }

  // Build approve calldata: approve(escrowContract, amountBaseUnits)
  const paddedSpender = config.escrowContract.toLowerCase().replace('0x', '').padStart(64, '0');
  const paddedAmount = amountBaseUnits.toString(16).padStart(64, '0');
  const calldata = APPROVE_SELECTOR + paddedSpender + paddedAmount;

  // Fetch nonce and gas price from RPC
  let nonce: string;
  let gasPrice: string;
  try {
    [nonce, gasPrice] = await Promise.all([
      rpcCall(config.rpcUrl, 'eth_getTransactionCount', [advertiser.wallet_address, 'latest']) as Promise<string>,
      rpcCall(config.rpcUrl, 'eth_gasPrice', []) as Promise<string>,
    ]);
  } catch (e) {
    console.error('[GetApproveData] RPC error:', e);
    return error('RPC_ERROR', 'Failed to fetch nonce/gasPrice from RPC', requestId, 502);
  }

  return success({
    unsigned_tx: {
      to: config.husdContract,
      data: calldata,
      value: '0x0',
      chainId: config.chainId,
      gas_estimate: '0x' + (65000).toString(16),
      nonce,
      gasPrice,
    },
    approve_amount_husd: amountHusd.toFixed(2),
    current_allowance_husd: (currentAllowanceCents / 100).toFixed(2),
    spender: config.escrowContract,
    message: `Sign this approve transaction to allow ${amountHusd.toFixed(2)} hUSD spending, then POST to /advertisers/deposit/approve.`,
  }, requestId);
}

/**
 * Broadcast a signed approve transaction and record the approval.
 *
 * POST /api/v1/advertisers/deposit/approve
 * Body: { signed_tx: "0x..." }
 */
export async function handleSendApprove(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  if (!advertiser.wallet_address) {
    return error('NO_WALLET', 'Set your wallet address first: POST /advertisers/wallet', requestId, 400);
  }

  let body: { signed_tx?: string };
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON in request body');
  }

  const signedTx = body.signed_tx;
  if (!signedTx || typeof signedTx !== 'string' || !signedTx.startsWith('0x')) {
    return errors.badRequest(requestId, 'Missing or invalid field: signed_tx (must be hex string starting with 0x)');
  }

  const config = getOnchainConfig(env);

  // Broadcast the transaction
  let txHash: string;
  try {
    txHash = await rpcCall(config.rpcUrl, 'eth_sendRawTransaction', [signedTx]) as string;
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : 'Unknown RPC error';
    console.error('[SendApprove] eth_sendRawTransaction failed:', msg);
    return error('BROADCAST_FAILED', `Failed to broadcast transaction: ${msg}`, requestId, 502);
  }

  // Validate the transaction
  let tx: any;
  try {
    tx = await rpcCall(config.rpcUrl, 'eth_getTransactionByHash', [txHash]);
  } catch (e) {
    console.error('[SendApprove] eth_getTransactionByHash failed:', e);
  }

  if (tx) {
    // Validate: tx.to should be the hUSD contract
    const txTo = (tx.to || '').toLowerCase();
    if (txTo !== config.husdContract.toLowerCase()) {
      return error('INVALID_TX', `Transaction 'to' is not the hUSD contract`, requestId, 400);
    }

    // Validate: calldata starts with approve selector
    const txData = (tx.input || tx.data || '').toLowerCase();
    if (!txData.startsWith(APPROVE_SELECTOR)) {
      return error('INVALID_TX', 'Transaction is not an ERC20 approve call', requestId, 400);
    }

    // Extract spender and verify it's the escrow contract
    const spenderPadded = txData.slice(10, 74);
    const spender = '0x' + spenderPadded.slice(24);
    if (spender.toLowerCase() !== config.escrowContract.toLowerCase()) {
      return error('INVALID_TX', `Approve spender is not the escrow contract`, requestId, 400);
    }
  }

  // Check for duplicate
  const existing = await env.DB
    .prepare(`SELECT id FROM advertiser_approvals WHERE advertiser_id = ? AND tx_hash = ?`)
    .bind(advertiser.id, txHash)
    .first();

  if (existing) {
    return error('DUPLICATE_TX', 'This approval has already been recorded', requestId, 409);
  }

  // Record the approval
  const approvalId = crypto.randomUUID().replace(/-/g, '');
  await env.DB
    .prepare(
      `INSERT INTO advertiser_approvals (id, advertiser_id, tx_hash, status, created_at)
       VALUES (?, ?, ?, 'confirmed', datetime('now'))`
    )
    .bind(approvalId, advertiser.id, txHash)
    .run();

  return success({
    approval_id: approvalId,
    tx_hash: txHash,
    explorer_url: `${config.explorerUrl}/tx/${txHash}`,
    message: 'Escrow approved. You can now create missions — your hUSD will be deposited into escrow automatically.',
  }, requestId);
}
