-- Token operations log for hUSD mint, transfer, faucet
CREATE TABLE IF NOT EXISTS token_ops (
  id TEXT PRIMARY KEY,
  op_type TEXT NOT NULL, -- 'mint', 'transfer', 'faucet'
  chain TEXT NOT NULL DEFAULT 'sepolia',
  token TEXT NOT NULL DEFAULT 'hUSD',
  from_address TEXT,
  to_address TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'submitted', 'confirmed', 'failed'
  error_message TEXT,
  operator_id TEXT, -- admin who triggered
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at TEXT
);

-- Index for cooldown checks
CREATE INDEX IF NOT EXISTS idx_token_ops_to_address ON token_ops(to_address, op_type, created_at);

-- Index for status monitoring
CREATE INDEX IF NOT EXISTS idx_token_ops_status ON token_ops(status, created_at);
