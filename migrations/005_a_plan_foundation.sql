-- A-Plan (Address Unlock Fee) Foundation Migration
-- Changes HumanAds from escrow to payment coordination model

-- ============================================
-- Missions Extensions (A-Plan Timestamps)
-- ============================================

ALTER TABLE missions ADD COLUMN approved_at TEXT;
ALTER TABLE missions ADD COLUMN auf_tx_hash TEXT;
ALTER TABLE missions ADD COLUMN auf_confirmed_at TEXT;
ALTER TABLE missions ADD COLUMN payout_deadline_at TEXT;
ALTER TABLE missions ADD COLUMN payout_tx_hash TEXT;
ALTER TABLE missions ADD COLUMN payout_confirmed_at TEXT;
ALTER TABLE missions ADD COLUMN overdue_at TEXT;

-- ============================================
-- Agents Extensions (Trust/Credit Score)
-- ============================================

ALTER TABLE agents ADD COLUMN paid_count INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN overdue_count INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN avg_pay_time_seconds INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN is_suspended_for_overdue INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN last_overdue_at TEXT;

-- ============================================
-- Deals Extensions (Payment Model Selection)
-- ============================================

ALTER TABLE deals ADD COLUMN payment_model TEXT DEFAULT 'escrow';
ALTER TABLE deals ADD COLUMN auf_percentage INTEGER DEFAULT 10;

-- ============================================
-- Applications Extensions (Payment Reference)
-- ============================================

ALTER TABLE applications ADD COLUMN payment_ref TEXT UNIQUE;

-- ============================================
-- Payments Table (AUF + 90% TxHash Tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    mission_id TEXT NOT NULL REFERENCES missions(id),
    agent_id TEXT NOT NULL,
    operator_id TEXT NOT NULL,
    -- Payment type: 'auf' (10% address unlock fee) or 'payout' (90% direct payment)
    payment_type TEXT NOT NULL,
    -- Amount in cents
    amount_cents INTEGER NOT NULL,
    -- Blockchain details
    chain TEXT NOT NULL,
    token TEXT NOT NULL,
    tx_hash TEXT,
    to_address TEXT,
    -- Status: pending, submitted, confirmed, failed
    status TEXT NOT NULL DEFAULT 'pending',
    confirmed_at TEXT,
    deadline_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- Payout Links Table (Secure Address Disclosure)
-- ============================================

CREATE TABLE IF NOT EXISTS payout_links (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    mission_id TEXT NOT NULL REFERENCES missions(id),
    -- Secure token for one-time address reveal
    token_hash TEXT NOT NULL UNIQUE,
    -- Blockchain details
    chain TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    -- Status: pending_auf, unlocked, paid, expired
    status TEXT NOT NULL DEFAULT 'pending_auf',
    unlocked_at TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_missions_payout_deadline ON missions(payout_deadline_at);
CREATE INDEX IF NOT EXISTS idx_missions_approved_at ON missions(approved_at);
CREATE INDEX IF NOT EXISTS idx_missions_overdue_at ON missions(overdue_at);

CREATE INDEX IF NOT EXISTS idx_payments_mission ON payments(mission_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_agent ON payments(agent_id);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);

CREATE INDEX IF NOT EXISTS idx_payout_links_mission ON payout_links(mission_id);
CREATE INDEX IF NOT EXISTS idx_payout_links_token ON payout_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_payout_links_status ON payout_links(status);

CREATE INDEX IF NOT EXISTS idx_agents_overdue ON agents(is_suspended_for_overdue);
CREATE INDEX IF NOT EXISTS idx_agents_paid_count ON agents(paid_count);

CREATE INDEX IF NOT EXISTS idx_applications_payment_ref ON applications(payment_ref);
