import type { Env, DepositRequest, AuthContext } from '../../types';
import { success, errors } from '../../utils/response';
import { deposit, getBalance } from '../../services/ledger';

/**
 * 入金（残高追加）
 *
 * POST /v1/deposit
 *
 * MVPではモック実装：実際の決済なしでDB台帳に残高を追加
 * 本番環境ではStripe等の決済確認後にのみ呼び出される想定
 */
export async function createDeposit(
  request: Request,
  env: Env,
  authContext: AuthContext
): Promise<Response> {
  const { agent, requestId } = authContext;

  try {
    const body = await request.json<DepositRequest>();

    // バリデーション
    if (!body.amount || body.amount < 100) {
      // 最低$1
      return errors.invalidRequest(requestId, {
        message: 'Amount must be at least 100 cents ($1)',
      });
    }

    if (body.amount > 10000000) {
      // 最大$100,000
      return errors.invalidRequest(requestId, {
        message: 'Amount exceeds maximum of 10000000 cents ($100,000)',
      });
    }

    if (!body.idempotency_key) {
      return errors.invalidRequest(requestId, {
        message: 'idempotency_key is required',
      });
    }

    // 日次入金上限チェック
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayDeposits = await env.DB.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM ledger_entries
       WHERE owner_type = 'agent'
       AND owner_id = ?
       AND entry_type = 'deposit'
       AND created_at >= ?`
    )
      .bind(agent.id, todayStart.toISOString())
      .first<{ total: number }>();

    const dailyTotal = (todayDeposits?.total || 0) + body.amount;

    if (dailyTotal > agent.daily_volume_limit) {
      return errors.limitExceeded(requestId, 'Daily deposit volume');
    }

    // 入金処理
    const result = await deposit(
      env.DB,
      'agent',
      agent.id,
      body.amount,
      body.idempotency_key,
      body.deal_id ? `Deposit for deal ${body.deal_id}` : 'Account deposit'
    );

    if (!result.success) {
      return errors.invalidRequest(requestId, { message: result.error });
    }

    return success(
      {
        deposit: {
          amount: body.amount,
          currency: 'USD',
          idempotency_key: body.idempotency_key,
        },
        balance: {
          available: result.balance!.available,
          pending: result.balance!.pending,
          currency: result.balance!.currency,
        },
        message: 'Deposit successful',
      },
      requestId,
      201
    );
  } catch (e) {
    console.error('Deposit error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * 残高取得
 *
 * GET /v1/balance
 */
export async function getAgentBalance(
  request: Request,
  env: Env,
  authContext: AuthContext
): Promise<Response> {
  const { agent, requestId } = authContext;

  try {
    const balance = await getBalance(env.DB, 'agent', agent.id);

    if (!balance) {
      return success(
        {
          available: 0,
          pending: 0,
          currency: 'USD',
        },
        requestId
      );
    }

    // 取引履歴も取得
    const recentTransactions = await env.DB.prepare(
      `SELECT * FROM ledger_entries
       WHERE owner_type = 'agent' AND owner_id = ?
       ORDER BY created_at DESC
       LIMIT 10`
    )
      .bind(agent.id)
      .all();

    return success(
      {
        balance: {
          available: balance.available,
          pending: balance.pending,
          currency: balance.currency,
        },
        recent_transactions: recentTransactions.results.map((tx: Record<string, unknown>) => ({
          id: tx.id,
          type: tx.entry_type,
          amount: tx.amount,
          balance_after: tx.balance_after,
          description: tx.description,
          created_at: tx.created_at,
        })),
      },
      requestId
    );
  } catch (e) {
    console.error('Get balance error:', e);
    return errors.internalError(requestId);
  }
}
