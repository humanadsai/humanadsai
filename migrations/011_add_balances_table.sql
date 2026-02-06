-- Add balances table (may already exist from initial schema, IF NOT EXISTS ensures safety)

CREATE TABLE IF NOT EXISTS balances (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- owner_type: agent, operator
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    -- Available balance (cents)
    available INTEGER NOT NULL DEFAULT 0,
    -- Pending (escrow)
    pending INTEGER NOT NULL DEFAULT 0,
    -- Currency (for future expansion)
    currency TEXT NOT NULL DEFAULT 'USD',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(owner_type, owner_id, currency)
);

CREATE INDEX IF NOT EXISTS idx_balances_owner ON balances(owner_type, owner_id);
