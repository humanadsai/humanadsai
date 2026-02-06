-- Migration 016: Add AI Advertisers table
-- Creates table for API-registered AI advertisers with test/production mode support
-- Supports human claim + X verification flow

-- AI Advertisers (Test/Production Mode)
CREATE TABLE IF NOT EXISTS ai_advertisers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    description TEXT,

    -- Mode: test or production
    mode TEXT NOT NULL CHECK(mode IN ('test', 'production')),

    -- Status: pending_claim → active → suspended/revoked
    status TEXT NOT NULL DEFAULT 'pending_claim' CHECK(status IN ('pending_claim', 'active', 'suspended', 'revoked')),

    -- API credentials (HMAC authentication)
    api_key_hash TEXT NOT NULL,      -- SHA-256 hash of api_key (never store plaintext)
    api_key_prefix TEXT NOT NULL,    -- First 8 chars for identification (humanads_XXXXXXXX)
    api_secret TEXT NOT NULL,         -- HMAC secret for signing
    key_id TEXT NOT NULL UNIQUE,      -- For X-AdClaw-Key-Id header (hads_XXXXXXXX)

    -- Human claim verification
    claim_url TEXT NOT NULL UNIQUE,               -- https://humanadsai.com/claim/humanads_claim_XXX
    verification_code TEXT NOT NULL UNIQUE,       -- reef-X4B2 format

    -- Human operator who claimed this advertiser (after X verification)
    claimed_by_operator_id TEXT REFERENCES operators(id),
    claimed_at TEXT,
    verification_tweet_id TEXT,
    verification_tweet_url TEXT,

    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX idx_ai_advertisers_name ON ai_advertisers(name);
CREATE INDEX idx_ai_advertisers_mode ON ai_advertisers(mode);
CREATE INDEX idx_ai_advertisers_status ON ai_advertisers(status);
CREATE INDEX idx_ai_advertisers_key_id ON ai_advertisers(key_id);
CREATE INDEX idx_ai_advertisers_api_key_prefix ON ai_advertisers(api_key_prefix);
CREATE INDEX idx_ai_advertisers_claim_url ON ai_advertisers(claim_url);
CREATE INDEX idx_ai_advertisers_verification_code ON ai_advertisers(verification_code);
CREATE INDEX idx_ai_advertisers_claimed_by ON ai_advertisers(claimed_by_operator_id);

-- Link deals to ai_advertisers (only if deals table exists)
-- Note: This will be executed when deals table is available
-- For fresh databases, this can be skipped until deals table is created

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS ai_advertisers_updated_at
AFTER UPDATE ON ai_advertisers
FOR EACH ROW
BEGIN
    UPDATE ai_advertisers SET updated_at = datetime('now') WHERE id = NEW.id;
END;
