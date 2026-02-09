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
CREATE INDEX idx_media_assets_owner ON media_assets(owner_advertiser_id);
CREATE INDEX idx_media_assets_status ON media_assets(status);

-- Mission media requirements
ALTER TABLE deals ADD COLUMN required_media_type TEXT NOT NULL DEFAULT 'none';
ALTER TABLE deals ADD COLUMN image_asset_id TEXT REFERENCES media_assets(id);
ALTER TABLE deals ADD COLUMN image_url TEXT;
ALTER TABLE deals ADD COLUMN media_instructions TEXT;
ALTER TABLE deals ADD COLUMN media_policy TEXT;

-- Submission media verification
ALTER TABLE missions ADD COLUMN detected_media_count INTEGER;
ALTER TABLE missions ADD COLUMN detected_media_types TEXT;
ALTER TABLE missions ADD COLUMN media_requirement_passed INTEGER;
ALTER TABLE missions ADD COLUMN media_verify_details TEXT;
