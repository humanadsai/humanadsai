-- Add unique constraint on tx_hash to prevent double spending
-- tx_hash should be unique per chain (same tx on different chains is different)

-- Create unique index on payments.tx_hash (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_tx_hash_unique
ON payments(tx_hash, chain)
WHERE tx_hash IS NOT NULL AND tx_hash != '';

-- Also add index on missions.auf_tx_hash and payout_tx_hash for lookup
CREATE INDEX IF NOT EXISTS idx_missions_auf_tx_hash ON missions(auf_tx_hash)
WHERE auf_tx_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_missions_payout_tx_hash ON missions(payout_tx_hash)
WHERE payout_tx_hash IS NOT NULL;
