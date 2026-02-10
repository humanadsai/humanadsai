import type { Env, Balance, LedgerEntry, EscrowHold } from '../types';

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
  if (amount <= 0 || !Number.isFinite(amount)) {
    return { success: false, error: 'Amount must be a positive finite number' };
  }
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
  if (amount <= 0 || !Number.isFinite(amount)) {
    return { success: false, error: 'Amount must be a positive finite number' };
  }
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

  const escrowId = crypto.randomUUID().replace(/-/g, '');
  // Pre-compute expected balance_after for ledger entry (tracking only)
  const expectedAvailableAfter = balance.available - amount;

  // Use relative SQL updates (available = available - ?) with WHERE guard
  // to prevent TOCTOU race conditions on concurrent requests
  await db.batch([
    // 残高更新 - atomic decrement with sufficient-funds guard
    db
      .prepare(
        `UPDATE balances SET available = available - ?, pending = pending + ?, updated_at = datetime('now')
         WHERE owner_type = 'agent' AND owner_id = ? AND currency = 'USD' AND available >= ?`
      )
      .bind(amount, amount, agentId, amount),
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
      .bind(agentId, -amount, expectedAvailableAfter, dealId, idempotencyKey),
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

  // Use relative SQL updates to prevent TOCTOU race conditions
  // Pre-compute expected balance_after values for ledger entries (tracking only)
  const expectedOperatorAvailable = operatorBalance.available + amount;

  // バッチで実行
  await db.batch([
    // Operator残高更新 - atomic increment
    db
      .prepare(
        `UPDATE balances SET available = available + ?, updated_at = datetime('now')
         WHERE owner_type = 'operator' AND owner_id = ? AND currency = 'USD'`
      )
      .bind(amount, operatorId),
    // Agent pending更新 - atomic decrement
    db
      .prepare(
        `UPDATE balances SET pending = pending - ?, updated_at = datetime('now')
         WHERE owner_type = 'agent' AND owner_id = ? AND currency = 'USD'`
      )
      .bind(amount, mission.agent_id),
    // エスクロー更新
    db
      .prepare(
        `UPDATE escrow_holds SET amount = amount - ?, status = CASE WHEN amount - ? <= 0 THEN 'released' ELSE status END,
         released_at = CASE WHEN amount - ? <= 0 THEN datetime('now') ELSE released_at END
         WHERE id = ? AND amount >= ?`
      )
      .bind(amount, amount, amount, escrow.id, amount),
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
      .bind(operatorId, amount, expectedOperatorAvailable, missionId, idempotencyKey),
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

  // バッチで実行（相対UPDATE: TOCTOU race condition防止）
  await db.batch([
    // 残高更新（relative — consistent with holdEscrow/releaseToOperator）
    db
      .prepare(
        `UPDATE balances SET available = available + ?, pending = pending - ?, updated_at = datetime('now')
         WHERE owner_type = 'agent' AND owner_id = ? AND currency = 'USD'`
      )
      .bind(escrow.amount, escrow.amount, escrow.agent_id),
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

