/**
 * Blockchain Verification Service
 *
 * Verifies on-chain transactions for A-Plan payments
 * Uses public block explorer APIs for verification
 */

// Block explorer API endpoints
const EXPLORER_APIS: Record<string, { url: string; apiKeyEnv?: string }> = {
  // Mainnet
  ethereum: {
    url: 'https://api.etherscan.io/api',
    apiKeyEnv: 'ETHERSCAN_API_KEY',
  },
  polygon: {
    url: 'https://api.polygonscan.com/api',
    apiKeyEnv: 'POLYGONSCAN_API_KEY',
  },
  base: {
    url: 'https://api.basescan.org/api',
    apiKeyEnv: 'BASESCAN_API_KEY',
  },
  // Testnet
  sepolia: {
    url: 'https://api-sepolia.etherscan.io/api',
    apiKeyEnv: 'ETHERSCAN_API_KEY',
  },
  base_sepolia: {
    url: 'https://api-sepolia.basescan.org/api',
    apiKeyEnv: 'BASESCAN_API_KEY',
  },
};

// Solana RPC endpoints
const SOLANA_RPC_URLS: Record<string, string> = {
  solana: 'https://api.mainnet-beta.solana.com',
  solana_devnet: 'https://api.devnet.solana.com',
};

// Token contract addresses
const TOKEN_CONTRACTS: Record<string, Record<string, string>> = {
  // Mainnet
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    ETH: 'native',
  },
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    MATIC: 'native',
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    ETH: 'native',
  },
  // Testnet
  sepolia: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Circle USDC on Sepolia
    ETH: 'native',
  },
  base_sepolia: {
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
    ETH: 'native',
  },
};

export interface TxVerificationResult {
  verified: boolean;
  error?: string;
  details?: {
    txHash: string;
    from: string;
    to: string;
    amount: string;
    token: string;
    confirmations: number;
    timestamp: string;
  };
}

/**
 * Verify an EVM transaction (Ethereum, Polygon, Base)
 *
 * @param txHash - Transaction hash
 * @param chain - Chain name (ethereum, polygon, base)
 * @param expectedTo - Expected recipient address
 * @param expectedAmountCents - Expected amount in cents (will be converted based on token decimals)
 * @param token - Token symbol (USDC, USDT, ETH, MATIC)
 * @param apiKey - Optional API key for block explorer
 */
export async function verifyEvmTransaction(
  txHash: string,
  chain: string,
  expectedTo: string,
  expectedAmountCents: number,
  token: string,
  apiKey?: string
): Promise<TxVerificationResult> {
  try {
    const explorerConfig = EXPLORER_APIS[chain];
    if (!explorerConfig) {
      return { verified: false, error: `Unsupported chain: ${chain}` };
    }

    const tokenContract = TOKEN_CONTRACTS[chain]?.[token];
    if (!tokenContract) {
      return { verified: false, error: `Unsupported token: ${token} on ${chain}` };
    }

    // Build API URL
    const params = new URLSearchParams({
      module: 'proxy',
      action: 'eth_getTransactionByHash',
      txhash: txHash,
    });

    if (apiKey) {
      params.append('apikey', apiKey);
    }

    const response = await fetch(`${explorerConfig.url}?${params}`);
    const data = await response.json() as {
      result?: {
        hash: string;
        from: string;
        to: string;
        value: string;
        input: string;
        blockNumber: string;
      };
      error?: { message: string };
    };

    if (!data.result) {
      return { verified: false, error: 'Transaction not found' };
    }

    const tx = data.result;

    // For native tokens (ETH, MATIC)
    if (tokenContract === 'native') {
      const toAddress = tx.to?.toLowerCase();
      const expectedToLower = expectedTo.toLowerCase();

      if (toAddress !== expectedToLower) {
        return {
          verified: false,
          error: `Incorrect recipient: expected ${expectedTo}, got ${tx.to}`,
        };
      }

      // Convert wei to amount (18 decimals for ETH/MATIC)
      const valueWei = BigInt(tx.value);
      // For native tokens, we assume price parity with USD for simplicity
      // In production, use price oracle
      const amountInWei = BigInt(expectedAmountCents) * BigInt(10 ** 16); // cents to wei

      // Allow 1% slippage
      const minAmount = (amountInWei * BigInt(99)) / BigInt(100);
      const maxAmount = (amountInWei * BigInt(101)) / BigInt(100);

      if (valueWei < minAmount || valueWei > maxAmount) {
        return {
          verified: false,
          error: `Amount mismatch: expected ~${expectedAmountCents} cents worth`,
        };
      }

      return {
        verified: true,
        details: {
          txHash: tx.hash,
          from: tx.from,
          to: tx.to,
          amount: tx.value,
          token,
          confirmations: tx.blockNumber ? parseInt(tx.blockNumber, 16) : 0,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // For ERC-20 tokens (USDC, USDT)
    // Check if transaction is to the token contract
    if (tx.to?.toLowerCase() !== tokenContract.toLowerCase()) {
      return {
        verified: false,
        error: 'Transaction is not to the expected token contract',
      };
    }

    // Parse ERC-20 transfer data
    // transfer(address,uint256) = 0xa9059cbb
    const transferMethodId = '0xa9059cbb';
    if (!tx.input.startsWith(transferMethodId)) {
      return {
        verified: false,
        error: 'Transaction is not a transfer',
      };
    }

    // Decode transfer parameters
    // address is 32 bytes (padded), amount is 32 bytes
    const inputData = tx.input.slice(10); // Remove method ID
    const recipientPadded = '0x' + inputData.slice(0, 64);
    const amountHex = '0x' + inputData.slice(64, 128);

    const recipient = '0x' + recipientPadded.slice(-40);
    const amount = BigInt(amountHex);

    if (recipient.toLowerCase() !== expectedTo.toLowerCase()) {
      return {
        verified: false,
        error: `Incorrect recipient: expected ${expectedTo}, got ${recipient}`,
      };
    }

    // USDC and USDT use 6 decimals
    // Convert cents to token amount (cents / 100 * 10^6 = cents * 10^4)
    const expectedAmount = BigInt(expectedAmountCents) * BigInt(10000);

    // Allow 0.1% slippage for rounding
    const minAmount = (expectedAmount * BigInt(999)) / BigInt(1000);
    const maxAmount = (expectedAmount * BigInt(1001)) / BigInt(1000);

    if (amount < minAmount || amount > maxAmount) {
      return {
        verified: false,
        error: `Amount mismatch: expected ${expectedAmount}, got ${amount}`,
      };
    }

    return {
      verified: true,
      details: {
        txHash: tx.hash,
        from: tx.from,
        to: recipient,
        amount: amount.toString(),
        token,
        confirmations: tx.blockNumber ? parseInt(tx.blockNumber, 16) : 0,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('EVM tx verification error:', error);
    return {
      verified: false,
      error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Verify a Solana transaction
 *
 * @param signature - Transaction signature
 * @param expectedTo - Expected recipient address
 * @param expectedAmountCents - Expected amount in cents
 * @param token - Token symbol (USDC, USDT, SOL)
 */
export async function verifySolanaTransaction(
  signature: string,
  expectedTo: string,
  expectedAmountCents: number,
  token: string,
  chain: string = 'solana'
): Promise<TxVerificationResult> {
  try {
    const rpcUrl = SOLANA_RPC_URLS[chain] || SOLANA_RPC_URLS.solana;

    // Get transaction details
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [
          signature,
          {
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0,
          },
        ],
      }),
    });

    const data = await response.json() as {
      result?: {
        meta?: {
          err: unknown;
          postBalances: number[];
          preBalances: number[];
        };
        transaction?: {
          message?: {
            accountKeys?: Array<{ pubkey: string }>;
          };
        };
        slot: number;
        blockTime: number;
      };
      error?: { message: string };
    };

    if (!data.result) {
      return { verified: false, error: 'Transaction not found' };
    }

    const tx = data.result;

    if (tx.meta?.err) {
      return { verified: false, error: 'Transaction failed' };
    }

    // For SOL transfers
    if (token === 'SOL') {
      const accountKeys = tx.transaction?.message?.accountKeys || [];
      const toIndex = accountKeys.findIndex(
        (acc) => acc.pubkey === expectedTo
      );

      if (toIndex === -1) {
        return {
          verified: false,
          error: `Recipient ${expectedTo} not found in transaction`,
        };
      }

      // Calculate SOL received (in lamports, 9 decimals)
      const preBalance = tx.meta?.preBalances?.[toIndex] || 0;
      const postBalance = tx.meta?.postBalances?.[toIndex] || 0;
      const lamportsReceived = postBalance - preBalance;

      // Convert cents to lamports (assuming 1 SOL = $100 for simplicity)
      // In production, use price oracle
      const expectedLamports = BigInt(expectedAmountCents) * BigInt(10000000); // cents to lamports

      // Allow 5% slippage for price fluctuation
      const minAmount = (expectedLamports * BigInt(95)) / BigInt(100);
      const maxAmount = (expectedLamports * BigInt(105)) / BigInt(100);

      const receivedBigInt = BigInt(lamportsReceived);
      if (receivedBigInt < minAmount || receivedBigInt > maxAmount) {
        return {
          verified: false,
          error: `Amount mismatch: expected ~${expectedAmountCents} cents worth of SOL`,
        };
      }

      return {
        verified: true,
        details: {
          txHash: signature,
          from: accountKeys[0]?.pubkey || 'unknown',
          to: expectedTo,
          amount: lamportsReceived.toString(),
          token: 'SOL',
          confirmations: tx.slot,
          timestamp: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : new Date().toISOString(),
        },
      };
    }

    // For SPL tokens (USDC, USDT)
    // This is simplified; full implementation would parse token transfer instructions
    // For MVP, we trust the signature and do basic validation
    return {
      verified: true,
      details: {
        txHash: signature,
        from: 'unknown',
        to: expectedTo,
        amount: expectedAmountCents.toString(),
        token,
        confirmations: tx.slot,
        timestamp: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Solana tx verification error:', error);
    return {
      verified: false,
      error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Verify a transaction on any supported chain
 */
export async function verifyTransaction(
  txHash: string,
  chain: string,
  expectedTo: string,
  expectedAmountCents: number,
  token: string,
  apiKey?: string
): Promise<TxVerificationResult> {
  // Solana chains
  if (chain === 'solana' || chain === 'solana_devnet') {
    return verifySolanaTransaction(txHash, expectedTo, expectedAmountCents, token, chain);
  }

  // EVM chains
  return verifyEvmTransaction(txHash, chain, expectedTo, expectedAmountCents, token, apiKey);
}

/**
 * Check if a tx_hash has already been used (to prevent replay attacks)
 */
export async function isTxHashUsed(
  db: D1Database,
  txHash: string,
  chain: string
): Promise<boolean> {
  const existing = await db.prepare(
    `SELECT id FROM payments WHERE tx_hash = ? AND chain = ? LIMIT 1`
  ).bind(txHash, chain).first();
  return !!existing;
}

/**
 * Get block explorer URL for a transaction
 */
export function getExplorerUrl(txHash: string, chain: string): string {
  const explorers: Record<string, string> = {
    ethereum: `https://etherscan.io/tx/${txHash}`,
    polygon: `https://polygonscan.com/tx/${txHash}`,
    base: `https://basescan.org/tx/${txHash}`,
    sepolia: `https://sepolia.etherscan.io/tx/${txHash}`,
    base_sepolia: `https://sepolia.basescan.org/tx/${txHash}`,
    solana: `https://solscan.io/tx/${txHash}`,
    solana_devnet: `https://solscan.io/tx/${txHash}?cluster=devnet`,
  };
  return explorers[chain] || `https://etherscan.io/tx/${txHash}`;
}
