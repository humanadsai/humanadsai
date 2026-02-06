/**
 * On-chain token operations service
 * Handles hUSD transfers on Sepolia using raw RPC calls
 */

import type { Env } from '../types';

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
    rpcUrl: env.RPC_URL || 'https://rpc.sepolia.org',
    husdContract: env.HUSD_CONTRACT || '0x62c2225d5691515bd4ee36539d127d0db7dceb67',
    treasuryAddress: env.TREASURY_ADDRESS || '0x0B9F043D4BcD45B95B72d4D595dEA8a31acdc017',
    adminAddress: env.ADMIN_ADDRESS || '0x64D6407757218ECbFc173C1efE0Fe7EdAaF67cC3',
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
 * Sign and send a raw transaction
 * Note: This uses the secp256k1 signing which needs to be implemented
 * For now, we'll return a simulated hash in ledger mode
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
    // Get nonce
    const nonce = await rpcCall(config.rpcUrl, 'eth_getTransactionCount', [
      config.treasuryAddress,
      'latest',
    ]) as string;

    // Get gas price
    const gasPrice = await rpcCall(config.rpcUrl, 'eth_gasPrice', []) as string;

    // Encode transfer data
    const data = encodeTransferData(toAddress, amountCents);

    // Build transaction
    const tx = {
      nonce,
      gasPrice,
      gasLimit: '0x' + DEFAULT_GAS_LIMIT.toString(16),
      to: config.husdContract,
      value: '0x0',
      data,
      chainId: config.chainId,
    };

    // Sign transaction using the private key
    // Note: Full implementation would use ethers.js or manual secp256k1 signing
    // For Workers, we need a lightweight crypto approach
    const signedTx = await signTransaction(tx, env.TREASURY_PRIVATE_KEY);

    // Send transaction
    const txHash = await rpcCall(config.rpcUrl, 'eth_sendRawTransaction', [
      signedTx,
    ]) as string;

    return {
      success: true,
      txHash,
      explorerUrl: `${config.explorerUrl}/tx/${txHash}`,
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('transferHusd error:', error);
    return {
      success: false,
      error,
    };
  }
}

/**
 * Sign a transaction with the private key
 * Simplified implementation - in production, use a proper signing library
 */
async function signTransaction(tx: {
  nonce: string;
  gasPrice: string;
  gasLimit: string;
  to: string;
  value: string;
  data: string;
  chainId: number;
}, privateKey: string): Promise<string> {
  // This is a placeholder - proper implementation requires:
  // 1. RLP encoding the transaction
  // 2. Keccak256 hashing
  // 3. ECDSA signing with secp256k1
  // 4. Appending v, r, s to the encoded transaction

  // For MVP, we'll throw an error indicating proper signing is needed
  // In production, use a crypto library compatible with Workers
  throw new Error('On-chain signing requires ethers.js or similar library. Use ledger mode for testing.');
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
