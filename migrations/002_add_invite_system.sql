-- Migration: Add invite system columns to operators table
-- Run this in Cloudflare D1 Console

-- Invite System columns
ALTER TABLE operators ADD COLUMN invite_code TEXT;
ALTER TABLE operators ADD COLUMN invited_by TEXT;
ALTER TABLE operators ADD COLUMN invite_count INTEGER DEFAULT 0;

-- Create unique index for invite_code (can't add UNIQUE via ALTER TABLE)
CREATE UNIQUE INDEX IF NOT EXISTS idx_operators_invite_code ON operators(invite_code);

-- Create index for invited_by lookups
CREATE INDEX IF NOT EXISTS idx_operators_invited_by ON operators(invited_by);
