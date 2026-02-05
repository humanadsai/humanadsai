/**
 * Payout Configuration
 *
 * Manages payout mode (ledger/onchain) and chain configuration
 * for testnet/production environments.
 */

export type PayoutMode = 'ledger' | 'onchain';

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl?: string;
  explorerUrl?: string;
  tokens: {
    [symbol: string]: {
      address: string;
      decimals: number;
    };
  };
}

// Supported chains configuration
export const CHAIN_CONFIGS: Record<string, Record<string, ChainConfig>> = {
  // Production chains
  production: {
    ethereum: {
      chainId: 1,
      name: 'Ethereum Mainnet',
      explorerUrl: 'https://etherscan.io',
      tokens: {
        USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
        USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
        ETH: { address: '0x0000000000000000000000000000000000000000', decimals: 18 },
      },
    },
    polygon: {
      chainId: 137,
      name: 'Polygon Mainnet',
      explorerUrl: 'https://polygonscan.com',
      tokens: {
        USDC: { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6 },
        USDT: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
        MATIC: { address: '0x0000000000000000000000000000000000000000', decimals: 18 },
      },
    },
    base: {
      chainId: 8453,
      name: 'Base Mainnet',
      explorerUrl: 'https://basescan.org',
      tokens: {
        USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
        USDT: { address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6 },
        ETH: { address: '0x0000000000000000000000000000000000000000', decimals: 18 },
      },
    },
  },

  // Testnet chains (for development/QA)
  testnet: {
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      explorerUrl: 'https://sepolia.etherscan.io',
      tokens: {
        // Sepolia USDC (Circle's official testnet USDC)
        USDC: { address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', decimals: 6 },
        ETH: { address: '0x0000000000000000000000000000000000000000', decimals: 18 },
      },
    },
    base_sepolia: {
      chainId: 84532,
      name: 'Base Sepolia',
      explorerUrl: 'https://sepolia.basescan.org',
      tokens: {
        // Base Sepolia USDC
        USDC: { address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', decimals: 6 },
        ETH: { address: '0x0000000000000000000000000000000000000000', decimals: 18 },
      },
    },
  },
};

// Treasury addresses
export const TREASURY_ADDRESSES: Record<string, Record<string, string>> = {
  production: {
    ethereum: '0x...', // TODO: Set actual treasury addresses
    polygon: '0x...',
    base: '0x...',
    solana: '...',
  },
  testnet: {
    sepolia: '0x...', // Test treasury address
    base_sepolia: '0x...',
  },
};

// Fee recipient address (10% platform fee)
export const FEE_RECIPIENT_ADDRESSES: Record<string, string> = {
  production: '0x...', // TODO: Set actual fee recipient address
  testnet: '0x...', // Test fee recipient address
};

// Platform fee percentage (in basis points, 1000 = 10%)
export const PLATFORM_FEE_BPS = 1000;

/**
 * Get payout configuration from environment
 */
export function getPayoutConfig(env: { PAYOUT_MODE?: string; ENVIRONMENT?: string }) {
  const mode: PayoutMode = (env.PAYOUT_MODE as PayoutMode) || 'onchain';
  const environment = env.ENVIRONMENT || 'production';
  const isTestnet = environment !== 'production' || mode === 'ledger';

  return {
    mode,
    environment,
    isTestnet,
    chains: isTestnet ? CHAIN_CONFIGS.testnet : CHAIN_CONFIGS.production,
    treasury: isTestnet ? TREASURY_ADDRESSES.testnet : TREASURY_ADDRESSES.production,
    feeRecipient: isTestnet ? FEE_RECIPIENT_ADDRESSES.testnet : FEE_RECIPIENT_ADDRESSES.production,
    platformFeeBps: PLATFORM_FEE_BPS,
  };
}

/**
 * Generate a simulated transaction hash for ledger mode
 */
export function generateSimulatedTxHash(): string {
  const uuid = crypto.randomUUID().replace(/-/g, '');
  return `SIMULATED_${uuid}`;
}

/**
 * Check if a transaction hash is simulated
 */
export function isSimulatedTxHash(txHash: string): boolean {
  return txHash.startsWith('SIMULATED_');
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerTxUrl(chain: string, txHash: string, isTestnet: boolean): string | null {
  if (isSimulatedTxHash(txHash)) {
    return null; // No explorer URL for simulated transactions
  }

  const configs = isTestnet ? CHAIN_CONFIGS.testnet : CHAIN_CONFIGS.production;
  const chainConfig = configs[chain];

  if (!chainConfig?.explorerUrl) {
    return null;
  }

  return `${chainConfig.explorerUrl}/tx/${txHash}`;
}
