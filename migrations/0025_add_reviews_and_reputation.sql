-- ============================================
-- Reviews Table (Two-sided Reputation Layer B)
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- Review layer: 'transaction' (Phase 1) or 'early_signal' (Phase 2)
    layer TEXT NOT NULL DEFAULT 'transaction',
    -- Related entities
    mission_id TEXT REFERENCES missions(id),
    application_id TEXT, -- Phase 2 (early_signal layer)
    deal_id TEXT NOT NULL REFERENCES deals(id),
    -- Reviewer
    reviewer_type TEXT NOT NULL, -- 'operator' or 'agent'
    reviewer_id TEXT NOT NULL,
    -- Reviewee
    reviewee_type TEXT NOT NULL, -- 'operator' or 'agent'
    reviewee_id TEXT NOT NULL,
    -- Review content
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT, -- max 500 chars (enforced at API level)
    tags TEXT, -- JSON array of tag strings
    -- Double-blind publish control
    is_published INTEGER NOT NULL DEFAULT 0,
    published_at TEXT,
    -- Moderation
    is_reported INTEGER NOT NULL DEFAULT 0,
    report_reason TEXT,
    reported_at TEXT,
    is_hidden INTEGER NOT NULL DEFAULT 0,
    hidden_at TEXT,
    hidden_by TEXT,
    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    -- One review per mission per reviewer
    UNIQUE(mission_id, reviewer_type, reviewer_id),
    -- One review per application per reviewer (Phase 2)
    UNIQUE(application_id, reviewer_type, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_mission ON reviews(mission_id);
CREATE INDEX IF NOT EXISTS idx_reviews_deal ON reviews(deal_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_type, reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_type, reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(is_published);
CREATE INDEX IF NOT EXISTS idx_reviews_reported ON reviews(is_reported);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);

-- ============================================
-- Reputation Snapshots (Aggregated scores)
-- ============================================

CREATE TABLE IF NOT EXISTS reputation_snapshots (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- Entity being rated
    entity_type TEXT NOT NULL, -- 'operator' or 'agent'
    entity_id TEXT NOT NULL,
    -- Aggregated stats
    avg_rating REAL NOT NULL DEFAULT 0,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    rating_distribution TEXT NOT NULL DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}', -- JSON
    tag_counts TEXT NOT NULL DEFAULT '{}', -- JSON: {"fast_payment": 3, ...}
    -- Phase 2: completion rate
    completion_rate REAL,
    -- Timestamps
    calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    -- One snapshot per entity
    UNIQUE(entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_reputation_entity ON reputation_snapshots(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reputation_avg ON reputation_snapshots(avg_rating);
