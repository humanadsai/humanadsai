/**
 * Admin Configuration API
 * Manages payment profile and environment settings
 */

import type { Env } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { requireAdmin } from '../../middleware/admin';
import {
  getCurrentPaymentProfile,
  getPaymentProfileConfig,
  updatePaymentProfile,
  getConfirmationText,
  PAYMENT_PROFILES,
  isProductionReady,
  type PaymentProfileId,
} from '../../services/payment-profile';

/**
 * GET /api/config
 * Public endpoint - returns current payment profile for UI
 */
export async function getPublicConfig(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const profile = await getCurrentPaymentProfile(env);

    return success({
      payment_profile: {
        id: profile.id,
        name: profile.name,
        is_testnet: profile.isTestnet,
        chain: {
          id: profile.chain.id,
          name: profile.chain.name,
          explorer_url: profile.chain.explorerUrl,
        },
        token: {
          symbol: profile.token.symbol,
          name: profile.token.name,
          contract: profile.token.contract,
          decimals: profile.token.decimals,
        },
        treasury_address: profile.treasury.address,
        fee_recipient: profile.treasury.feeRecipient,
        ui: profile.ui,
      },
      payout_mode: env.PAYOUT_MODE || 'ledger',
      escrow_contract: env.ESCROW_CONTRACT || '0xbA71c6a6618E507faBeDF116a0c4E533d9282f6a',
    }, requestId);
  } catch (e) {
    console.error('getPublicConfig error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * GET /api/admin/config/payment-profile
 * Admin endpoint - returns full profile config with metadata
 */
export async function getAdminPaymentProfile(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const config = await getPaymentProfileConfig(env);

    // Add production readiness status for each profile
    const profilesWithStatus = config.available.map(p => ({
      id: p.id,
      name: p.name,
      is_testnet: p.isTestnet,
      chain: p.chain,
      token: p.token,
      treasury: p.treasury,
      verification: p.verification,
      ui: p.ui,
      is_ready: isProductionReady(p),
    }));

    return success({
      current: {
        id: config.current.id,
        name: config.current.name,
        is_testnet: config.current.isTestnet,
        chain: config.current.chain,
        token: config.current.token,
        treasury: config.current.treasury,
        verification: config.current.verification,
        ui: config.current.ui,
        is_ready: isProductionReady(config.current),
      },
      updated_by: config.updatedBy,
      updated_at: config.updatedAt,
      reason: config.reason,
      available_profiles: profilesWithStatus,
      payout_mode: env.PAYOUT_MODE || 'ledger',
    }, requestId);
  } catch (e) {
    console.error('getAdminPaymentProfile error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/admin/config/payment-profile
 * Admin endpoint - change payment profile with safety checks
 */
export async function updateAdminPaymentProfile(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId, operator } = authResult.context!;

  try {
    const body = await request.json<{
      profile: string;
      confirm_text: string;
      reason?: string;
    }>();

    // Validate required fields
    if (!body.profile) {
      return errors.invalidRequest(requestId, { message: 'profile is required' });
    }

    if (!body.confirm_text) {
      return errors.invalidRequest(requestId, { message: 'confirm_text is required' });
    }

    // Validate profile exists
    const profileId = body.profile as PaymentProfileId;
    if (!PAYMENT_PROFILES[profileId]) {
      return errors.invalidRequest(requestId, {
        message: `Invalid profile: ${body.profile}`,
        valid_profiles: Object.keys(PAYMENT_PROFILES),
      });
    }

    // Validate confirmation text
    const expectedConfirmText = getConfirmationText(profileId);
    if (body.confirm_text !== expectedConfirmText) {
      return errors.invalidRequest(requestId, {
        message: 'Confirmation text does not match',
        expected: expectedConfirmText,
      });
    }

    // Check if production profile is ready
    const profile = PAYMENT_PROFILES[profileId];
    if (!profile.isTestnet && !isProductionReady(profile)) {
      return errors.invalidRequest(requestId, {
        message: 'Production profile is not ready. Treasury and fee recipient addresses must be configured.',
        profile_id: profileId,
      });
    }

    // Perform the update
    const result = await updatePaymentProfile(
      env,
      profileId,
      operator.id,
      operator.x_handle || 'admin',
      body.reason
    );

    if (!result.success) {
      return errors.invalidRequest(requestId, { message: result.error });
    }

    // Get updated config
    const updatedConfig = await getPaymentProfileConfig(env);

    return success({
      message: `Payment profile changed from ${result.previous} to ${profileId}`,
      previous_profile: result.previous,
      current: {
        id: updatedConfig.current.id,
        name: updatedConfig.current.name,
        is_testnet: updatedConfig.current.isTestnet,
        chain: updatedConfig.current.chain,
        token: updatedConfig.current.token,
      },
      updated_by: updatedConfig.updatedBy,
      updated_at: updatedConfig.updatedAt,
    }, requestId);
  } catch (e) {
    console.error('updateAdminPaymentProfile error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * GET /api/admin/config/history
 * Admin endpoint - get config change history from audit logs
 */
export async function getConfigHistory(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const { requestId } = authResult.context!;

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    const result = await env.DB.prepare(
      `SELECT id, metadata, created_at
       FROM audit_logs
       WHERE endpoint = '/api/admin/config/payment-profile'
         AND method = 'POST'
         AND response_status = 200
       ORDER BY created_at DESC
       LIMIT ?`
    ).bind(limit).all<{ id: string; metadata: string; created_at: string }>();

    const history = result.results.map(row => {
      const data = JSON.parse(row.metadata || '{}');
      return {
        id: row.id,
        from: data.from,
        to: data.to,
        operator_handle: data.operator_handle,
        reason: data.reason,
        created_at: row.created_at,
      };
    });

    return success({ history, count: history.length }, requestId);
  } catch (e) {
    console.error('getConfigHistory error:', e);
    return errors.internalError(requestId);
  }
}
