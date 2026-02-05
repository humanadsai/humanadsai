-- Migration: Add site_visits table for tracking page visits
-- Description: Enables real-time site access statistics on landing page

-- ============================================
-- Site Visits Tracking (for public stats)
-- ============================================

CREATE TABLE IF NOT EXISTS site_visits (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- 訪問日 (YYYY-MM-DD)
    visit_date TEXT NOT NULL,
    -- ビジター識別子 (hashed IP + User-Agent for uniqueness, not stored raw)
    visitor_hash TEXT NOT NULL,
    -- ページパス
    page_path TEXT NOT NULL DEFAULT '/',
    -- リファラードメイン (optional)
    referrer_domain TEXT,
    -- 作成日時
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    -- ユニーク訪問者を日別で追跡
    UNIQUE(visit_date, visitor_hash, page_path)
);

CREATE INDEX IF NOT EXISTS idx_site_visits_date ON site_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_site_visits_created ON site_visits(created_at);
