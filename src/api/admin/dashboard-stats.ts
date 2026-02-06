/**
 * Advertiser Dashboard Stats API
 *
 * GET /api/admin/dashboard/advertiser
 *
 * Returns comprehensive stats for AI advertisers including:
 * - Missions list with application/submission/approval counts
 * - Payment history with tx hashes
 */

import type { Env, Deal, Agent } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { authenticateOperator } from '../operator/register';

interface MissionStats {
  deal: {
    id: string;
    title: string;
    description: string | null;
    reward_amount: number;
    max_participants: number;
    status: string;
    payment_model: string;
    auf_percentage: number;
    created_at: string;
    expires_at: string | null;
  };
  agent: {
    id: string;
    name: string;
  };
  stats: {
    applications_total: number;
    applications_pending: number;
    applications_selected: number;
    applications_rejected: number;
    missions_accepted: number;
    missions_submitted: number;
    missions_verified: number;
    missions_approved: number;
    missions_paid: number;
    missions_rejected: number;
  };
  payments: {
    auf_total_cents: number;
    auf_confirmed_count: number;
    payout_total_cents: number;
    payout_confirmed_count: number;
  };
}

interface PaymentRecord {
  id: string;
  mission_id: string;
  deal_title: string;
  operator_handle: string;
  payment_type: string;
  amount_cents: number;
  chain: string;
  token: string;
  tx_hash: string | null;
  status: string;
  payout_mode: string;
  confirmed_at: string | null;
  created_at: string;
}

interface AdvertiserDashboardResponse {
  summary: {
    total_missions: number;
    active_missions: number;
    total_budget_cents: number;
    total_paid_cents: number;
    total_applications: number;
    total_approved: number;
  };
  missions: MissionStats[];
  recent_payments: PaymentRecord[];
}

export async function getAdvertiserDashboard(
  request: Request,
  env: Env
): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Authenticate as admin
    const authResult = await authenticateOperator(request, env);
    if (!authResult.success) {
      return authResult.error!;
    }

    const operator = authResult.operator!;

    // Check if admin
    if (operator.role !== 'admin') {
      return errors.forbidden(requestId, 'Admin access required');
    }

    const url = new URL(request.url);
    const agentId = url.searchParams.get('agent_id');

    // Build base query conditions
    const agentCondition = agentId ? 'AND d.agent_id = ?' : '';
    const agentParams = agentId ? [agentId] : [];

    // Get all deals with stats
    const dealsQuery = `
      SELECT
        d.id, d.title, d.description, d.reward_amount, d.max_participants,
        d.status, d.payment_model, d.auf_percentage, d.created_at, d.expires_at,
        d.agent_id,
        a.name as agent_name,
        -- Application counts
        (SELECT COUNT(*) FROM applications WHERE deal_id = d.id) as applications_total,
        (SELECT COUNT(*) FROM applications WHERE deal_id = d.id AND status IN ('applied', 'shortlisted')) as applications_pending,
        (SELECT COUNT(*) FROM applications WHERE deal_id = d.id AND status = 'selected') as applications_selected,
        (SELECT COUNT(*) FROM applications WHERE deal_id = d.id AND status = 'rejected') as applications_rejected,
        -- Mission counts
        (SELECT COUNT(*) FROM missions WHERE deal_id = d.id AND status = 'accepted') as missions_accepted,
        (SELECT COUNT(*) FROM missions WHERE deal_id = d.id AND status = 'submitted') as missions_submitted,
        (SELECT COUNT(*) FROM missions WHERE deal_id = d.id AND status = 'verified') as missions_verified,
        (SELECT COUNT(*) FROM missions WHERE deal_id = d.id AND status IN ('approved', 'address_unlocked')) as missions_approved,
        (SELECT COUNT(*) FROM missions WHERE deal_id = d.id AND status IN ('paid', 'paid_complete')) as missions_paid,
        (SELECT COUNT(*) FROM missions WHERE deal_id = d.id AND status = 'rejected') as missions_rejected,
        -- Payment totals
        (SELECT COALESCE(SUM(amount_cents), 0) FROM payments p
         JOIN missions m ON p.mission_id = m.id
         WHERE m.deal_id = d.id AND p.payment_type = 'auf' AND p.status = 'confirmed') as auf_total_cents,
        (SELECT COUNT(*) FROM payments p
         JOIN missions m ON p.mission_id = m.id
         WHERE m.deal_id = d.id AND p.payment_type = 'auf' AND p.status = 'confirmed') as auf_confirmed_count,
        (SELECT COALESCE(SUM(amount_cents), 0) FROM payments p
         JOIN missions m ON p.mission_id = m.id
         WHERE m.deal_id = d.id AND p.payment_type = 'payout' AND p.status = 'confirmed') as payout_total_cents,
        (SELECT COUNT(*) FROM payments p
         JOIN missions m ON p.mission_id = m.id
         WHERE m.deal_id = d.id AND p.payment_type = 'payout' AND p.status = 'confirmed') as payout_confirmed_count
      FROM deals d
      LEFT JOIN agents a ON d.agent_id = a.id
      WHERE 1=1 ${agentCondition}
      ORDER BY d.created_at DESC
      LIMIT 100
    `;

    const dealsResult = await env.DB.prepare(dealsQuery)
      .bind(...agentParams)
      .all<{
        id: string;
        title: string;
        description: string | null;
        reward_amount: number;
        max_participants: number;
        status: string;
        payment_model: string;
        auf_percentage: number;
        created_at: string;
        expires_at: string | null;
        agent_id: string;
        agent_name: string;
        applications_total: number;
        applications_pending: number;
        applications_selected: number;
        applications_rejected: number;
        missions_accepted: number;
        missions_submitted: number;
        missions_verified: number;
        missions_approved: number;
        missions_paid: number;
        missions_rejected: number;
        auf_total_cents: number;
        auf_confirmed_count: number;
        payout_total_cents: number;
        payout_confirmed_count: number;
      }>();

    // Get recent payments
    const paymentsQuery = `
      SELECT
        p.id, p.mission_id, p.payment_type, p.amount_cents, p.chain, p.token,
        p.tx_hash, p.status, p.payout_mode, p.confirmed_at, p.created_at,
        d.title as deal_title,
        o.x_handle as operator_handle
      FROM payments p
      JOIN missions m ON p.mission_id = m.id
      JOIN deals d ON m.deal_id = d.id
      JOIN operators o ON p.operator_id = o.id
      WHERE 1=1 ${agentId ? 'AND p.agent_id = ?' : ''}
      ORDER BY p.created_at DESC
      LIMIT 50
    `;

    const paymentsResult = await env.DB.prepare(paymentsQuery)
      .bind(...agentParams)
      .all<PaymentRecord>();

    // Build response
    const missions: MissionStats[] = (dealsResult.results || []).map(d => ({
      deal: {
        id: d.id,
        title: d.title,
        description: d.description,
        reward_amount: d.reward_amount,
        max_participants: d.max_participants,
        status: d.status,
        payment_model: d.payment_model || 'a_plan',
        auf_percentage: d.auf_percentage || 10,
        created_at: d.created_at,
        expires_at: d.expires_at,
      },
      agent: {
        id: d.agent_id,
        name: d.agent_name || 'Unknown',
      },
      stats: {
        applications_total: d.applications_total || 0,
        applications_pending: d.applications_pending || 0,
        applications_selected: d.applications_selected || 0,
        applications_rejected: d.applications_rejected || 0,
        missions_accepted: d.missions_accepted || 0,
        missions_submitted: d.missions_submitted || 0,
        missions_verified: d.missions_verified || 0,
        missions_approved: d.missions_approved || 0,
        missions_paid: d.missions_paid || 0,
        missions_rejected: d.missions_rejected || 0,
      },
      payments: {
        auf_total_cents: d.auf_total_cents || 0,
        auf_confirmed_count: d.auf_confirmed_count || 0,
        payout_total_cents: d.payout_total_cents || 0,
        payout_confirmed_count: d.payout_confirmed_count || 0,
      },
    }));

    // Calculate summary
    const summary = {
      total_missions: missions.length,
      active_missions: missions.filter(m => m.deal.status === 'active').length,
      total_budget_cents: missions.reduce((sum, m) => sum + (m.deal.reward_amount * m.deal.max_participants), 0),
      total_paid_cents: missions.reduce((sum, m) => sum + m.payments.payout_total_cents, 0),
      total_applications: missions.reduce((sum, m) => sum + m.stats.applications_total, 0),
      total_approved: missions.reduce((sum, m) => sum + m.stats.missions_paid, 0),
    };

    const response: AdvertiserDashboardResponse = {
      summary,
      missions,
      recent_payments: paymentsResult.results || [],
    };

    return success(response, requestId);
  } catch (e) {
    console.error('Get advertiser dashboard error:', e);
    return errors.internalError(requestId);
  }
}
