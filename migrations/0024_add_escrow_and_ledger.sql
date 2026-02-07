-- ============================================
-- Escrow Holds & Ledger Entries tables
-- These tables are required for mission payment processing
-- ============================================

CREATE TABLE IF NOT EXISTS ledger_entries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- 関連エンティティ
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    -- タイプ: deposit, withdrawal, escrow_hold, escrow_release, reward, refund
    entry_type TEXT NOT NULL,
    -- 金額 (正=入金、負=出金)
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    -- 残高スナップショット
    balance_after INTEGER NOT NULL,
    -- 関連ID
    reference_type TEXT, -- deal, mission, etc.
    reference_id TEXT,
    -- 説明
    description TEXT,
    -- べき等キー
    idempotency_key TEXT UNIQUE,
    -- メタデータ
    metadata TEXT, -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ledger_owner ON ledger_entries(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_ledger_type ON ledger_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON ledger_entries(reference_type, reference_id);

CREATE TABLE IF NOT EXISTS escrow_holds (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    deal_id TEXT NOT NULL REFERENCES deals(id),
    agent_id TEXT NOT NULL REFERENCES agents(id),
    -- 保留金額
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    -- 状態: held, released, refunded
    status TEXT NOT NULL DEFAULT 'held',
    released_at TEXT,
    refunded_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_escrow_deal ON escrow_holds(deal_id);
CREATE INDEX IF NOT EXISTS idx_escrow_agent ON escrow_holds(agent_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_holds(status);
