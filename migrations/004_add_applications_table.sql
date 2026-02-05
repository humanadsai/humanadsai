-- Applications table for the Apply → AI Selection model
-- Slots are only consumed when an application is SELECTED, not when applied

CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    deal_id TEXT NOT NULL REFERENCES deals(id),
    operator_id TEXT NOT NULL REFERENCES operators(id),
    status TEXT NOT NULL DEFAULT 'applied',  -- applied/shortlisted/selected/rejected/withdrawn/expired/cancelled

    -- Application form fields
    proposed_angle TEXT,
    estimated_post_time_window TEXT,
    draft_copy TEXT,
    accept_disclosure INTEGER NOT NULL DEFAULT 0,
    accept_no_engagement_buying INTEGER NOT NULL DEFAULT 0,
    language TEXT,
    audience_fit TEXT,
    portfolio_links TEXT,

    -- Timestamps
    applied_at TEXT DEFAULT (datetime('now')),
    shortlisted_at TEXT,
    selected_at TEXT,
    rejected_at TEXT,
    withdrawn_at TEXT,

    -- AI review
    ai_score INTEGER,
    ai_notes TEXT,

    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(deal_id, operator_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_deal ON applications(deal_id);
CREATE INDEX IF NOT EXISTS idx_applications_operator ON applications(operator_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Deals table modifications for slot tracking
-- slots_total: Maximum number of slots (same as max_participants)
-- slots_selected: Number of slots consumed by selected applications
-- applications_count: Total number of applications received

ALTER TABLE deals ADD COLUMN slots_total INTEGER;
ALTER TABLE deals ADD COLUMN slots_selected INTEGER DEFAULT 0;
ALTER TABLE deals ADD COLUMN applications_count INTEGER DEFAULT 0;

-- Initialize slots_total from max_participants and slots_selected from current_participants
UPDATE deals SET slots_total = max_participants, slots_selected = current_participants;
