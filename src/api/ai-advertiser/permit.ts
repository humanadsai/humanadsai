// AI Advertiser Approve Endpoints
// GET  /api/v1/advertisers/deposit/approve  — Get unsigned approve tx for AI to sign
// POST /api/v1/advertisers/deposit/approve  — Broadcast signed approve tx & record

import type { Env } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { success, error, errors } from '../../utils/response';
import { getOnchainConfig, rpcCall, normalizeAddress, getHusdAllowance, getEthBalance, sendEthForGas } from '../../services/onchain';
import { parseTransaction, recoverTransactionAddress, type Hex } from 'viem';

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
  let currentAllowanceCents: number;
  try {
    currentAllowanceCents = await getHusdAllowance(env, advertiser.wallet_address, config.escrowContract);
  } catch (e) {
    console.error('[GetApproveData] RPC error checking allowance:', e);
    // On RPC error, assume allowance is 0 and proceed to return unsigned tx (safe fallback)
    currentAllowanceCents = 0;
  }
  const requiredCents = Math.round(amountHusd * 100);

  if (currentAllowanceCents >= requiredCents) {
    return success({
      already_sufficient: true,
      current_allowance_husd: (currentAllowanceCents / 100).toFixed(2),
      requested_husd: amountHusd.toFixed(2),
      message: `Current allowance (${(currentAllowanceCents / 100).toFixed(2)} hUSD) is already sufficient for ${amountHusd.toFixed(2)} hUSD. You can create missions directly.`,
    }, requestId);
  }

  // Auto-fund ETH for gas if the advertiser's balance is too low
  // Security: cooldown (1 per 24h per advertiser), skip on RPC error (refuse to fund when balance unknown)
  let ethFunded = false;
  let ethFundTxHash: string | undefined;
  let ethBalance: number | null = null;
  try {
    ethBalance = parseFloat(await getEthBalance(env, advertiser.wallet_address));
  } catch (e) {
    console.error('[GetApproveData] RPC error checking ETH balance, skipping auto-fund:', e);
    // Do NOT fund on RPC error — refuse when balance cannot be verified
  }
  if (ethBalance !== null && ethBalance < 0.001) {
    // Check cooldown: max 1 ETH funding per advertiser per 24 hours
    const lastFunding = await env.DB.prepare(
      `SELECT created_at FROM advertiser_eth_funding WHERE advertiser_id = ? ORDER BY created_at DESC LIMIT 1`
    ).bind(advertiser.id).first<{ created_at: string }>();

    const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
    const canFund = !lastFunding || (Date.now() - new Date(lastFunding.created_at).getTime()) >= cooldownMs;

    if (canFund) {
      console.log(`[GetApproveData] ETH balance ${ethBalance} < 0.001, auto-funding 0.002 ETH to ${advertiser.wallet_address}`);
      const fundResult = await sendEthForGas(env, advertiser.wallet_address, 0.002);
      if (fundResult.success) {
        ethFunded = true;
        ethFundTxHash = fundResult.txHash;
        // Record funding for cooldown tracking
        await env.DB.prepare(
          `INSERT INTO advertiser_eth_funding (id, advertiser_id, wallet_address, amount_wei, tx_hash, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`
        ).bind(
          crypto.randomUUID().replace(/-/g, ''),
          advertiser.id,
          advertiser.wallet_address,
          '2000000000000000', // 0.002 ETH in wei
          ethFundTxHash || null,
        ).run();
        console.log(`[GetApproveData] ETH funded: ${ethFundTxHash}`);
      } else {
        console.error(`[GetApproveData] ETH funding failed: ${fundResult.error}`);
      }
    } else {
      console.log(`[GetApproveData] ETH funding cooldown active for advertiser ${advertiser.id}`);
    }
  }

  // Build approve calldata: approve(escrowContract, amountBaseUnits)
  const paddedSpender = config.escrowContract.toLowerCase().replace('0x', '').padStart(64, '0');
  const paddedAmount = amountBaseUnits.toString(16).padStart(64, '0');
  const calldata = APPROVE_SELECTOR + paddedSpender + paddedAmount;

  // Fetch nonce and gas price from RPC
  let nonce: string;
  let gasPriceRaw: string;
  try {
    [nonce, gasPriceRaw] = await Promise.all([
      rpcCall(config.rpcUrl, 'eth_getTransactionCount', [advertiser.wallet_address, 'latest']) as Promise<string>,
      rpcCall(config.rpcUrl, 'eth_gasPrice', []) as Promise<string>,
    ]);
  } catch (e) {
    console.error('[GetApproveData] RPC error:', e);
    return error('RPC_ERROR', 'Failed to fetch nonce/gasPrice from RPC', requestId, 502);
  }

  // Add 20% buffer to gasPrice for congested network conditions
  const gasPriceBigInt = BigInt(gasPriceRaw);
  const gasPrice = '0x' + (gasPriceBigInt * BigInt(120) / BigInt(100)).toString(16);

  return success({
    unsigned_tx: {
      to: normalizeAddress(config.husdContract),
      data: calldata,
      value: '0x0',
      chainId: config.chainId,
      gas: '0x' + (65000).toString(16),
      nonce,
      gasPrice,
    },
    approve_amount_husd: amountHusd.toFixed(2),
    current_allowance_husd: (currentAllowanceCents / 100).toFixed(2),
    spender: normalizeAddress(config.escrowContract),
    ...(ethFunded ? { eth_funded: true, eth_fund_tx_hash: ethFundTxHash } : {}),
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

  let signedTx = body.signed_tx;
  if (!signedTx || typeof signedTx !== 'string') {
    return errors.badRequest(requestId, 'Missing or invalid field: signed_tx (must be hex string)');
  }
  // Auto-prepend 0x if missing (many libraries output without prefix)
  if (!signedTx.startsWith('0x')) {
    signedTx = '0x' + signedTx;
  }
  if (!/^0x[0-9a-fA-F]+$/.test(signedTx)) {
    return errors.badRequest(requestId, 'signed_tx must be a valid hex string');
  }

  const config = getOnchainConfig(env);

  // Pre-validate: recover sender from signed tx and verify it matches the advertiser's wallet
  let recoveredSender: string | undefined;
  try {
    const parsedTx = parseTransaction(signedTx as Hex);
    recoveredSender = await recoverTransactionAddress({ serializedTransaction: signedTx as Hex });

    if (recoveredSender.toLowerCase() !== advertiser.wallet_address!.toLowerCase()) {
      console.error(`[SendApprove] Sender mismatch: recovered=${recoveredSender}, expected=${advertiser.wallet_address}`);
      return error(
        'SENDER_MISMATCH',
        `The signed transaction sender (${recoveredSender}) does not match your registered wallet (${advertiser.wallet_address}). Make sure you are signing with the correct private key.`,
        requestId,
        400
      );
    }

    // Validate chainId
    if (parsedTx.chainId && parsedTx.chainId !== config.chainId) {
      return error(
        'WRONG_CHAIN',
        `Transaction chainId (${parsedTx.chainId}) does not match expected (${config.chainId}). Use Sepolia (chainId: ${config.chainId}).`,
        requestId,
        400
      );
    }
  } catch (e) {
    const parseMsg = e instanceof Error ? e.message : 'Unknown parse error';
    console.error('[SendApprove] Failed to validate signed tx:', parseMsg);
    return error(
      'INVALID_SIGNED_TX',
      `Could not parse or validate the signed transaction. Ensure it is a properly signed, RLP-encoded hex string. Detail: ${parseMsg}`,
      requestId,
      400
    );
  }

  // Broadcast the transaction
  let txHash: string;
  try {
    txHash = await rpcCall(config.rpcUrl, 'eth_sendRawTransaction', [signedTx]) as string;
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : 'Unknown RPC error';
    console.error('[SendApprove] eth_sendRawTransaction failed:', msg);
    // Add helpful context about sender address if broadcast fails with "insufficient funds"
    const hint = msg.includes('insufficient funds') || msg.includes('have 0')
      ? ` Verify you are signing with the private key for ${advertiser.wallet_address}.`
      : '';
    return error('BROADCAST_FAILED', `Failed to broadcast transaction: ${msg}.${hint}`, requestId, 502);
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

  // Wait for transaction confirmation (up to 60 seconds)
  // This ensures the allowance is on-chain before the agent creates a mission
  let confirmed = false;
  for (let i = 0; i < 20; i++) {
    try {
      const receipt = await rpcCall(config.rpcUrl, 'eth_getTransactionReceipt', [txHash]) as any;
      if (receipt && receipt.blockNumber) {
        confirmed = true;
        if (receipt.status === '0x0') {
          return error('TX_REVERTED', 'Approve transaction was mined but reverted on-chain. Check gas and parameters.', requestId, 400);
        }
        break;
      }
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 3000));
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
    confirmed,
    explorer_url: `${config.explorerUrl}/tx/${txHash}`,
    message: confirmed
      ? 'Escrow approved and confirmed on-chain. You can now create missions.'
      : 'Escrow approved (broadcast successful, confirmation pending). Wait a few seconds before creating missions.',
  }, requestId);
}
