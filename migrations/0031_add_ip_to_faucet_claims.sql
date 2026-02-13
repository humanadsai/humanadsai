-- Add IP address tracking to faucet_claims for per-IP rate limiting
ALTER TABLE faucet_claims ADD COLUMN ip_address TEXT;

CREATE INDEX IF NOT EXISTS idx_faucet_claims_ip ON faucet_claims(ip_address, created_at);
