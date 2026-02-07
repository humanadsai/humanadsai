-- Track server-side faucet claims for cooldown enforcement
CREATE TABLE IF NOT EXISTS faucet_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT NOT NULL,
  tx_hash TEXT,
  amount_cents INTEGER DEFAULT 100000,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_faucet_claims_address ON faucet_claims(address);
