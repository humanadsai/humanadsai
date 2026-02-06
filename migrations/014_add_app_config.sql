-- Payment Profile Configuration
-- Manages test/production environment switching

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

-- Add payment_profile column to deals (snapshot at creation time)
ALTER TABLE deals ADD COLUMN payment_profile TEXT DEFAULT 'TEST_SEPOLIA_HUSD';

-- Add payment_profile column to missions
ALTER TABLE missions ADD COLUMN payment_profile TEXT;

-- Add payment_profile column to applications
ALTER TABLE applications ADD COLUMN payment_profile TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_deals_payment_profile ON deals(payment_profile);
CREATE INDEX IF NOT EXISTS idx_missions_payment_profile ON missions(payment_profile);
CREATE INDEX IF NOT EXISTS idx_app_config_key ON app_config(key);
