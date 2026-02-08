-- Advertiser permits: stores EIP-2612 permit signatures for gasless escrow deposits
CREATE TABLE IF NOT EXISTS advertiser_permits (
    id TEXT PRIMARY KEY,
    advertiser_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    deadline INTEGER NOT NULL,
    v INTEGER NOT NULL,
    r TEXT NOT NULL,
    s TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    used_deal_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_advertiser_permits_advertiser_id ON advertiser_permits(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_advertiser_permits_status ON advertiser_permits(status);
