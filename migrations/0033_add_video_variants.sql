-- Migration 0033: Add video variant tracking, PDCA metrics, and improvement suggestions
-- Supports A/B testing of YouTube Shorts with structured variant IDs

-- Add variant columns to video_posts
ALTER TABLE video_posts ADD COLUMN variant_id TEXT;
ALTER TABLE video_posts ADD COLUMN topic_id TEXT;
ALTER TABLE video_posts ADD COLUMN episode_number INTEGER;
ALTER TABLE video_posts ADD COLUMN hook_type TEXT;
ALTER TABLE video_posts ADD COLUMN cta_type TEXT;
ALTER TABLE video_posts ADD COLUMN caption_style TEXT;
ALTER TABLE video_posts ADD COLUMN script_version TEXT;
ALTER TABLE video_posts ADD COLUMN duration_target_sec INTEGER;
ALTER TABLE video_posts ADD COLUMN self_score_json TEXT;
ALTER TABLE video_posts ADD COLUMN parent_post_id TEXT;
ALTER TABLE video_posts ADD COLUMN yt_title_candidates TEXT;
ALTER TABLE video_posts ADD COLUMN yt_description_candidates TEXT;
ALTER TABLE video_posts ADD COLUMN pinned_comment_candidates TEXT;

CREATE INDEX IF NOT EXISTS idx_video_posts_variant ON video_posts(variant_id);
CREATE INDEX IF NOT EXISTS idx_video_posts_topic ON video_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_video_posts_parent ON video_posts(parent_post_id);

-- PDCA metrics table: track performance at checkpoints (1h, 6h, 24h, 72h)
CREATE TABLE IF NOT EXISTS video_pdca_metrics (
  id TEXT PRIMARY KEY,
  video_post_id TEXT NOT NULL REFERENCES video_posts(id),
  checkpoint TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  retention_3s REAL,
  retention_5s REAL,
  completion_rate REAL,
  ctr REAL,
  avg_view_duration_sec REAL,
  measured_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_video_pdca_metrics_post ON video_pdca_metrics(video_post_id);
CREATE INDEX IF NOT EXISTS idx_video_pdca_metrics_checkpoint ON video_pdca_metrics(checkpoint);

-- Improvement suggestions from PDCA analysis
CREATE TABLE IF NOT EXISTS video_improvement_suggestions (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  episode_number INTEGER,
  weakness TEXT NOT NULL,
  cause TEXT,
  suggestions_json TEXT,
  next_variants_json TEXT,
  keep_points_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_video_improvement_topic ON video_improvement_suggestions(topic_id);
