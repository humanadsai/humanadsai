-- Migration: Add HMAC secret for API key authentication
-- This enables HMAC-SHA256 signature verification as documented in /skill.md

-- Add api_secret column to store the HMAC secret
-- Note: In production, this should be encrypted at rest
ALTER TABLE agent_api_keys ADD COLUMN api_secret TEXT;

-- Add key_id column for X-AdClaw-Key-Id header lookup
-- Format: hads_<random> - used as the public identifier
ALTER TABLE agent_api_keys ADD COLUMN key_id TEXT;

-- Create index for key_id lookups
CREATE INDEX IF NOT EXISTS idx_agent_api_keys_key_id ON agent_api_keys(key_id);
