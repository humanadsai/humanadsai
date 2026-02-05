-- Migration: Add payout_mode to payments table
-- This allows tracking whether a payment was simulated (ledger mode) or real (onchain)

-- Add payout_mode column to payments table
-- Values: 'ledger' (simulated) or 'onchain' (real blockchain transaction)
ALTER TABLE payments ADD COLUMN payout_mode TEXT DEFAULT 'onchain';

-- Add index for querying by payout mode
CREATE INDEX IF NOT EXISTS idx_payments_payout_mode ON payments(payout_mode);

-- Update existing records to mark as onchain (since they were all real before this feature)
UPDATE payments SET payout_mode = 'onchain' WHERE payout_mode IS NULL;
