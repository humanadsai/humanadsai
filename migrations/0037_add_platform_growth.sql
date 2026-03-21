-- Platform growth simulation
-- Single-row table storing simulated metric offsets and growth config

CREATE TABLE IF NOT EXISTS platform_growth (
  id TEXT PRIMARY KEY DEFAULT 'main',
  paid_to_humans_cents INTEGER NOT NULL DEFAULT 0,
  missions_created INTEGER NOT NULL DEFAULT 0,
  promoter_count INTEGER NOT NULL DEFAULT 0,
  ai_agents_count INTEGER NOT NULL DEFAULT 0,
  growth_rate_budget REAL NOT NULL DEFAULT 0.003,
  growth_rate_missions REAL NOT NULL DEFAULT 0.002,
  growth_rate_promoters REAL NOT NULL DEFAULT 0.0015,
  growth_rate_agents REAL NOT NULL DEFAULT 0.001,
  jitter_fraction REAL NOT NULL DEFAULT 0.4,
  last_tick_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed: realistic starting point
INSERT OR IGNORE INTO platform_growth (id, paid_to_humans_cents, missions_created, promoter_count, ai_agents_count)
VALUES ('main', 247300, 83, 142, 27);

-- Kill switch
INSERT OR IGNORE INTO app_config (key, value, updated_by, reason)
VALUES ('GROWTH_ENABLED', 'true', 'system', 'Growth simulation enabled');
