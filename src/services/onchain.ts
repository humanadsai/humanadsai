/**
 * On-chain token operations service
 * Handles hUSD transfers on Sepolia using viem
 */

import type { Env } from '../types';
import { createWalletClient, http, parseAbi, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

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

/**
 * Make an RPC call to the Ethereum node
 */
async function rpcCall(rpcUrl: string, method: string, params: unknown[]): Promise<unknown> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  const data = await response.json() as { result?: unknown; error?: { message: string } };
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.result;
}

/**
 * Get hUSD balance for an address (returns cents)
 */
export async function getHusdBalance(env: Env, address: string): Promise<number> {
  const config = getOnchainConfig(env);

  // balanceOf(address) selector
  const balanceOfSelector = '0x70a08231';
  const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0');
  const data = balanceOfSelector + paddedAddress;

  try {
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
  } catch (e) {
    console.error('getHusdBalance error:', e);
    return 0;
  }
}

/**
 * Get ETH balance for gas
 */
export async function getEthBalance(env: Env, address: string): Promise<string> {
  const config = getOnchainConfig(env);

  try {
    const result = await rpcCall(config.rpcUrl, 'eth_getBalance', [
      address,
      'latest',
    ]) as string;

    const balanceWei = BigInt(result);
    const balanceEth = Number(balanceWei) / 1e18;
    return balanceEth.toFixed(6);
  } catch (e) {
    console.error('getEthBalance error:', e);
    return '0';
  }
}

/**
 * Encode ERC20 transfer call data
 */
function encodeTransferData(toAddress: string, amountCents: number): string {
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
  amountCents: number
): Promise<TransferResult> {
  const config = getOnchainConfig(env);

  // Check if we have the private key
  if (!env.TREASURY_PRIVATE_KEY) {
    return {
      success: false,
      error: 'Treasury private key not configured',
    };
  }

  // Check if payout mode is onchain
  if (env.PAYOUT_MODE !== 'onchain') {
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

    // Execute ERC20 transfer via writeContract
    const txHash = await client.writeContract({
      address: config.husdContract as Hex,
      abi: parseAbi(['function transfer(address to, uint256 amount) returns (bool)']),
      functionName: 'transfer',
      args: [toAddress as Hex, amountBaseUnits],
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
  const normalizedAddress = address.toLowerCase();

  const lastOp = await env.DB.prepare(
    `SELECT created_at FROM token_ops
     WHERE to_address = ? AND op_type = 'faucet' AND status != 'failed'
     ORDER BY created_at DESC LIMIT 1`
  ).bind(normalizedAddress).first<{ created_at: string }>();

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
    op.fromAddress || null,
    op.toAddress.toLowerCase(),
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
