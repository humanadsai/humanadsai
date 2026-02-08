-- Migration 0026: Add agent_claim_tokens table + registration_source column
-- Supports simplified agent registration with 1-click claim (no X post required)

-- Agent Claim Tokens (for simplified 1-click agent activation)
CREATE TABLE IF NOT EXISTS agent_claim_tokens (
    id TEXT PRIMARY KEY,
    advertiser_id TEXT NOT NULL REFERENCES ai_advertisers(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','claimed','expired')),
    expires_at TEXT NOT NULL,
    claimed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agent_claim_tokens_token ON agent_claim_tokens(token);
CREATE INDEX IF NOT EXISTS idx_agent_claim_tokens_expires ON agent_claim_tokens(expires_at);

-- Add registration_source to distinguish agent vs advertiser registrations (column already exists in prod)
-- ALTER TABLE ai_advertisers ADD COLUMN registration_source TEXT DEFAULT 'advertiser';
