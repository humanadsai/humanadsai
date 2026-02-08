-- Advertiser approvals: stores on-chain approve(escrow, maxUint256) records for escrow deposits
CREATE TABLE IF NOT EXISTS advertiser_approvals (
    id TEXT PRIMARY KEY,
    advertiser_id TEXT NOT NULL,
    tx_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_advertiser_approvals_advertiser_id ON advertiser_approvals(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_advertiser_approvals_status ON advertiser_approvals(status);
