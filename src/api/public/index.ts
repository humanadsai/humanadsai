import type { Env, Deal, Operator } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';

/**
 * 公開Deal一覧
 *
 * GET /api/deals
 */
export async function getPublicDeals(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const deals = await env.DB.prepare(
      `SELECT d.id, d.title, d.description, d.requirements, d.reward_amount,
        d.max_participants, d.current_participants, d.expires_at, d.created_at,
        a.name as agent_name
       FROM deals d
       JOIN agents a ON d.agent_id = a.id
       WHERE d.status = 'active'
       AND d.current_participants < d.max_participants
       AND (d.expires_at IS NULL OR d.expires_at > datetime('now'))
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(limit, offset)
      .all();

    return success(
      {
        deals: deals.results.map((d: Record<string, unknown>) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          requirements: JSON.parse(d.requirements as string),
          reward_amount: d.reward_amount,
          remaining_slots: (d.max_participants as number) - (d.current_participants as number),
          agent_name: d.agent_name,
          expires_at: d.expires_at,
          created_at: d.created_at,
        })),
        pagination: {
          limit,
          offset,
          total: deals.results.length,
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get public deals error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * 公開Deal詳細
 *
 * GET /api/deals/:id
 */
export async function getPublicDeal(request: Request, env: Env, dealId: string): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const deal = await env.DB.prepare(
      `SELECT d.*, a.name as agent_name
       FROM deals d
       JOIN agents a ON d.agent_id = a.id
       WHERE d.id = ? AND d.status = 'active'`
    )
      .bind(dealId)
      .first();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    return success(
      {
        deal: {
          id: deal.id,
          title: deal.title,
          description: deal.description,
          requirements: JSON.parse(deal.requirements as string),
          reward_amount: deal.reward_amount,
          remaining_slots: (deal.max_participants as number) - (deal.current_participants as number),
          agent_name: deal.agent_name,
          expires_at: deal.expires_at,
          created_at: deal.created_at,
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get public deal error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Operator一覧（リーダーボード）
 *
 * GET /api/operators
 */
export async function getPublicOperators(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const sortBy = url.searchParams.get('sort') || 'earnings'; // earnings, missions

    let orderBy = 'total_earnings DESC';
    if (sortBy === 'missions') {
      orderBy = 'total_missions_completed DESC';
    }

    const operators = await env.DB.prepare(
      `SELECT id, x_handle, display_name, avatar_url,
        total_missions_completed, total_earnings, verified_at
       FROM operators
       WHERE status = 'verified'
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`
    )
      .bind(limit, offset)
      .all();

    return success(
      {
        operators: operators.results.map((op: Record<string, unknown>) => ({
          id: op.id,
          x_handle: op.x_handle,
          display_name: op.display_name,
          avatar_url: op.avatar_url,
          total_missions_completed: op.total_missions_completed,
          total_earnings: op.total_earnings,
          verified_at: op.verified_at,
        })),
        pagination: {
          limit,
          offset,
          total: operators.results.length,
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get public operators error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Operatorプロフィール（公開）
 *
 * GET /api/operators/:id
 */
export async function getPublicOperator(
  request: Request,
  env: Env,
  operatorId: string
): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const operator = await env.DB.prepare(
      `SELECT id, x_handle, display_name, avatar_url, bio,
        total_missions_completed, total_earnings, verified_at
       FROM operators
       WHERE id = ? AND status = 'verified'`
    )
      .bind(operatorId)
      .first();

    if (!operator) {
      return errors.notFound(requestId, 'Operator');
    }

    // 最近の完了ミッション
    const recentMissions = await env.DB.prepare(
      `SELECT m.id, m.paid_at, d.title, d.reward_amount
       FROM missions m
       JOIN deals d ON m.deal_id = d.id
       WHERE m.operator_id = ? AND m.status = 'paid'
       ORDER BY m.paid_at DESC
       LIMIT 5`
    )
      .bind(operatorId)
      .all();

    return success(
      {
        operator: {
          id: operator.id,
          x_handle: operator.x_handle,
          display_name: operator.display_name,
          avatar_url: operator.avatar_url,
          bio: operator.bio,
          total_missions_completed: operator.total_missions_completed,
          total_earnings: operator.total_earnings,
          verified_at: operator.verified_at,
        },
        recent_missions: recentMissions.results,
      },
      requestId
    );
  } catch (e) {
    console.error('Get public operator error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * 統計情報
 *
 * GET /api/stats
 */
export async function getStats(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const [campaigns, operators, completedMissions] = await Promise.all([
      env.DB.prepare(
        `SELECT COUNT(*) as count FROM deals WHERE status IN ('active', 'completed')`
      ).first<{ count: number }>(),
      env.DB.prepare(
        `SELECT COUNT(*) as count FROM operators WHERE status = 'verified'`
      ).first<{ count: number }>(),
      env.DB.prepare(
        `SELECT COUNT(*) as count FROM missions WHERE status = 'paid'`
      ).first<{ count: number }>(),
    ]);

    return success(
      {
        ai_registered_campaigns: campaigns?.count || 0,
        human_operators: operators?.count || 0,
        completed_missions: completedMissions?.count || 0,
      },
      requestId
    );
  } catch (e) {
    console.error('Get stats error:', e);
    return errors.internalError(requestId);
  }
}
