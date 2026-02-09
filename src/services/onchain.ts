/**
 * On-chain token operations service
 * Handles hUSD transfers on Sepolia using viem
 */

import type { Env } from '../types';
import { createWalletClient, createPublicClient, http, parseAbi, parseEther, getAddress, keccak256, toHex, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

/**
 * Normalize EVM address to EIP-55 checksum, with trim.
 * Returns lowercase fallback if getAddress fails.
 */
export function normalizeAddress(address: string): string {
  try {
    return getAddress(address.trim());
  } catch {
    return address.trim().toLowerCase();
  }
}

// hUSD ERC20 ABI for transfer
const TRANSFER_SELECTOR = '0xa9059cbb'; // transfer(address,uint256)

// Default configuration
const DEFAULT_CHAIN_ID = 11155111; // Sepolia
const DEFAULT_GAS_LIMIT = 100000;
const DEFAULT_FAUCET_AMOUNT = 1000_00; // $1000 in cents
const DEFAULT_COOLDOWN = 86400; // 24 hours

interface TransferResult {
  success: boolean;
  txHash?: string;
  error?: string;
  explorerUrl?: string;
}

/**
 * Get on-chain configuration from environment
 */
export function getOnchainConfig(env: Env) {
  return {
    chainId: parseInt(env.CHAIN_ID || String(DEFAULT_CHAIN_ID)),
    rpcUrl: env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    husdContract: env.HUSD_CONTRACT || '0x62c2225d5691515bd4ee36539d127d0db7dceb67',
    treasuryAddress: env.TREASURY_ADDRESS || '0x0B9F043D4BcD45B95B72d4D595dEA8a31acdc017',
    adminAddress: env.ADMIN_ADDRESS || '0x64D6407757218ECbFc173C1efE0Fe7EdAaF67cC3',
    escrowContract: env.ESCROW_CONTRACT || '0xbA71c6a6618E507faBeDF116a0c4E533d9282f6a',
    faucetContract: env.FAUCET_CONTRACT || '0x5D911fe0E0f3928eF15CA6a2540c625cd85B8341',
    faucetAmount: parseInt(env.FAUCET_PER_ADVERTISER || String(DEFAULT_FAUCET_AMOUNT)),
    faucetCooldown: parseInt(env.FAUCET_COOLDOWN_SECONDS || String(DEFAULT_COOLDOWN)),
    explorerUrl: 'https://sepolia.etherscan.io',
  };
}

/**
 * Check if treasury private key is available
 */
export function hasTreasuryKey(env: Env): boolean {
  return !!env.TREASURY_PRIVATE_KEY;
}

// Fallback RPC endpoints for Sepolia (verified working — blastapi/blockpi removed as dead)
const RPC_FALLBACKS = [
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://1rpc.io/sepolia',
  'https://sepolia.drpc.org',
];

/**
 * Make an RPC call to the Ethereum node with fallback across multiple providers.
 */
export async function rpcCall(rpcUrl: string, method: string, params: unknown[]): Promise<unknown> {
  // Build target list: primary first, then fallbacks (deduplicated)
  const targets = [rpcUrl, ...RPC_FALLBACKS.filter(u => u !== rpcUrl)];
  let lastError: Error | undefined;

  for (const target of targets) {
    try {
      const response = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json() as { result?: unknown; error?: { message: string } };
      if (data.error) {
        throw new Error(data.error.message);
      }
      return data.result;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error('Unknown RPC error');
      console.warn(`[rpcCall] ${method} failed on ${target}:`, lastError.message);
    }
  }

  throw lastError!;
}

/**
 * Get hUSD balance for an address (returns cents).
 * Throws on RPC error — callers must handle this to avoid treating RPC failure as "balance 0".
 */
export async function getHusdBalance(env: Env, address: string): Promise<number> {
  const config = getOnchainConfig(env);

  // balanceOf(address) selector
  const balanceOfSelector = '0x70a08231';
  const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0');
  const data = balanceOfSelector + paddedAddress;

  const result = await rpcCall(config.rpcUrl, 'eth_call', [
    { to: config.husdContract, data },
    'latest',
  ]) as string;

  // Convert from wei-like (6 decimals) to cents
  const balanceRaw = BigInt(result);
  // hUSD has 6 decimals, so 1 hUSD = 1_000_000 base units
  // 1 cent = 10_000 base units (since $1 = 100 cents = 1_000_000 base units)
  const balanceCents = Number(balanceRaw / BigInt(10000));
  return balanceCents;
}

/**
 * Get hUSD allowance for an owner/spender pair (returns cents).
 * Throws on RPC error — callers must handle this.
 */
export async function getHusdAllowance(env: Env, owner: string, spender: string): Promise<number> {
  const config = getOnchainConfig(env);

  // allowance(address owner, address spender) selector
  const allowanceSelector = '0xdd62ed3e';
  const paddedOwner = owner.toLowerCase().replace('0x', '').padStart(64, '0');
  const paddedSpender = spender.toLowerCase().replace('0x', '').padStart(64, '0');
  const data = allowanceSelector + paddedOwner + paddedSpender;

  const result = await rpcCall(config.rpcUrl, 'eth_call', [
    { to: config.husdContract, data },
    'latest',
  ]) as string;

  const allowanceRaw = BigInt(result);
  // hUSD has 6 decimals: 1 cent = 10_000 base units
  const allowanceCents = Number(allowanceRaw / BigInt(10000));
  return allowanceCents;
}

/**
 * Get ETH balance for gas.
 * Throws on RPC error — callers must handle this.
 */
export async function getEthBalance(env: Env, address: string): Promise<string> {
  const config = getOnchainConfig(env);

  const result = await rpcCall(config.rpcUrl, 'eth_getBalance', [
    address,
    'latest',
  ]) as string;

  const balanceWei = BigInt(result);
  const balanceEth = Number(balanceWei) / 1e18;
  return balanceEth.toFixed(6);
}

/**
 * Send ETH from Treasury to a target address for gas.
 * Used to auto-fund AI advertiser wallets so they can broadcast approve txs.
 */
export async function sendEthForGas(
  env: Env,
  toAddress: string,
  amountEth: number = 0.002
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  if (!env.TREASURY_PRIVATE_KEY) {
    return { success: false, error: 'Treasury private key not configured' };
  }

  // Ledger mode — simulate
  if (env.PAYOUT_MODE !== 'onchain') {
    const simulatedHash = 'SIMULATED_ETH_' + crypto.randomUUID().replace(/-/g, '');
    return { success: true, txHash: simulatedHash };
  }

  try {
    const { client, config } = createTreasuryClient(env);
    const normalizedTo = normalizeAddress(toAddress) as Hex;

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(config.rpcUrl, { timeout: 30_000 }),
    });

    const txHash = await client.sendTransaction({
      to: normalizedTo,
      value: parseEther(amountEth.toString()),
    });

    // Wait for receipt so the ETH is available before the AI broadcasts approve tx
    await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 60_000 });

    return { success: true, txHash };
  } catch (e) {
    const rawError = e instanceof Error ? e.message : 'Unknown error';
    const error = redactSecrets(rawError);
    console.error('sendEthForGas error:', error);
    return { success: false, error };
  }
}

/**
 * Encode ERC20 transfer call data
 */
export function encodeTransferData(toAddress: string, amountCents: number): string {
  // Convert cents to base units (6 decimals)
  // 1 cent = 10_000 base units
  const amountBaseUnits = BigInt(amountCents) * BigInt(10000);

  const paddedTo = toAddress.toLowerCase().replace('0x', '').padStart(64, '0');
  const paddedAmount = amountBaseUnits.toString(16).padStart(64, '0');

  return TRANSFER_SELECTOR + paddedTo + paddedAmount;
}

/**
 * Redact 64-character hex strings from error messages (private key leak prevention)
 */
function redactSecrets(message: string): string {
  return message.replace(/[0-9a-fA-F]{64}/g, '[REDACTED]');
}

/**
 * Transfer hUSD using viem wallet client
 * Signs and sends ERC20 transfer on-chain (Sepolia)
 */
export async function transferHusd(
  env: Env,
  toAddress: string,
  amountCents: number,
  options?: { forceOnchain?: boolean }
): Promise<TransferResult> {
  const config = getOnchainConfig(env);

  // Check if we have the private key
  if (!env.TREASURY_PRIVATE_KEY) {
    return {
      success: false,
      error: 'Treasury private key not configured',
    };
  }

  // Check if payout mode is onchain (skip check if forceOnchain is true)
  if (!options?.forceOnchain && env.PAYOUT_MODE !== 'onchain') {
    // Ledger mode - return simulated tx
    const simulatedHash = 'SIMULATED_' + crypto.randomUUID().replace(/-/g, '');
    return {
      success: true,
      txHash: simulatedHash,
      explorerUrl: `${config.explorerUrl}/tx/${simulatedHash}`,
    };
  }

  try {
    // Normalize private key with 0x prefix
    const rawKey = env.TREASURY_PRIVATE_KEY.trim();
    const privateKey: Hex = rawKey.startsWith('0x') ? rawKey as Hex : `0x${rawKey}`;

    // Derive account from private key
    const account = privateKeyToAccount(privateKey);

    // Verify derived address matches configured TREASURY_ADDRESS (fail-fast on config mismatch)
    if (account.address.toLowerCase() !== config.treasuryAddress.toLowerCase()) {
      console.error('Treasury address mismatch: derived address does not match TREASURY_ADDRESS');
      return {
        success: false,
        error: 'Treasury key/address mismatch. The private key does not correspond to the configured TREASURY_ADDRESS.',
      };
    }

    // Create wallet client with timeout and retry
    const client = createWalletClient({
      account,
      chain: sepolia,
      transport: http(config.rpcUrl, {
        timeout: 20_000,
        retryCount: 1,
      }),
    });

    // Convert cents to base units (6 decimals): 1 cent = 10_000 base units
    const amountBaseUnits = BigInt(amountCents) * BigInt(10_000);

    // Normalize recipient address to EIP-55 checksum
    const normalizedTo = normalizeAddress(toAddress) as Hex;

    // Execute ERC20 transfer via writeContract
    const txHash = await client.writeContract({
      address: config.husdContract as Hex,
      abi: parseAbi(['function transfer(address to, uint256 amount) returns (bool)']),
      functionName: 'transfer',
      args: [normalizedTo, amountBaseUnits],
    });

    return {
      success: true,
      txHash,
      explorerUrl: `${config.explorerUrl}/tx/${txHash}`,
    };
  } catch (e) {
    const rawError = e instanceof Error ? e.message : 'Unknown error';
    const error = redactSecrets(rawError);
    console.error('transferHusd error:', error);
    return {
      success: false,
      error,
    };
  }
}

/**
 * Check faucet cooldown for an address
 */
export async function checkFaucetCooldown(
  env: Env,
  address: string
): Promise<{ allowed: boolean; nextAvailable?: string; lastFaucet?: string }> {
  const config = getOnchainConfig(env);
  const normalizedAddr = normalizeAddress(address);

  const lastOp = await env.DB.prepare(
    `SELECT created_at FROM token_ops
     WHERE LOWER(to_address) = LOWER(?) AND op_type = 'faucet' AND status != 'failed'
     ORDER BY created_at DESC LIMIT 1`
  ).bind(normalizedAddr).first<{ created_at: string }>();

  if (!lastOp) {
    return { allowed: true };
  }

  const lastTime = new Date(lastOp.created_at).getTime();
  const cooldownMs = config.faucetCooldown * 1000;
  const nextAvailableMs = lastTime + cooldownMs;
  const now = Date.now();

  if (now >= nextAvailableMs) {
    return { allowed: true, lastFaucet: lastOp.created_at };
  }

  return {
    allowed: false,
    lastFaucet: lastOp.created_at,
    nextAvailable: new Date(nextAvailableMs).toISOString(),
  };
}

/**
 * Record a token operation
 */
export async function recordTokenOp(
  env: Env,
  op: {
    opType: 'mint' | 'transfer' | 'faucet';
    fromAddress?: string;
    toAddress: string;
    amountCents: number;
    txHash?: string;
    status: 'pending' | 'submitted' | 'confirmed' | 'failed';
    errorMessage?: string;
    operatorId?: string;
  }
): Promise<string> {
  const id = crypto.randomUUID().replace(/-/g, '');

  await env.DB.prepare(
    `INSERT INTO token_ops (id, op_type, from_address, to_address, amount_cents, tx_hash, status, error_message, operator_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    op.opType,
    op.fromAddress ? normalizeAddress(op.fromAddress) : null,
    normalizeAddress(op.toAddress),
    op.amountCents,
    op.txHash || null,
    op.status,
    op.errorMessage || null,
    op.operatorId || null
  ).run();

  return id;
}

/**
 * Update token operation status
 */
export async function updateTokenOpStatus(
  env: Env,
  id: string,
  status: 'confirmed' | 'failed',
  txHash?: string,
  errorMessage?: string
): Promise<void> {
  const confirmedAt = status === 'confirmed' ? new Date().toISOString() : null;

  await env.DB.prepare(
    `UPDATE token_ops SET status = ?, tx_hash = COALESCE(?, tx_hash), error_message = ?, confirmed_at = ?
     WHERE id = ?`
  ).bind(status, txHash || null, errorMessage || null, confirmedAt, id).run();
}

// ============================================
// Escrow Contract Functions
// ============================================

// Escrow contract ABI fragments
const ESCROW_ABI = parseAbi([
  'function depositToDeal(bytes32 dealId, uint128 amount, uint32 maxParticipants, uint64 expiresAt) external',
  'function depositOnBehalfWithPermit(bytes32 dealId, address advertiser, uint128 amount, uint32 maxParticipants, uint64 expiresAt, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external',
  'function releaseToDeal(bytes32 dealId, address operator, uint128 rewardAmount) external',
  'function refundDeal(bytes32 dealId) external',
  'function getWithdrawableBalance(address account) external view returns (uint256)',
  'function getDeal(bytes32 dealId) external view returns ((address advertiser, uint128 totalDeposited, uint128 totalReleased, uint128 totalRefunded, uint32 maxParticipants, uint32 currentReleased, uint8 status, uint64 expiresAt))',
]);

const HUSD_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
]);

interface EscrowResult {
  success: boolean;
  txHash?: string;
  depositTxHash?: string;
  error?: string;
}

/**
 * Convert a deal ID string to a deterministic bytes32 hash
 */
export function dealIdToBytes32(dealId: string): Hex {
  return keccak256(toHex(dealId));
}

/**
 * Create a viem wallet client with the treasury private key
 */
function createTreasuryClient(env: Env) {
  const config = getOnchainConfig(env);
  const rawKey = env.TREASURY_PRIVATE_KEY!.trim();
  const privateKey: Hex = rawKey.startsWith('0x') ? rawKey as Hex : `0x${rawKey}`;
  const account = privateKeyToAccount(privateKey);

  if (account.address.toLowerCase() !== config.treasuryAddress.toLowerCase()) {
    throw new Error('Treasury key/address mismatch');
  }

  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(config.rpcUrl, {
      timeout: 30_000,
      retryCount: 1,
    }),
  });

  return { client, account, config };
}

/**
 * Approve hUSD and deposit into escrow contract for a deal.
 *
 * Step 1: hUSD.approve(escrowContract, totalAmount)
 * Step 2: escrow.depositToDeal(dealIdBytes32, totalAmount, maxParticipants, expiresAt)
 */
export async function escrowApproveAndDeposit(
  env: Env,
  dealId: string,
  totalAmountCents: number,
  maxParticipants: number,
  expiresAtISO: string
): Promise<EscrowResult> {
  const config = getOnchainConfig(env);

  if (!env.TREASURY_PRIVATE_KEY) {
    return { success: false, error: 'Treasury private key not configured' };
  }

  // Ledger mode — simulate
  if (env.PAYOUT_MODE !== 'onchain') {
    const simulatedHash = 'SIMULATED_DEPOSIT_' + crypto.randomUUID().replace(/-/g, '');
    return { success: true, depositTxHash: simulatedHash };
  }

  try {
    const { client, account, config: cfg } = createTreasuryClient(env);
    const dealIdBytes32 = dealIdToBytes32(dealId);

    // Convert cents to base units (6 decimals): 1 cent = 10_000 base units
    const totalAmountBaseUnits = BigInt(totalAmountCents) * BigInt(10_000);
    const expiresAtUnix = BigInt(Math.floor(new Date(expiresAtISO).getTime() / 1000));

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(cfg.rpcUrl, { timeout: 30_000 }),
    });

    // Step 1: Check current allowance — only approve if insufficient
    // Use maxUint256 approval to avoid race conditions with concurrent deposits
    const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    const currentAllowance = await publicClient.readContract({
      address: cfg.husdContract as Hex,
      abi: HUSD_ABI,
      functionName: 'allowance',
      args: [account.address, cfg.escrowContract as Hex],
    }) as bigint;

    let approveTxHash: string | undefined;
    if (currentAllowance < totalAmountBaseUnits) {
      // Approve maxUint256 so future deposits don't need re-approval
      approveTxHash = await client.writeContract({
        address: cfg.husdContract as Hex,
        abi: HUSD_ABI,
        functionName: 'approve',
        args: [cfg.escrowContract as Hex, MAX_UINT256],
      });

      // Wait for approve tx to be mined before deposit
      await publicClient.waitForTransactionReceipt({ hash: approveTxHash as Hex, timeout: 60_000 });
    }

    // Step 2: Deposit into escrow
    const depositTxHash = await client.writeContract({
      address: cfg.escrowContract as Hex,
      abi: ESCROW_ABI,
      functionName: 'depositToDeal',
      args: [
        dealIdBytes32,
        totalAmountBaseUnits as unknown as bigint,
        maxParticipants,
        expiresAtUnix as unknown as bigint,
      ],
    });

    return {
      success: true,
      txHash: approveTxHash,
      depositTxHash,
    };
  } catch (e) {
    const rawError = e instanceof Error ? e.message : 'Unknown error';
    const error = redactSecrets(rawError);
    console.error('escrowApproveAndDeposit error:', error);
    return {
      success: false,
      error: 'Escrow deposit failed (server-side). This is NOT something you need to fix — please retry mission creation. Detail: ' + error,
    };
  }
}

/**
 * Deposit into escrow on behalf of an advertiser.
 * Requires the advertiser to have already approved the escrow contract (via approve tx).
 * Treasury (ARBITER) calls depositOnBehalfWithPermit with dummy permit values —
 * the permit silently fails (try/catch), and safeTransferFrom succeeds via existing allowance.
 * Advertiser's hUSD decreases on-chain.
 */
export async function escrowDepositOnBehalf(
  env: Env,
  dealId: string,
  advertiserAddress: string,
  totalAmountCents: number,
  maxParticipants: number,
  expiresAtISO: string
): Promise<EscrowResult> {
  if (!env.TREASURY_PRIVATE_KEY) {
    return { success: false, error: 'Treasury private key not configured' };
  }

  // Ledger mode — simulate
  if (env.PAYOUT_MODE !== 'onchain') {
    const simulatedHash = 'SIMULATED_DEPOSIT_' + crypto.randomUUID().replace(/-/g, '');
    return { success: true, depositTxHash: simulatedHash };
  }

  try {
    const { client, config: cfg } = createTreasuryClient(env);
    const dealIdBytes32 = dealIdToBytes32(dealId);

    // Convert cents to base units (6 decimals): 1 cent = 10_000 base units
    const totalAmountBaseUnits = BigInt(totalAmountCents) * BigInt(10_000);
    const expiresAtUnix = BigInt(Math.floor(new Date(expiresAtISO).getTime() / 1000));
    const normalizedAdvertiser = normalizeAddress(advertiserAddress) as Hex;

    // Dummy permit values — permit() will silently fail via try/catch in the contract,
    // then safeTransferFrom succeeds because the advertiser already approved the escrow.
    const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

    const depositTxHash = await client.writeContract({
      address: cfg.escrowContract as Hex,
      abi: ESCROW_ABI,
      functionName: 'depositOnBehalfWithPermit',
      args: [
        dealIdBytes32,
        normalizedAdvertiser,
        totalAmountBaseUnits as unknown as bigint,
        maxParticipants,
        expiresAtUnix as unknown as bigint,
        BigInt(0),  // deadline (dummy)
        0,          // v (dummy)
        ZERO_BYTES32, // r (dummy)
        ZERO_BYTES32, // s (dummy)
      ],
    });

    return {
      success: true,
      depositTxHash,
    };
  } catch (e) {
    const rawError = e instanceof Error ? e.message : 'Unknown error';
    const error = redactSecrets(rawError);
    console.error('escrowDepositOnBehalf error:', error);
    return {
      success: false,
      error: 'Escrow deposit failed (server-side). Detail: ' + error,
    };
  }
}

/**
 * Release escrow funds for a completed mission.
 * Treasury (ARBITER) calls releaseToDeal — contract auto-splits 10% fee + 90% operator.
 *
 * @param rewardAmountCents - Full reward amount (contract deducts fee internally)
 */
export async function escrowRelease(
  env: Env,
  dealId: string,
  operatorAddress: string,
  rewardAmountCents: number
): Promise<EscrowResult> {
  const config = getOnchainConfig(env);

  if (!env.TREASURY_PRIVATE_KEY) {
    return { success: false, error: 'Treasury private key not configured' };
  }

  // Ledger mode — simulate
  if (env.PAYOUT_MODE !== 'onchain') {
    const simulatedHash = 'SIMULATED_RELEASE_' + crypto.randomUUID().replace(/-/g, '');
    return { success: true, txHash: simulatedHash };
  }

  try {
    const { client, config: cfg } = createTreasuryClient(env);
    const dealIdBytes32 = dealIdToBytes32(dealId);
    const rewardBaseUnits = BigInt(rewardAmountCents) * BigInt(10_000);
    const normalizedOperator = normalizeAddress(operatorAddress) as Hex;

    const txHash = await client.writeContract({
      address: cfg.escrowContract as Hex,
      abi: ESCROW_ABI,
      functionName: 'releaseToDeal',
      args: [dealIdBytes32, normalizedOperator, rewardBaseUnits as unknown as bigint],
    });

    return { success: true, txHash };
  } catch (e) {
    const rawError = e instanceof Error ? e.message : 'Unknown error';
    const error = redactSecrets(rawError);
    console.error('escrowRelease error:', error);
    return { success: false, error };
  }
}

/**
 * Get an operator's withdrawable balance from the escrow contract.
 * Returns cents. Throws on RPC error.
 */
export async function escrowGetBalance(env: Env, address: string): Promise<number> {
  const config = getOnchainConfig(env);

  // keccak256("getWithdrawableBalance(address)") = 0x843592d3...
  const selector = '0x843592d3';
  const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0');
  const data = selector + paddedAddress;

  const result = await rpcCall(config.rpcUrl, 'eth_call', [
    { to: config.escrowContract, data },
    'latest',
  ]) as string;

  const balanceRaw = BigInt(result || '0x0');
  // hUSD has 6 decimals: 1 cent = 10_000 base units
  const balanceCents = Number(balanceRaw / BigInt(10000));
  return balanceCents;
}

/**
 * Refund remaining escrowed funds for a deal back to the advertiser.
 * ARBITER calls refundDeal.
 */
export async function escrowRefund(env: Env, dealId: string): Promise<EscrowResult> {
  if (!env.TREASURY_PRIVATE_KEY) {
    return { success: false, error: 'Treasury private key not configured' };
  }

  if (env.PAYOUT_MODE !== 'onchain') {
    const simulatedHash = 'SIMULATED_REFUND_' + crypto.randomUUID().replace(/-/g, '');
    return { success: true, txHash: simulatedHash };
  }

  try {
    const { client, config } = createTreasuryClient(env);
    const dealIdBytes32 = dealIdToBytes32(dealId);

    const txHash = await client.writeContract({
      address: config.escrowContract as Hex,
      abi: ESCROW_ABI,
      functionName: 'refundDeal',
      args: [dealIdBytes32],
    });

    return { success: true, txHash };
  } catch (e) {
    const rawError = e instanceof Error ? e.message : 'Unknown error';
    const error = redactSecrets(rawError);
    console.error('escrowRefund error:', error);
    return { success: false, error };
  }
}
