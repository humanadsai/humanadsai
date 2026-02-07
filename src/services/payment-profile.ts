/**
 * Payment Profile Service
 * Manages environment switching between test and production modes
 */

import type { Env } from '../types';

// Payment Profile Types
export type PaymentProfileId = 'TEST_SEPOLIA_HUSD' | 'PROD_BASE_USDC' | 'PROD_ETH_USDC';

export interface PaymentProfile {
  id: PaymentProfileId;
  name: string;
  isTestnet: boolean;
  isSelectable: boolean; // If false, profile is hidden from selection UI
  chain: {
    id: number;
    name: string;
    explorerUrl: string;
  };
  token: {
    symbol: string;
    name: string;
    contract: string;
    decimals: number;
  };
  treasury: {
    address: string;
    feeRecipient: string;
  };
  verification: {
    mode: 'OFF' | 'RELAXED' | 'STRICT';
    requireConfirmations: number;
  };
  ui: {
    bannerColor: string;
    bannerText: string;
    badgeClass: string;
  };
}

// Payment Profile Definitions
export const PAYMENT_PROFILES: Record<PaymentProfileId, PaymentProfile> = {
  TEST_SEPOLIA_HUSD: {
    id: 'TEST_SEPOLIA_HUSD',
    name: 'Test (Sepolia hUSD)',
    isTestnet: true,
    isSelectable: true, // Active for tonight's launch
    chain: {
      id: 11155111,
      name: 'Sepolia',
      explorerUrl: 'https://sepolia.etherscan.io',
    },
    token: {
      symbol: 'hUSD',
      name: 'HumanAds USD (Test)',
      contract: '0x62c2225d5691515bd4ee36539d127d0db7dceb67',
      decimals: 6,
    },
    treasury: {
      address: '0x0B9F043D4BcD45B95B72d4D595dEA8a31acdc017',
      feeRecipient: '0x5acd3371DB99f7D17DFaFD14b522148260862DE8',
    },
    verification: {
      mode: 'RELAXED',
      requireConfirmations: 1,
    },
    ui: {
      bannerColor: '#4DFFFF',
      bannerText: 'TEST MODE • Sepolia • hUSD ONLY',
      badgeClass: 'env-test',
    },
  },
  PROD_BASE_USDC: {
    id: 'PROD_BASE_USDC',
    name: 'Production (Base USDC)',
    isTestnet: false,
    isSelectable: false, // Not ready - treasury not configured
    chain: {
      id: 8453,
      name: 'Base',
      explorerUrl: 'https://basescan.org',
    },
    token: {
      symbol: 'USDC',
      name: 'USD Coin',
      contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
    },
    treasury: {
      address: '', // TODO: Set production treasury
      feeRecipient: '', // TODO: Set production fee recipient
    },
    verification: {
      mode: 'STRICT',
      requireConfirmations: 12,
    },
    ui: {
      bannerColor: '#22c55e',
      bannerText: 'PRODUCTION • Base • USDC',
      badgeClass: 'env-prod',
    },
  },
  PROD_ETH_USDC: {
    id: 'PROD_ETH_USDC',
    name: 'Production (Ethereum USDC)',
    isTestnet: false,
    isSelectable: false, // Not ready - treasury not configured
    chain: {
      id: 1,
      name: 'Ethereum',
      explorerUrl: 'https://etherscan.io',
    },
    token: {
      symbol: 'USDC',
      name: 'USD Coin',
      contract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
    },
    treasury: {
      address: '', // TODO: Set production treasury
      feeRecipient: '', // TODO: Set production fee recipient
    },
    verification: {
      mode: 'STRICT',
      requireConfirmations: 12,
    },
    ui: {
      bannerColor: '#22c55e',
      bannerText: 'PRODUCTION • Ethereum • USDC',
      badgeClass: 'env-prod',
    },
  },
};

// Confirmation text required to switch profiles
export function getConfirmationText(toProfile: PaymentProfileId): string {
  return `SWITCH TO ${toProfile}`;
}

/**
 * Get current payment profile from database
 */
export async function getCurrentPaymentProfile(env: Env): Promise<PaymentProfile> {
  try {
    const config = await env.DB.prepare(
      `SELECT value FROM app_config WHERE key = 'PAYMENT_PROFILE'`
    ).first<{ value: string }>();

    const profileId = (config?.value || 'TEST_SEPOLIA_HUSD') as PaymentProfileId;
    return PAYMENT_PROFILES[profileId] || PAYMENT_PROFILES.TEST_SEPOLIA_HUSD;
  } catch (e) {
    console.error('getCurrentPaymentProfile error:', e);
    return PAYMENT_PROFILES.TEST_SEPOLIA_HUSD;
  }
}

/**
 * Get current payment profile ID
 */
export async function getCurrentPaymentProfileId(env: Env): Promise<PaymentProfileId> {
  try {
    const config = await env.DB.prepare(
      `SELECT value FROM app_config WHERE key = 'PAYMENT_PROFILE'`
    ).first<{ value: string }>();

    return (config?.value || 'TEST_SEPOLIA_HUSD') as PaymentProfileId;
  } catch (e) {
    console.error('getCurrentPaymentProfileId error:', e);
    return 'TEST_SEPOLIA_HUSD';
  }
}

/**
 * Get payment profile configuration with metadata
 */
export async function getPaymentProfileConfig(env: Env): Promise<{
  current: PaymentProfile;
  updatedBy: string | null;
  updatedAt: string | null;
  reason: string | null;
  available: PaymentProfile[];
}> {
  const configRow = await env.DB.prepare(
    `SELECT value, updated_by, updated_at, reason FROM app_config WHERE key = 'PAYMENT_PROFILE'`
  ).first<{ value: string; updated_by: string | null; updated_at: string | null; reason: string | null }>();

  const profileId = (configRow?.value || 'TEST_SEPOLIA_HUSD') as PaymentProfileId;
  const profile = PAYMENT_PROFILES[profileId] || PAYMENT_PROFILES.TEST_SEPOLIA_HUSD;

  // Filter to only show selectable profiles
  const selectableProfiles = Object.values(PAYMENT_PROFILES).filter(p => p.isSelectable);

  return {
    current: profile,
    updatedBy: configRow?.updated_by || null,
    updatedAt: configRow?.updated_at || null,
    reason: configRow?.reason || null,
    available: selectableProfiles,
  };
}

/**
 * Update payment profile (Admin only)
 */
export async function updatePaymentProfile(
  env: Env,
  newProfileId: PaymentProfileId,
  operatorId: string,
  operatorHandle: string,
  reason?: string
): Promise<{ success: boolean; error?: string; previous?: PaymentProfileId }> {
  // Validate profile exists
  if (!PAYMENT_PROFILES[newProfileId]) {
    return { success: false, error: `Invalid payment profile: ${newProfileId}` };
  }

  // Get current profile
  const currentConfig = await env.DB.prepare(
    `SELECT value FROM app_config WHERE key = 'PAYMENT_PROFILE'`
  ).first<{ value: string }>();

  const previousProfileId = (currentConfig?.value || 'TEST_SEPOLIA_HUSD') as PaymentProfileId;

  // Don't update if same
  if (previousProfileId === newProfileId) {
    return { success: false, error: 'Already on this profile' };
  }

  // Update config
  await env.DB.prepare(
    `INSERT OR REPLACE INTO app_config (key, value, updated_by, updated_at, reason)
     VALUES ('PAYMENT_PROFILE', ?, ?, datetime('now'), ?)`
  ).bind(newProfileId, operatorHandle, reason || null).run();

  // Log the change to audit_logs
  const logId = crypto.randomUUID().replace(/-/g, '');
  await env.DB.prepare(
    `INSERT INTO audit_logs (id, request_id, agent_id, api_key_id, endpoint, method, decision, response_status, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    logId,
    logId, // Use same ID as request_id
    null, // No agent, this is admin action
    null, // No API key
    '/api/admin/config/payment-profile',
    'POST',
    'allow',
    200,
    JSON.stringify({
      action: 'PAYMENT_PROFILE_CHANGE',
      from: previousProfileId,
      to: newProfileId,
      operator_id: operatorId,
      operator_handle: operatorHandle,
      reason: reason || null,
    })
  ).run();

  return { success: true, previous: previousProfileId };
}

/**
 * Get profile for a specific deal (uses snapshotted profile)
 */
export async function getDealPaymentProfile(env: Env, dealId: string): Promise<PaymentProfile> {
  const deal = await env.DB.prepare(
    `SELECT payment_profile FROM deals WHERE id = ?`
  ).bind(dealId).first<{ payment_profile: string | null }>();

  const profileId = (deal?.payment_profile || 'TEST_SEPOLIA_HUSD') as PaymentProfileId;
  return PAYMENT_PROFILES[profileId] || PAYMENT_PROFILES.TEST_SEPOLIA_HUSD;
}

/**
 * Get profile for a specific mission (uses snapshotted profile from deal)
 */
export async function getMissionPaymentProfile(env: Env, missionId: string): Promise<PaymentProfile> {
  const mission = await env.DB.prepare(
    `SELECT m.payment_profile, d.payment_profile as deal_profile
     FROM missions m
     LEFT JOIN deals d ON m.deal_id = d.id
     WHERE m.id = ?`
  ).bind(missionId).first<{ payment_profile: string | null; deal_profile: string | null }>();

  // Use mission profile if set, otherwise fall back to deal profile
  const profileId = (mission?.payment_profile || mission?.deal_profile || 'TEST_SEPOLIA_HUSD') as PaymentProfileId;
  return PAYMENT_PROFILES[profileId] || PAYMENT_PROFILES.TEST_SEPOLIA_HUSD;
}

/**
 * Check if production profiles are ready (have required addresses configured)
 */
export function isProductionReady(profile: PaymentProfile): boolean {
  if (profile.isTestnet) return true;

  return !!(
    profile.treasury.address &&
    profile.treasury.feeRecipient &&
    profile.treasury.address.length === 42 &&
    profile.treasury.feeRecipient.length === 42
  );
}

/**
 * Format amount for display based on profile
 */
export function formatAmount(cents: number, profile: PaymentProfile): string {
  const dollars = (cents / 100).toFixed(2);
  return `${profile.token.symbol} ${dollars}`;
}
