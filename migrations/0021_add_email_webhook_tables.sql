-- Email webhook event log (idempotent via event_id PK)
CREATE TABLE IF NOT EXISTS email_webhook_events (
  event_id TEXT PRIMARY KEY,           -- Resend event ID (idempotency key)
  type TEXT NOT NULL,                   -- e.g. 'email.bounced'
  email_to TEXT,                        -- recipient address
  email_from TEXT,                      -- sender address
  subject TEXT,                         -- email subject
  resend_message_id TEXT,               -- Resend internal message ID
  bounce_type TEXT,                     -- 'hard' | 'soft' (for bounces)
  error_message TEXT,                   -- error details
  raw_payload TEXT NOT NULL,            -- full JSON payload
  processed INTEGER DEFAULT 0,         -- 0 = pending, 1 = processed
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_webhook_events(type);
CREATE INDEX IF NOT EXISTS idx_email_events_email ON email_webhook_events(email_to);

-- Email suppression list
CREATE TABLE IF NOT EXISTS email_suppressions (
  email TEXT PRIMARY KEY,               -- lowercased email address
  reason TEXT NOT NULL,                 -- 'hard_bounce' | 'complaint' | 'manual'
  bounce_count INTEGER DEFAULT 0,       -- soft bounce counter
  suppressed INTEGER DEFAULT 0,         -- 1 = actively suppressed
  first_event_at TEXT,                  -- when first bounce/complaint occurred
  suppressed_at TEXT,                   -- when suppression was activated
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
