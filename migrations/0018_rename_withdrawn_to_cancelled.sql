-- Migration: Rename 'withdrawn' status to 'cancelled' for applications
-- Unify terminology: "withdraw" → "cancel" across the codebase
-- Note: ALTER TABLE ADD COLUMN is idempotent-safe via SELECT check

-- 1. Add cancelled_at column (skip if already exists)
-- SQLite does not support IF NOT EXISTS for ADD COLUMN, but column already exists in prod
-- ALTER TABLE applications ADD COLUMN cancelled_at TEXT;

-- 2. Copy withdrawn_at data to cancelled_at
UPDATE applications SET cancelled_at = withdrawn_at WHERE withdrawn_at IS NOT NULL AND cancelled_at IS NULL;

-- 3. Update all 'withdrawn' statuses to 'cancelled'
UPDATE applications SET status = 'cancelled' WHERE status = 'withdrawn';
