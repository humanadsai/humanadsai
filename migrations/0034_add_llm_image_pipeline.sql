-- Migration 0034: Add LLM script rewriting, image generation, and cost tracking
-- Supports: LLM rewrite → harsh evaluator loop → image gen → render pipeline

-- Add LLM pipeline columns to video_posts
ALTER TABLE video_posts ADD COLUMN llm_rewritten_script TEXT;
ALTER TABLE video_posts ADD COLUMN llm_eval_score INTEGER;
ALTER TABLE video_posts ADD COLUMN llm_eval_attempts INTEGER DEFAULT 0;
ALTER TABLE video_posts ADD COLUMN llm_eval_feedback TEXT;

-- Cost tracking table for all generation steps
CREATE TABLE IF NOT EXISTS video_generation_costs (
  id TEXT PRIMARY KEY,
  video_post_id TEXT NOT NULL,
  cost_type TEXT NOT NULL,  -- 'llm_rewrite', 'llm_eval', 'image_gen', 'render'
  amount_usd REAL NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  model TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vgc_video_post ON video_generation_costs(video_post_id);
CREATE INDEX IF NOT EXISTS idx_vgc_cost_type ON video_generation_costs(cost_type);
