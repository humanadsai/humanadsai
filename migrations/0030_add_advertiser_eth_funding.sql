-- Track ETH auto-funding for rate limiting (max 1 per advertiser per 24h)
CREATE TABLE IF NOT EXISTS advertiser_eth_funding (
  id TEXT PRIMARY KEY,
  advertiser_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  amount_wei TEXT NOT NULL,
  tx_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_eth_funding_advertiser ON advertiser_eth_funding(advertiser_id, created_at);
