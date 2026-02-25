-- Persistent knowhow rules accumulated from PDCA evaluation cycles.
-- Single global row, updated by LLM after each evaluation.
CREATE TABLE IF NOT EXISTS video_knowhow (
  id TEXT PRIMARY KEY DEFAULT 'global',
  rules_text TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 0,
  eval_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
