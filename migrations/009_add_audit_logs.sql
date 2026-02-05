-- Add audit_logs table for admin logging
-- This table was defined in schema.sql but not migrated to production

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- Request info
    request_id TEXT NOT NULL,
    -- Agent info
    agent_id TEXT,
    api_key_id TEXT,
    -- Request details
    ip_address TEXT,
    user_agent TEXT,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    -- Signature verification
    signature_valid INTEGER,
    timestamp_skew_ms INTEGER,
    nonce TEXT,
    body_hash TEXT,
    -- Decision
    decision TEXT NOT NULL,
    denial_reason TEXT,
    -- Response
    response_status INTEGER,
    -- Metadata
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_request ON audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_audit_agent ON audit_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_audit_decision ON audit_logs(decision);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
