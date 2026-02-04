import type { Env, Deal, CreateDealRequest, AuthContext, Agent } from '../../types';
import { success, errors } from '../../utils/response';
import { holdEscrow, refundEscrow, getBalance } from '../../services/ledger';

/**
 * Deal作成
 *
 * POST /v1/deals/create
 */
export async function createDeal(
  request: Request,
  env: Env,
  authContext: AuthContext
): Promise<Response> {
  const { agent, requestId } = authContext;

  try {
    const body = await request.json<CreateDealRequest>();

    // バリデーション
    const validationError = validateCreateDealRequest(body, agent);
    if (validationError) {
      return errors.invalidRequest(requestId, validationError);
    }

    // べき等キーチェック
    if (body.idempotency_key) {
      const existing = await env.DB.prepare(
        'SELECT * FROM deals WHERE idempotency_key = ?'
      )
        .bind(body.idempotency_key)
        .first<Deal>();

      if (existing) {
        return success(formatDealResponse(existing), requestId);
      }
    }

    // オープンDeal数チェック
    const openDeals = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM deals
       WHERE agent_id = ? AND status IN ('draft', 'funded', 'active')`
    )
      .bind(agent.id)
      .first<{ count: number }>();

    if (openDeals && openDeals.count >= agent.open_deals_limit) {
      return errors.limitExceeded(requestId, 'Open deals');
    }

    // Deal作成
    const dealId = crypto.randomUUID().replace(/-/g, '');
    const totalAmount = body.reward_amount * body.max_participants;

    await env.DB.prepare(
      `INSERT INTO deals (
        id, agent_id, title, description, requirements,
        reward_amount, max_participants, status,
        starts_at, expires_at, idempotency_key
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, 'draft',
        ?, ?, ?
      )`
    )
      .bind(
        dealId,
        agent.id,
        body.title,
        body.description || null,
        JSON.stringify(body.requirements),
        body.reward_amount,
        body.max_participants,
        body.starts_at || null,
        body.expires_at || null,
        body.idempotency_key || null
      )
      .run();

    const deal = await env.DB.prepare('SELECT * FROM deals WHERE id = ?')
      .bind(dealId)
      .first<Deal>();

    return success(
      {
        deal: formatDealResponse(deal!),
        total_amount_required: totalAmount,
        message: 'Deal created. Please fund it using /v1/deals/fund',
      },
      requestId,
      201
    );
  } catch (e) {
    console.error('Create deal error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Dealに資金を投入（エスクロー）
 *
 * POST /v1/deals/fund
 */
export async function fundDeal(
  request: Request,
  env: Env,
  authContext: AuthContext
): Promise<Response> {
  const { agent, requestId } = authContext;

  try {
    const body = await request.json<{ deal_id: string; idempotency_key: string }>();

    if (!body.deal_id || !body.idempotency_key) {
      return errors.invalidRequest(requestId, { message: 'deal_id and idempotency_key required' });
    }

    // Deal取得
    const deal = await env.DB.prepare(
      'SELECT * FROM deals WHERE id = ? AND agent_id = ?'
    )
      .bind(body.deal_id, agent.id)
      .first<Deal>();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    if (deal.status !== 'draft') {
      return errors.invalidRequest(requestId, { message: `Deal is already ${deal.status}` });
    }

    // 必要金額を計算
    const totalAmount = deal.reward_amount * deal.max_participants;

    // エスクローに保留
    const result = await holdEscrow(env.DB, agent.id, deal.id, totalAmount, body.idempotency_key);

    if (!result.success) {
      if (result.error === 'Insufficient funds') {
        return errors.insufficientFunds(requestId);
      }
      return errors.invalidRequest(requestId, { message: result.error });
    }

    // Dealステータスを更新
    await env.DB.prepare(
      `UPDATE deals SET status = 'active', updated_at = datetime('now') WHERE id = ?`
    )
      .bind(deal.id)
      .run();

    const updatedDeal = await env.DB.prepare('SELECT * FROM deals WHERE id = ?')
      .bind(deal.id)
      .first<Deal>();

    return success(
      {
        deal: formatDealResponse(updatedDeal!),
        escrow: result.escrow,
        message: 'Deal funded and activated',
      },
      requestId
    );
  } catch (e) {
    console.error('Fund deal error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Dealをキャンセル（返金）
 *
 * POST /v1/deals/cancel
 */
export async function cancelDeal(
  request: Request,
  env: Env,
  authContext: AuthContext
): Promise<Response> {
  const { agent, requestId } = authContext;

  try {
    const body = await request.json<{ deal_id: string; idempotency_key: string }>();

    if (!body.deal_id || !body.idempotency_key) {
      return errors.invalidRequest(requestId, { message: 'deal_id and idempotency_key required' });
    }

    // Deal取得
    const deal = await env.DB.prepare(
      'SELECT * FROM deals WHERE id = ? AND agent_id = ?'
    )
      .bind(body.deal_id, agent.id)
      .first<Deal>();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    if (deal.status === 'completed' || deal.status === 'cancelled') {
      return errors.invalidRequest(requestId, { message: `Deal is already ${deal.status}` });
    }

    // 進行中のミッションがないか確認
    const activeMissions = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM missions
       WHERE deal_id = ? AND status IN ('accepted', 'submitted')`
    )
      .bind(deal.id)
      .first<{ count: number }>();

    if (activeMissions && activeMissions.count > 0) {
      return errors.invalidRequest(requestId, {
        message: 'Cannot cancel deal with active missions',
        active_missions: activeMissions.count,
      });
    }

    // エスクロー返金
    if (deal.status === 'active' || deal.status === 'funded') {
      const refundResult = await refundEscrow(env.DB, deal.id, body.idempotency_key);
      if (!refundResult.success) {
        return errors.invalidRequest(requestId, { message: refundResult.error });
      }
    }

    // Dealステータスを更新
    await env.DB.prepare(
      `UPDATE deals SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`
    )
      .bind(deal.id)
      .run();

    return success(
      {
        deal_id: deal.id,
        status: 'cancelled',
        message: 'Deal cancelled and funds refunded',
      },
      requestId
    );
  } catch (e) {
    console.error('Cancel deal error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Deal一覧取得
 *
 * GET /v1/deals
 */
export async function listDeals(
  request: Request,
  env: Env,
  authContext: AuthContext
): Promise<Response> {
  const { agent, requestId } = authContext;

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    let query = 'SELECT * FROM deals WHERE agent_id = ?';
    const params: (string | number)[] = [agent.id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await env.DB.prepare(query).bind(...params).all<Deal>();

    // 残高も取得
    const balance = await getBalance(env.DB, 'agent', agent.id);

    return success(
      {
        deals: result.results.map(formatDealResponse),
        balance: balance
          ? {
              available: balance.available,
              pending: balance.pending,
              currency: balance.currency,
            }
          : null,
        pagination: {
          limit,
          offset,
          total: result.results.length,
        },
      },
      requestId
    );
  } catch (e) {
    console.error('List deals error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Deal詳細取得
 *
 * GET /v1/deals/:id
 */
export async function getDeal(
  request: Request,
  env: Env,
  authContext: AuthContext,
  dealId: string
): Promise<Response> {
  const { agent, requestId } = authContext;

  try {
    const deal = await env.DB.prepare(
      'SELECT * FROM deals WHERE id = ? AND agent_id = ?'
    )
      .bind(dealId, agent.id)
      .first<Deal>();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    // ミッション統計も取得
    const missionStats = await env.DB.prepare(
      `SELECT
        status,
        COUNT(*) as count
       FROM missions
       WHERE deal_id = ?
       GROUP BY status`
    )
      .bind(deal.id)
      .all<{ status: string; count: number }>();

    return success(
      {
        deal: formatDealResponse(deal),
        missions: {
          stats: missionStats.results.reduce(
            (acc, row) => ({ ...acc, [row.status]: row.count }),
            {}
          ),
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get deal error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// ヘルパー関数
// ============================================

function validateCreateDealRequest(
  body: CreateDealRequest,
  agent: Agent
): Record<string, string> | null {
  const errors: Record<string, string> = {};

  if (!body.title || body.title.length < 1 || body.title.length > 200) {
    errors.title = 'Title must be 1-200 characters';
  }

  if (!body.requirements) {
    errors.requirements = 'Requirements are required';
  } else {
    if (!['tweet', 'retweet', 'quote', 'reply'].includes(body.requirements.post_type)) {
      errors['requirements.post_type'] = 'Invalid post type';
    }
    if (!['url_check', 'content_match', 'manual'].includes(body.requirements.verification_method)) {
      errors['requirements.verification_method'] = 'Invalid verification method';
    }
  }

  if (!body.reward_amount || body.reward_amount < 100) {
    // 最低$1
    errors.reward_amount = 'Reward must be at least 100 cents ($1)';
  }

  if (body.reward_amount > agent.max_deal_amount) {
    errors.reward_amount = `Reward exceeds your limit of ${agent.max_deal_amount} cents`;
  }

  if (!body.max_participants || body.max_participants < 1 || body.max_participants > 1000) {
    errors.max_participants = 'Participants must be 1-1000';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

function formatDealResponse(deal: Deal) {
  return {
    id: deal.id,
    title: deal.title,
    description: deal.description,
    requirements: JSON.parse(deal.requirements),
    reward_amount: deal.reward_amount,
    max_participants: deal.max_participants,
    current_participants: deal.current_participants,
    status: deal.status,
    starts_at: deal.starts_at,
    expires_at: deal.expires_at,
    created_at: deal.created_at,
    updated_at: deal.updated_at,
  };
}
