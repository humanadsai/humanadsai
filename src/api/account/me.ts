/**
 * Account Info Handler
 *
 * GET /api/account/me
 *
 * Returns comprehensive account information including profile, activity, and deletion eligibility.
 */

import type { Env } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { authenticateOperator } from '../operator/register';

interface AccountMeResponse {
  profile: {
    id: string;
    display_name: string | null;
    x_handle: string | null;
    x_user_id: string | null;
    x_profile_image_url: string | null;
    role: string;
    status: string;
    connected_at: number | null;
    verified_at: string | null;
  };
  payout_wallets: {
    evm_address: string | null;
    solana_address: string | null;
  };
  activity: {
    total_missions_completed: number;
    total_earnings: number;
    applied_count: number;
    selected_count: number;
    pending_rewards_count: number;
    pending_rewards_amount: number;
  };
  deletion_guard: {
    can_delete: boolean;
    reason: string | null;
    active_missions: number;
    pending_payouts: number;
  };
}

/**
 * GET /api/account/me
 */
export async function getAccountMe(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Authenticate operator
    const authResult = await authenticateOperator(request, env);
    if (!authResult.success) {
      return authResult.error!;
    }

    const operator = authResult.operator!;

    // Fetch extended operator data including wallets
    const extendedOperator = await env.DB.prepare(`
      SELECT
        id, display_name, x_handle, x_user_id, x_profile_image_url,
        role, status, verified_at, x_connected_at,
        evm_wallet_address, solana_wallet_address,
        total_missions_completed, total_earnings
      FROM operators
      WHERE id = ?
    `).bind(operator.id).first<{
      id: string;
      display_name: string | null;
      x_handle: string | null;
      x_user_id: string | null;
      x_profile_image_url: string | null;
      role: string | null;
      status: string;
      verified_at: string | null;
      x_connected_at: number | null;
      evm_wallet_address: string | null;
      solana_wallet_address: string | null;
      total_missions_completed: number;
      total_earnings: number;
    }>();

    if (!extendedOperator) {
      return errors.notFound(requestId, 'Account');
    }

    // Get activity counts
    const [appliedCount, selectedCount, pendingRewards] = await Promise.all([
      // Applied applications count
      env.DB.prepare(`
        SELECT COUNT(*) as count FROM applications
        WHERE operator_id = ? AND status IN ('applied', 'shortlisted')
      `).bind(operator.id).first<{ count: number }>(),

      // Selected/active missions count
      env.DB.prepare(`
        SELECT COUNT(*) as count FROM missions
        WHERE operator_id = ? AND status IN ('accepted', 'submitted')
      `).bind(operator.id).first<{ count: number }>(),

      // Pending rewards (verified but not paid)
      env.DB.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(d.reward_amount), 0) as amount
        FROM missions m
        JOIN deals d ON m.deal_id = d.id
        WHERE m.operator_id = ?
          AND m.status IN ('verified', 'approved', 'address_unlocked', 'paid_partial')
      `).bind(operator.id).first<{ count: number; amount: number }>(),
    ]);

    // Check deletion eligibility
    const [activeMissions, pendingBalance] = await Promise.all([
      env.DB.prepare(`
        SELECT COUNT(*) as count FROM missions
        WHERE operator_id = ?
          AND status IN ('accepted', 'submitted', 'verified', 'approved', 'address_unlocked', 'paid_partial')
      `).bind(operator.id).first<{ count: number }>(),

      env.DB.prepare(`
        SELECT COALESCE(pending, 0) as pending FROM balances
        WHERE owner_type = 'operator' AND owner_id = ?
      `).bind(operator.id).first<{ pending: number }>(),
    ]);

    const activeMissionCount = activeMissions?.count || 0;
    const pendingPayoutAmount = pendingBalance?.pending || 0;
    const pendingRewardsCount = pendingRewards?.count || 0;

    let canDelete = true;
    let deleteBlockReason: string | null = null;

    if (activeMissionCount > 0) {
      canDelete = false;
      deleteBlockReason = `You have ${activeMissionCount} active mission(s). Please complete or cancel them before deleting your account.`;
    } else if (pendingPayoutAmount > 0) {
      canDelete = false;
      deleteBlockReason = `You have $${(pendingPayoutAmount / 100).toFixed(2)} in pending payouts. Please wait for payout completion.`;
    } else if (pendingRewardsCount > 0) {
      canDelete = false;
      deleteBlockReason = `You have ${pendingRewardsCount} pending reward(s). Please wait for payout completion.`;
    }

    // Check wallet status and add warning if pending rewards but no wallet
    const hasWallet = extendedOperator.evm_wallet_address || extendedOperator.solana_wallet_address;
    if (!hasWallet && pendingRewardsCount > 0 && canDelete) {
      // Not blocking, but add info
      deleteBlockReason = 'Warning: You have pending rewards but no wallet set. Set your wallet to receive payouts.';
    }

    const response: AccountMeResponse = {
      profile: {
        id: extendedOperator.id,
        display_name: extendedOperator.display_name,
        x_handle: extendedOperator.x_handle,
        x_user_id: extendedOperator.x_user_id,
        x_profile_image_url: extendedOperator.x_profile_image_url,
        role: extendedOperator.role || 'user',
        status: extendedOperator.status,
        connected_at: extendedOperator.x_connected_at,
        verified_at: extendedOperator.verified_at,
      },
      payout_wallets: {
        evm_address: extendedOperator.evm_wallet_address,
        solana_address: extendedOperator.solana_wallet_address,
      },
      activity: {
        total_missions_completed: extendedOperator.total_missions_completed || 0,
        total_earnings: extendedOperator.total_earnings || 0,
        applied_count: appliedCount?.count || 0,
        selected_count: selectedCount?.count || 0,
        pending_rewards_count: pendingRewardsCount,
        pending_rewards_amount: pendingRewards?.amount || 0,
      },
      deletion_guard: {
        can_delete: canDelete,
        reason: deleteBlockReason,
        active_missions: activeMissionCount,
        pending_payouts: pendingPayoutAmount,
      },
    };

    return success(response, requestId);
  } catch (e) {
    console.error('Get account me error:', e);
    return errors.internalError(requestId);
  }
}
