import type { Env } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { authenticateOperator } from '../operator/register';

interface PendingRewardItem {
  mission_id: string;
  deal_id: string;
  title: string;
  amount_cents: number;
  status: string;
  submitted_at: string | null;
  approved_at: string | null;
}

interface WalletStatus {
  evm_address: string | null;
  solana_address: string | null;
  has_evm: boolean;
  has_solana: boolean;
}

/**
 * Get pending rewards and wallet status
 *
 * GET /api/me/pending-rewards
 *
 * Returns missions that are pending payment and wallet registration status.
 * Used to show "wallet missing" alerts.
 */
export async function getPendingRewards(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Authenticate
    const authResult = await authenticateOperator(request, env);
    if (!authResult.success) {
      return authResult.error!;
    }

    const operator = authResult.operator!;

    // Get pending missions (SUBMITTED, UNDER_REVIEW, APPROVED but not PAID)
    // Note: Current statuses are: accepted, submitted, verified, rejected, expired, paid
    // "verified" = approved in the old flow
    const pendingMissions = await env.DB.prepare(
      `SELECT m.id as mission_id, m.deal_id, m.status, m.submitted_at, m.verified_at as approved_at,
              d.title, d.reward_amount
       FROM missions m
       JOIN deals d ON m.deal_id = d.id
       WHERE m.operator_id = ?
         AND m.status IN ('submitted', 'verified', 'approved', 'address_unlocked')
       ORDER BY m.submitted_at DESC`
    )
      .bind(operator.id)
      .all();

    // Wallet addresses are stored directly in the operators table
    const walletStatus: WalletStatus = {
      evm_address: (operator as any).evm_wallet_address || null,
      solana_address: (operator as any).solana_wallet_address || null,
      has_evm: !!(operator as any).evm_wallet_address,
      has_solana: !!(operator as any).solana_wallet_address,
    };

    // Calculate totals
    const pendingItems: PendingRewardItem[] = pendingMissions.results.map((m) => ({
      mission_id: m.mission_id as string,
      deal_id: m.deal_id as string,
      title: m.title as string,
      amount_cents: m.reward_amount as number,
      status: m.status as string,
      submitted_at: m.submitted_at as string | null,
      approved_at: m.approved_at as string | null,
    }));

    const pendingTotalCents = pendingItems.reduce((sum, item) => sum + item.amount_cents, 0);

    // Determine if wallet is missing for any pending reward
    // For now, assume all payouts require EVM wallet (USDC on Base/Polygon)
    const walletMissing = pendingItems.length > 0 && !walletStatus.has_evm;

    // Determine alert severity
    let alertSeverity: 'none' | 'warning' | 'critical' = 'none';
    if (walletMissing) {
      // Check if any mission is approved (verified) - highest urgency
      const hasApproved = pendingItems.some((item) =>
        item.status === 'verified' || item.status === 'approved' || item.status === 'address_unlocked'
      );
      alertSeverity = hasApproved ? 'critical' : 'warning';
    }

    return success(
      {
        pending_total_cents: pendingTotalCents,
        pending_count: pendingItems.length,
        pending_items: pendingItems,
        wallet_status: walletStatus,
        wallet_missing: walletMissing,
        alert_severity: alertSeverity,
        should_show_alert: walletMissing,
      },
      requestId
    );
  } catch (e) {
    console.error('Get pending rewards error:', e);
    return errors.internalError(requestId);
  }
}
