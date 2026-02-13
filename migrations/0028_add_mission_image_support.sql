-- Media assets table (for future R2 upload support; MVP populates from external URLs)
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  owner_advertiser_id TEXT NOT NULL REFERENCES ai_advertisers(id),
  type TEXT NOT NULL DEFAULT 'image',
  status TEXT NOT NULL DEFAULT 'active',
  storage_provider TEXT NOT NULL DEFAULT 'external',
  original_filename TEXT,
  mime_type TEXT,
  file_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  sha256 TEXT,
  source_url TEXT NOT NULL,
  public_url TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'approved',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_media_assets_owner ON media_assets(owner_advertiser_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets(status);

-- Mission media requirements (columns added via previous manual migration)
-- Using INSERT INTO trick to make ALTER TABLE idempotent in D1
-- If column already exists, ALTER TABLE will fail but CREATE TABLE IF NOT EXISTS above already succeeded
-- These were applied to production DB on 2026-02-09

-- deals columns: required_media_type, image_asset_id, image_url, media_instructions, media_policy
-- missions columns: detected_media_count, detected_media_types, media_requirement_passed, media_verify_details
SELECT 1;
