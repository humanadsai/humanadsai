-- Migration 0032: Add video posting tables for Remotion + Postiz integration
-- Supports automated video generation and social media posting

-- Main video post record
CREATE TABLE IF NOT EXISTS video_posts (
  id TEXT PRIMARY KEY,
  internal_title TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'slideshow',
  template_version TEXT DEFAULT 'v1',
  script_text TEXT NOT NULL,
  slides_json TEXT,
  slides_count INTEGER DEFAULT 0,
  caption_text TEXT,
  hashtags_text TEXT,
  yt_title TEXT,
  yt_visibility TEXT DEFAULT 'unlisted',
  cta_text TEXT,
  bgm_preset TEXT DEFAULT 'none',
  aspect_ratio TEXT DEFAULT '9:16',
  status TEXT NOT NULL DEFAULT 'draft_input',
  publish_mode TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TEXT,
  retry_count INTEGER DEFAULT 0,
  created_by TEXT,
  visibility TEXT DEFAULT 'visible',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_video_posts_status ON video_posts(status);
CREATE INDEX IF NOT EXISTS idx_video_posts_visibility ON video_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_video_posts_created ON video_posts(created_at);

-- Per-platform target status (YouTube / Instagram)
CREATE TABLE IF NOT EXISTS video_post_targets (
  id TEXT PRIMARY KEY,
  video_post_id TEXT NOT NULL REFERENCES video_posts(id),
  platform TEXT NOT NULL,
  postiz_integration_id TEXT,
  postiz_post_id TEXT,
  postiz_media_id TEXT,
  postiz_media_path TEXT,
  target_status TEXT NOT NULL DEFAULT 'pending',
  published_url TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_video_post_targets_post ON video_post_targets(video_post_id);
CREATE INDEX IF NOT EXISTS idx_video_post_targets_status ON video_post_targets(target_status);

-- Remotion render job tracking
CREATE TABLE IF NOT EXISTS video_render_jobs (
  id TEXT PRIMARY KEY,
  video_post_id TEXT NOT NULL REFERENCES video_posts(id),
  remotion_render_id TEXT,
  remotion_bucket TEXT,
  remotion_region TEXT DEFAULT 'ap-northeast-1',
  remotion_composition TEXT,
  input_payload_json TEXT,
  render_status TEXT NOT NULL DEFAULT 'queued',
  output_video_url TEXT,
  output_thumbnail_url TEXT,
  duration_sec REAL,
  render_cost_usd REAL,
  started_at TEXT,
  completed_at TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_video_render_jobs_post ON video_render_jobs(video_post_id);
CREATE INDEX IF NOT EXISTS idx_video_render_jobs_status ON video_render_jobs(render_status);

-- Event log for all video job steps
CREATE TABLE IF NOT EXISTS video_job_events (
  id TEXT PRIMARY KEY,
  video_post_id TEXT NOT NULL REFERENCES video_posts(id),
  job_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  message TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_video_job_events_post ON video_job_events(video_post_id);
CREATE INDEX IF NOT EXISTS idx_video_job_events_type ON video_job_events(job_type, event_type);
