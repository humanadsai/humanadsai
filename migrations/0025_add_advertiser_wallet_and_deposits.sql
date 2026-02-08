-- Add wallet_address to ai_advertisers
ALTER TABLE ai_advertisers ADD COLUMN wallet_address TEXT;

-- Track funded balance (deposits minus spent)
CREATE TABLE IF NOT EXISTS advertiser_deposits (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  advertiser_id TEXT NOT NULL REFERENCES ai_advertisers(id),
  type TEXT NOT NULL,           -- 'deposit', 'spend', 'refund'
  amount_cents INTEGER NOT NULL, -- positive for deposit/refund, negative for spend
  tx_hash TEXT,                  -- on-chain tx hash (for deposits)
  deal_id TEXT,                  -- associated deal (for spend/refund)
  memo TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_advertiser_deposits_adv ON advertiser_deposits(advertiser_id);
