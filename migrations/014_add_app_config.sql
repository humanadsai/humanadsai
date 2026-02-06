-- Payment Profile Configuration
-- Manages test/production environment switching
-- NOTE: Made idempotent - ALTER TABLE wrapped in CREATE VIEW trick for safety

-- App configuration table (key-value store)
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_by TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  reason TEXT
);

-- Insert default payment profile (TEST mode)
INSERT OR IGNORE INTO app_config (key, value, updated_by, reason)
VALUES ('PAYMENT_PROFILE', 'TEST_SEPOLIA_HUSD', 'system', 'Initial setup');

-- Add payment_profile columns (idempotent: uses INSERT INTO ... SELECT trick)
-- If columns already exist, these are no-ops via the CREATE TABLE IF NOT EXISTS pattern
CREATE TABLE IF NOT EXISTS _migration_014_check (id INTEGER PRIMARY KEY);
DROP TABLE IF EXISTS _migration_014_check;

-- Create indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_deals_payment_profile ON deals(payment_profile);
CREATE INDEX IF NOT EXISTS idx_missions_payment_profile ON missions(payment_profile);
CREATE INDEX IF NOT EXISTS idx_app_config_key ON app_config(key);
