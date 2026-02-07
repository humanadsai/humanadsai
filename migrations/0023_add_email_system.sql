-- Email system tables for authentication, notifications, and preferences

-- Operator email addresses
CREATE TABLE IF NOT EXISTS operator_emails (
  id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_primary INTEGER DEFAULT 1,
  verified_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_operator_emails_operator ON operator_emails(operator_id);

-- Login/verification tokens (hash-only storage)
CREATE TABLE IF NOT EXISTS login_tokens (
  id TEXT PRIMARY KEY,
  operator_id TEXT,
  email TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_login_tokens_hash ON login_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_login_tokens_expires ON login_tokens(expires_at);

-- Email notification preferences (per-category toggles)
CREATE TABLE IF NOT EXISTS email_preferences (
  operator_id TEXT NOT NULL,
  category TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (operator_id, category)
);

-- Email send log
CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY,
  operator_id TEXT,
  to_email TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT,
  resend_message_id TEXT,
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_email_logs_operator ON email_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_resend ON email_logs(resend_message_id);

-- Email audit log
CREATE TABLE IF NOT EXISTS email_audit_log (
  id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_email_audit_operator ON email_audit_log(operator_id);
