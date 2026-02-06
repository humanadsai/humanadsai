-- Migration 015: Add deal visibility (hide/delete/restore)
-- Adds soft-delete visibility states for admin deal management

-- Add visibility columns to deals table
ALTER TABLE deals ADD COLUMN visibility TEXT NOT NULL DEFAULT 'visible';
ALTER TABLE deals ADD COLUMN visibility_changed_at TEXT;
ALTER TABLE deals ADD COLUMN visibility_changed_by TEXT;
ALTER TABLE deals ADD COLUMN admin_note TEXT;

-- Admin actions log table
CREATE TABLE IF NOT EXISTS admin_actions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  admin_id TEXT NOT NULL,
  admin_handle TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  reason TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deals_visibility ON deals(visibility);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON admin_actions(created_at);
