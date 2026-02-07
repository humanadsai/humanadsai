-- Migration: Rename 'withdrawn' status to 'cancelled' for applications
-- Unify terminology: "withdraw" → "cancel" across the codebase

-- 1. Add cancelled_at column
ALTER TABLE applications ADD COLUMN cancelled_at TEXT;

-- 2. Copy withdrawn_at data to cancelled_at
UPDATE applications SET cancelled_at = withdrawn_at WHERE withdrawn_at IS NOT NULL;

-- 3. Update all 'withdrawn' statuses to 'cancelled'
UPDATE applications SET status = 'cancelled' WHERE status = 'withdrawn';
