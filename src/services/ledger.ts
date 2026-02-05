import type { Env, Balance, LedgerEntry, EscrowHold, Payment } from '../types';

/**
 * 残高を取得（なければ作成）
 */
export async function getOrCreateBalance(
  db: D1Database,
  ownerType: 'agent' | 'operator',
  ownerId: string,
  currency = 'USD'
): Promise<Balance> {
  // 既存の残高を取得
  const existing = await db
    .prepare('SELECT * FROM balances WHERE owner_type = ? AND owner_id = ? AND currency = ?')
    .bind(ownerType, ownerId, currency)
    .first<Balance>();

  if (existing) {
    return existing;
  }

  // 新規作成
  const id = crypto.randomUUID().replace(/-/g, '');
  await db
    .prepare(
      `INSERT INTO balances (id, owner_type, owner_id, available, pending, currency)
       VALUES (?, ?, ?, 0, 0, ?)`
    )
    .bind(id, ownerType, ownerId, currency)
    .run();

  return {
    id,
    owner_type: ownerType,
    owner_id: ownerId,
    available: 0,
    pending: 0,
    currency,
    updated_at: new Date().toISOString(),
  };
}

/**
 * 残高を取得
 */
export async function getBalance(
  db: D1Database,
  ownerType: 'agent' | 'operator',
  ownerId: string,
  currency = 'USD'
): Promise<Balance | null> {
  return db
    .prepare('SELECT * FROM balances WHERE owner_type = ? AND owner_id = ? AND currency = ?')
    .bind(ownerType, ownerId, currency)
    .first<Balance>();
}

/**
 * 入金（Deposit）
 */
export async function deposit(
  db: D1Database,
  ownerType: 'agent' | 'operator',
  ownerId: string,
  amount: number,
  idempotencyKey: string,
  description?: string
): Promise<{ success: boolean; balance?: Balance; error?: string }> {
  // べき等チェック
  const existing = await db
    .prepare('SELECT id FROM ledger_entries WHERE idempotency_key = ?')
    .bind(idempotencyKey)
    .first();

  if (existing) {
    const balance = await getBalance(db, ownerType, ownerId);
    return { success: true, balance: balance! };
  }

  // 残高を取得または作成
  const balance = await getOrCreateBalance(db, ownerType, ownerId);

  // 新しい残高を計算
  const newAvailable = balance.available + amount;

  // トランザクション的に更新（D1は単一ステートメントがアトミック）
  // バッチで実行
  const results = await db.batch([
    // 残高更新
    db
      .prepare(
        `UPDATE balances SET available = ?, updated_at = datetime('now')
         WHERE owner_type = ? AND owner_id = ? AND currency = ?`
      )
      .bind(newAvailable, ownerType, ownerId, balance.currency),
    // 台帳エントリ作成
    db
      .prepare(
        `INSERT INTO ledger_entries (
          id, owner_type, owner_id, entry_type, amount, currency,
          balance_after, description, idempotency_key
        ) VALUES (
          lower(hex(randomblob(16))), ?, ?, 'deposit', ?, ?,
          ?, ?, ?
        )`
      )
      .bind(ownerType, ownerId, amount, balance.currency, newAvailable, description || 'Deposit', idempotencyKey),
  ]);

  // 更新された残高を取得
  const updatedBalance = await getBalance(db, ownerType, ownerId);

  return { success: true, balance: updatedBalance! };
}

/**
 * エスクローに保留（Deal資金確保）
 */
export async function holdEscrow(
  db: D1Database,
  agentId: string,
  dealId: string,
  amount: number,
  idempotencyKey: string
): Promise<{ success: boolean; escrow?: EscrowHold; error?: string }> {
  // べき等チェック
  const existingEscrow = await db
    .prepare('SELECT * FROM escrow_holds WHERE deal_id = ?')
    .bind(dealId)
    .first<EscrowHold>();

  if (existingEscrow) {
    return { success: true, escrow: existingEscrow };
  }

  // 残高確認
  const balance = await getOrCreateBalance(db, 'agent', agentId);

  if (balance.available < amount) {
    return { success: false, error: 'Insufficient funds' };
  }

  const newAvailable = balance.available - amount;
  const newPending = balance.pending + amount;
  const escrowId = crypto.randomUUID().replace(/-/g, '');

  // バッチで実行
  await db.batch([
    // 残高更新
    db
      .prepare(
        `UPDATE balances SET available = ?, pending = ?, updated_at = datetime('now')
         WHERE owner_type = 'agent' AND owner_id = ? AND currency = 'USD'`
      )
      .bind(newAvailable, newPending, agentId),
    // エスクロー作成
    db
      .prepare(
        `INSERT INTO escrow_holds (id, deal_id, agent_id, amount, currency, status)
         VALUES (?, ?, ?, ?, 'USD', 'held')`
      )
      .bind(escrowId, dealId, agentId, amount),
    // 台帳エントリ作成
    db
      .prepare(
        `INSERT INTO ledger_entries (
          id, owner_type, owner_id, entry_type, amount, currency,
          balance_after, reference_type, reference_id, description, idempotency_key
        ) VALUES (
          lower(hex(randomblob(16))), 'agent', ?, 'escrow_hold', ?, 'USD',
          ?, 'deal', ?, 'Escrow hold for deal', ?
        )`
      )
      .bind(agentId, -amount, newAvailable, dealId, idempotencyKey),
  ]);

  const escrow = await db
    .prepare('SELECT * FROM escrow_holds WHERE id = ?')
    .bind(escrowId)
    .first<EscrowHold>();

  return { success: true, escrow: escrow! };
}

/**
 * エスクローからOperatorへ支払い
 */
export async function releaseToOperator(
  db: D1Database,
  missionId: string,
  operatorId: string,
  amount: number,
  idempotencyKey: string
): Promise<{ success: boolean; error?: string }> {
  // べき等チェック
  const existing = await db
    .prepare('SELECT id FROM ledger_entries WHERE idempotency_key = ?')
    .bind(idempotencyKey)
    .first();

  if (existing) {
    return { success: true };
  }

  // Mission情報を取得
  const mission = await db
    .prepare(
      `SELECT m.*, d.agent_id
       FROM missions m
       JOIN deals d ON m.deal_id = d.id
       WHERE m.id = ?`
    )
    .bind(missionId)
    .first<{ deal_id: string; agent_id: string }>();

  if (!mission) {
    return { success: false, error: 'Mission not found' };
  }

  // エスクローを取得
  const escrow = await db
    .prepare("SELECT * FROM escrow_holds WHERE deal_id = ? AND status = 'held'")
    .bind(mission.deal_id)
    .first<EscrowHold>();

  if (!escrow || escrow.amount < amount) {
    return { success: false, error: 'Insufficient escrow' };
  }

  // Operator残高を取得または作成
  const operatorBalance = await getOrCreateBalance(db, 'operator', operatorId);

  // Agent残高を取得
  const agentBalance = await getBalance(db, 'agent', mission.agent_id);
  if (!agentBalance) {
    return { success: false, error: 'Agent balance not found' };
  }

  const newOperatorAvailable = operatorBalance.available + amount;
  const newAgentPending = agentBalance.pending - amount;
  const newEscrowAmount = escrow.amount - amount;

  // バッチで実行
  await db.batch([
    // Operator残高更新
    db
      .prepare(
        `UPDATE balances SET available = ?, updated_at = datetime('now')
         WHERE owner_type = 'operator' AND owner_id = ? AND currency = 'USD'`
      )
      .bind(newOperatorAvailable, operatorId),
    // Agent pending更新
    db
      .prepare(
        `UPDATE balances SET pending = ?, updated_at = datetime('now')
         WHERE owner_type = 'agent' AND owner_id = ? AND currency = 'USD'`
      )
      .bind(newAgentPending, mission.agent_id),
    // エスクロー更新
    db
      .prepare(
        `UPDATE escrow_holds SET amount = ?, status = CASE WHEN ? <= 0 THEN 'released' ELSE status END,
         released_at = CASE WHEN ? <= 0 THEN datetime('now') ELSE released_at END
         WHERE id = ?`
      )
      .bind(newEscrowAmount, newEscrowAmount, newEscrowAmount, escrow.id),
    // Operator台帳エントリ
    db
      .prepare(
        `INSERT INTO ledger_entries (
          id, owner_type, owner_id, entry_type, amount, currency,
          balance_after, reference_type, reference_id, description, idempotency_key
        ) VALUES (
          lower(hex(randomblob(16))), 'operator', ?, 'reward', ?, 'USD',
          ?, 'mission', ?, 'Mission reward', ?
        )`
      )
      .bind(operatorId, amount, newOperatorAvailable, missionId, idempotencyKey),
    // Agent台帳エントリ
    db
      .prepare(
        `INSERT INTO ledger_entries (
          id, owner_type, owner_id, entry_type, amount, currency,
          balance_after, reference_type, reference_id, description
        ) VALUES (
          lower(hex(randomblob(16))), 'agent', ?, 'escrow_release', ?, 'USD',
          ?, 'mission', ?, 'Mission payment released'
        )`
      )
      .bind(mission.agent_id, -amount, agentBalance.available, missionId),
    // Mission更新
    db
      .prepare(
        `UPDATE missions SET status = 'paid', paid_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(missionId),
  ]);

  return { success: true };
}

/**
 * エスクロー返金
 */
export async function refundEscrow(
  db: D1Database,
  dealId: string,
  idempotencyKey: string
): Promise<{ success: boolean; error?: string }> {
  // べき等チェック
  const existing = await db
    .prepare('SELECT id FROM ledger_entries WHERE idempotency_key = ?')
    .bind(idempotencyKey)
    .first();

  if (existing) {
    return { success: true };
  }

  // エスクローを取得
  const escrow = await db
    .prepare("SELECT * FROM escrow_holds WHERE deal_id = ? AND status = 'held'")
    .bind(dealId)
    .first<EscrowHold>();

  if (!escrow) {
    return { success: false, error: 'No escrow found' };
  }

  // Agent残高を取得
  const balance = await getBalance(db, 'agent', escrow.agent_id);
  if (!balance) {
    return { success: false, error: 'Agent balance not found' };
  }

  const newAvailable = balance.available + escrow.amount;
  const newPending = balance.pending - escrow.amount;

  // バッチで実行
  await db.batch([
    // 残高更新
    db
      .prepare(
        `UPDATE balances SET available = ?, pending = ?, updated_at = datetime('now')
         WHERE owner_type = 'agent' AND owner_id = ? AND currency = 'USD'`
      )
      .bind(newAvailable, newPending, escrow.agent_id),
    // エスクロー更新
    db
      .prepare(
        `UPDATE escrow_holds SET status = 'refunded', refunded_at = datetime('now')
         WHERE id = ?`
      )
      .bind(escrow.id),
    // 台帳エントリ
    db
      .prepare(
        `INSERT INTO ledger_entries (
          id, owner_type, owner_id, entry_type, amount, currency,
          balance_after, reference_type, reference_id, description, idempotency_key
        ) VALUES (
          lower(hex(randomblob(16))), 'agent', ?, 'refund', ?, 'USD',
          ?, 'deal', ?, 'Escrow refund', ?
        )`
      )
      .bind(escrow.agent_id, escrow.amount, newAvailable, dealId, idempotencyKey),
  ]);

  return { success: true };
}

// ============================================
// A-Plan (Address Unlock Fee) Functions
// ============================================

/**
 * Record AUF (Address Unlock Fee) received
 * Called when AI Agent pays 10% to unlock operator's wallet address
 */
export async function recordAufReceived(
  db: D1Database,
  missionId: string,
  agentId: string,
  amountCents: number,
  txHash: string,
  chain: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const idempotencyKey = `auf_${missionId}_${txHash}`;

  // Idempotency check
  const existing = await db
    .prepare('SELECT id FROM ledger_entries WHERE idempotency_key = ?')
    .bind(idempotencyKey)
    .first();

  if (existing) {
    return { success: true };
  }

  // Get or create HumanAds platform balance (treasury)
  const treasuryBalance = await getOrCreateBalance(db, 'agent', 'humanads_treasury');
  const newTreasuryAvailable = treasuryBalance.available + amountCents;

  // Create ledger entry for treasury
  await db.batch([
    // Update treasury balance
    db
      .prepare(
        `UPDATE balances SET available = ?, updated_at = datetime('now')
         WHERE owner_type = 'agent' AND owner_id = 'humanads_treasury' AND currency = 'USD'`
      )
      .bind(newTreasuryAvailable),
    // Create ledger entry
    db
      .prepare(
        `INSERT INTO ledger_entries (
          id, owner_type, owner_id, entry_type, amount, currency,
          balance_after, reference_type, reference_id, description, idempotency_key, metadata
        ) VALUES (
          lower(hex(randomblob(16))), 'agent', 'humanads_treasury', 'auf_received', ?, 'USD',
          ?, 'mission', ?, 'Address Unlock Fee received', ?, ?
        )`
      )
      .bind(
        amountCents,
        newTreasuryAvailable,
        missionId,
        idempotencyKey,
        JSON.stringify({ tx_hash: txHash, chain, token, agent_id: agentId })
      ),
  ]);

  return { success: true };
}

/**
 * Record payout tracked (90% direct payment)
 * Called when AI Agent pays 90% directly to operator
 */
export async function recordPayoutTracked(
  db: D1Database,
  missionId: string,
  agentId: string,
  operatorId: string,
  amountCents: number,
  txHash: string,
  chain: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const idempotencyKey = `payout_${missionId}_${txHash}`;

  // Idempotency check
  const existing = await db
    .prepare('SELECT id FROM ledger_entries WHERE idempotency_key = ?')
    .bind(idempotencyKey)
    .first();

  if (existing) {
    return { success: true };
  }

  // Update operator's total earnings (tracked, not actual balance since it's on-chain)
  await db.batch([
    // Update operator stats
    db
      .prepare(
        `UPDATE operators SET
          total_earnings = total_earnings + ?,
          total_missions_completed = total_missions_completed + 1,
          updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(amountCents, operatorId),
    // Create ledger entry for tracking purposes
    db
      .prepare(
        `INSERT INTO ledger_entries (
          id, owner_type, owner_id, entry_type, amount, currency,
          balance_after, reference_type, reference_id, description, idempotency_key, metadata
        ) VALUES (
          lower(hex(randomblob(16))), 'operator', ?, 'payout_tracked', ?, 'USD',
          0, 'mission', ?, 'Direct payout tracked (on-chain)', ?, ?
        )`
      )
      .bind(
        operatorId,
        amountCents,
        missionId,
        idempotencyKey,
        JSON.stringify({ tx_hash: txHash, chain, token, agent_id: agentId })
      ),
  ]);

  return { success: true };
}

/**
 * Update agent trust score after payment
 */
export async function updateAgentTrustScore(
  db: D1Database,
  agentId: string,
  payTimeSeconds: number,
  isOverdue: boolean
): Promise<{ success: boolean; error?: string }> {
  // Get current agent stats
  const agent = await db
    .prepare(
      `SELECT paid_count, overdue_count, avg_pay_time_seconds, is_suspended_for_overdue
       FROM agents WHERE id = ?`
    )
    .bind(agentId)
    .first<{
      paid_count: number;
      overdue_count: number;
      avg_pay_time_seconds: number;
      is_suspended_for_overdue: number;
    }>();

  if (!agent) {
    return { success: false, error: 'Agent not found' };
  }

  const currentPaidCount = agent.paid_count || 0;
  const currentOverdueCount = agent.overdue_count || 0;
  const currentAvgPayTime = agent.avg_pay_time_seconds || 0;

  // Calculate new stats
  let newPaidCount = currentPaidCount;
  let newOverdueCount = currentOverdueCount;
  let newAvgPayTime = currentAvgPayTime;
  let isSuspended = !!agent.is_suspended_for_overdue;
  let lastOverdueAt: string | null = null;

  if (isOverdue) {
    newOverdueCount = currentOverdueCount + 1;
    lastOverdueAt = new Date().toISOString();

    // Auto-suspend rules:
    // - 3rd overdue: permanent suspension
    // - 2nd overdue: 7-day suspension (handled by scheduled job)
    // - 1st overdue: warning only
    if (newOverdueCount >= 3) {
      isSuspended = true;
    }
  } else {
    newPaidCount = currentPaidCount + 1;
    // Calculate running average of pay time
    newAvgPayTime = Math.floor(
      (currentAvgPayTime * currentPaidCount + payTimeSeconds) / (currentPaidCount + 1)
    );
  }

  // Update agent
  if (lastOverdueAt) {
    await db
      .prepare(
        `UPDATE agents SET
          paid_count = ?,
          overdue_count = ?,
          avg_pay_time_seconds = ?,
          is_suspended_for_overdue = ?,
          last_overdue_at = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(newPaidCount, newOverdueCount, newAvgPayTime, isSuspended ? 1 : 0, lastOverdueAt, agentId)
      .run();
  } else {
    await db
      .prepare(
        `UPDATE agents SET
          paid_count = ?,
          overdue_count = ?,
          avg_pay_time_seconds = ?,
          is_suspended_for_overdue = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(newPaidCount, newOverdueCount, newAvgPayTime, isSuspended ? 1 : 0, agentId)
      .run();
  }

  return { success: true };
}

/**
 * Mark agent as overdue (called by scheduled job)
 */
export async function markAgentOverdue(
  db: D1Database,
  agentId: string,
  missionId: string
): Promise<{ success: boolean; error?: string }> {
  // Get current overdue count
  const agent = await db
    .prepare(`SELECT overdue_count, is_suspended_for_overdue FROM agents WHERE id = ?`)
    .bind(agentId)
    .first<{ overdue_count: number; is_suspended_for_overdue: number }>();

  if (!agent) {
    return { success: false, error: 'Agent not found' };
  }

  const newOverdueCount = (agent.overdue_count || 0) + 1;
  const now = new Date().toISOString();

  // Determine suspension status
  // 1st: warning only
  // 2nd: 7-day suspension
  // 3rd+: permanent suspension
  let isSuspended = false;
  if (newOverdueCount >= 2) {
    isSuspended = true;
  }

  await db.batch([
    // Update mission status
    db
      .prepare(
        `UPDATE missions SET
          status = 'overdue',
          overdue_at = datetime('now'),
          updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(missionId),
    // Update agent stats
    db
      .prepare(
        `UPDATE agents SET
          overdue_count = ?,
          is_suspended_for_overdue = ?,
          last_overdue_at = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(newOverdueCount, isSuspended ? 1 : 0, now, agentId),
  ]);

  return { success: true };
}
