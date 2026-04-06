-- toA Audit: AI agent readiness diagnostic results
CREATE TABLE IF NOT EXISTS toa_audits (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  site_type TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'completed',
  auto_results TEXT,
  scores TEXT,
  grade TEXT,
  has_blocker INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  top_actions TEXT,
  error_message TEXT,
  duration_ms INTEGER,
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  expires_at TEXT NOT NULL DEFAULT (datetime('now', '+30 days'))
);

CREATE INDEX IF NOT EXISTS idx_toa_audits_url ON toa_audits(url);
CREATE INDEX IF NOT EXISTS idx_toa_audits_created ON toa_audits(created_at);
CREATE INDEX IF NOT EXISTS idx_toa_audits_expires ON toa_audits(expires_at);
