// AI Advertiser Deposit Endpoints
// GET  /api/v1/advertisers/deposit/prepare  — Prepare unsigned hUSD transfer tx
// POST /api/v1/advertisers/deposit/send     — Broadcast signed tx & credit balance
// GET  /api/v1/advertisers/deposit/balance  — Check funded balance

import type { Env } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { success, error, errors } from '../../utils/response';
import {
  getOnchainConfig,
  getHusdBalance,
  rpcCall,
  encodeTransferData,
  normalizeAddress,
} from '../../services/onchain';

// ERC20 transfer(address,uint256) selector
const TRANSFER_SELECTOR = '0xa9059cbb';

/**
 * Prepare an unsigned hUSD transfer transaction for the advertiser to sign.
 *
 * GET /api/v1/advertisers/deposit/prepare?amount=100.00
 */
export async function handlePrepareDeposit(
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
  const config = getOnchainConfig(env);

  // Build calldata: transfer(treasury, amountBaseUnits)
  const calldata = encodeTransferData(config.treasuryAddress, amountCents);

  // Fetch nonce and gas price from RPC
  let nonce: string;
  let gasPrice: string;
  try {
    [nonce, gasPrice] = await Promise.all([
      rpcCall(config.rpcUrl, 'eth_getTransactionCount', [advertiser.wallet_address, 'latest']) as Promise<string>,
      rpcCall(config.rpcUrl, 'eth_gasPrice', []) as Promise<string>,
    ]);
  } catch (e) {
    console.error('[PrepareDeposit] RPC error:', e);
    return error('RPC_ERROR', 'Failed to fetch nonce/gasPrice from RPC', requestId, 502);
  }

  return success({
    unsigned_tx: {
      to: config.husdContract,
      data: calldata,
      value: '0x0',
      type: '0x0',
      chainId: config.chainId,
      gas: '0x' + (65000).toString(16), // 0xfde8
      nonce,
      gasPrice,
    },
    amount_husd: amountFloat.toFixed(2),
    amount_cents: amountCents,
    treasury_address: config.treasuryAddress,
    message: 'Sign this transaction with your private key, then POST the signed tx to /advertisers/deposit/send',
  }, requestId);
}

/**
 * Broadcast a signed hUSD transfer transaction and credit the advertiser's deposit balance.
 *
 * POST /api/v1/advertisers/deposit/send
 * Body: { signed_tx: "0x..." }
 */
export async function handleSendDeposit(
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

  // Decode the signed transaction to validate it's an hUSD transfer to Treasury
  // RLP-encoded tx: we need to verify the `to` and `data` fields.
  // We'll use eth_sendRawTransaction first, then validate via receipt.
  // But for basic validation, decode the calldata from the raw tx.
  //
  // Strategy: broadcast first, then decode the tx via eth_getTransactionByHash
  // to validate it matches expectations.

  let txHash: string;
  try {
    txHash = await rpcCall(config.rpcUrl, 'eth_sendRawTransaction', [signedTx]) as string;
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : 'Unknown RPC error';
    console.error('[SendDeposit] eth_sendRawTransaction failed:', msg);
    return error('BROADCAST_FAILED', `Failed to broadcast transaction: ${msg}`, requestId, 502);
  }

  // Fetch the transaction to validate `to` and `data`
  let tx: any;
  try {
    tx = await rpcCall(config.rpcUrl, 'eth_getTransactionByHash', [txHash]);
  } catch (e) {
    console.error('[SendDeposit] eth_getTransactionByHash failed:', e);
    // Transaction was broadcast but we can't verify — credit anyway with a warning
  }

  if (tx) {
    // Validate: tx.to should be the hUSD contract
    const txTo = (tx.to || '').toLowerCase();
    if (txTo !== config.husdContract.toLowerCase()) {
      return error('INVALID_TX', `Transaction 'to' is not the hUSD contract. Expected ${config.husdContract}, got ${tx.to}`, requestId, 400);
    }

    // Validate: calldata starts with transfer selector and recipient is Treasury
    const txData = (tx.input || tx.data || '').toLowerCase();
    if (!txData.startsWith(TRANSFER_SELECTOR)) {
      return error('INVALID_TX', 'Transaction is not an ERC20 transfer call', requestId, 400);
    }

    // Extract recipient from calldata: bytes 4..36 (selector + padded address)
    const recipientPadded = txData.slice(10, 74); // skip '0x' + 8 chars selector
    const recipient = '0x' + recipientPadded.slice(24); // last 20 bytes
    if (recipient.toLowerCase() !== config.treasuryAddress.toLowerCase()) {
      return error('INVALID_TX', `Transfer recipient is not the Treasury. Expected ${config.treasuryAddress}, got 0x${recipientPadded.slice(24)}`, requestId, 400);
    }

    // Extract amount from calldata: bytes 36..68
    const amountHex = txData.slice(74, 138);
    const amountBaseUnits = BigInt('0x' + amountHex);
    // Convert base units to cents: 1 cent = 10_000 base units
    const amountCents = Number(amountBaseUnits / BigInt(10000));

    if (amountCents <= 0) {
      return error('INVALID_TX', 'Transfer amount is zero or negative', requestId, 400);
    }

    // Check for duplicate tx_hash
    const existing = await env.DB
      .prepare('SELECT id FROM advertiser_deposits WHERE tx_hash = ?')
      .bind(txHash)
      .first();

    if (existing) {
      return error('DUPLICATE_TX', 'This transaction has already been credited', requestId, 409);
    }

    // Credit the deposit
    const depositId = crypto.randomUUID().replace(/-/g, '');
    await env.DB
      .prepare(
        `INSERT INTO advertiser_deposits (id, advertiser_id, type, amount_cents, tx_hash, memo, created_at)
         VALUES (?, ?, 'deposit', ?, ?, ?, datetime('now'))`
      )
      .bind(depositId, advertiser.id, amountCents, txHash, `Deposit ${(amountCents / 100).toFixed(2)} hUSD`)
      .run();

    // Query funded balance
    const balanceRow = await env.DB
      .prepare('SELECT COALESCE(SUM(amount_cents), 0) as balance FROM advertiser_deposits WHERE advertiser_id = ?')
      .bind(advertiser.id)
      .first<{ balance: number }>();

    return success({
      tx_hash: txHash,
      amount_cents: amountCents,
      amount_husd: (amountCents / 100).toFixed(2),
      funded_balance_cents: balanceRow?.balance || 0,
      explorer_url: `${config.explorerUrl}/tx/${txHash}`,
    }, requestId);
  }

  // Fallback: tx was broadcast but we couldn't verify it on-chain yet.
  // Don't credit until we can validate.
  return error(
    'TX_PENDING_VERIFICATION',
    'Transaction was broadcast but could not be verified yet. Try GET /deposit/balance in a few seconds.',
    requestId,
    202
  );
}

/**
 * Get the advertiser's funded balance.
 *
 * GET /api/v1/advertisers/deposit/balance
 */
export async function handleGetDepositBalance(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  // Funded balance from deposits ledger
  const balanceRow = await env.DB
    .prepare('SELECT COALESCE(SUM(amount_cents), 0) as balance FROM advertiser_deposits WHERE advertiser_id = ?')
    .bind(advertiser.id)
    .first<{ balance: number }>();

  const fundedBalanceCents = balanceRow?.balance || 0;

  // On-chain hUSD balance for reference (if wallet is set)
  let onchainHusdBalanceCents = 0;
  if (advertiser.wallet_address) {
    try {
      onchainHusdBalanceCents = await getHusdBalance(env, advertiser.wallet_address);
    } catch (e) {
      console.error('[GetBalance] RPC error:', e);
      // Non-critical: show 0 if RPC fails for this info endpoint
    }
  }

  return success({
    funded_balance_cents: fundedBalanceCents,
    funded_balance_husd: (fundedBalanceCents / 100).toFixed(2),
    onchain_husd_balance_cents: onchainHusdBalanceCents,
    onchain_husd_balance_husd: (onchainHusdBalanceCents / 100).toFixed(2),
    wallet_address: advertiser.wallet_address || null,
  }, requestId);
}
