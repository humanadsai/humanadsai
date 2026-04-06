-- Diagnosis jobs: main record per diagnosis run
CREATE TABLE IF NOT EXISTS diagnosis_jobs (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  input_url TEXT NOT NULL,
  normalized_domain TEXT NOT NULL,
  site_type TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'pending',
  current_step TEXT,
  progress_percent INTEGER DEFAULT 0,
  discovered_count INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  search_score INTEGER,
  toa_score INTEGER,
  overall_score INTEGER,
  grade TEXT,
  has_blocker INTEGER DEFAULT 0,
  summary TEXT,
  scores_json TEXT,
  top_actions_json TEXT,
  auto_results_json TEXT,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  started_at TEXT,
  finished_at TEXT,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_diagnosis_jobs_owner ON diagnosis_jobs(owner_id, deleted_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnosis_jobs_status ON diagnosis_jobs(status);

-- Diagnosis targets: discovered URLs for crawling
CREATE TABLE IF NOT EXISTS diagnosis_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  source_type TEXT NOT NULL,
  priority_score REAL DEFAULT 0,
  depth INTEGER DEFAULT 0,
  included INTEGER DEFAULT 1,
  skip_reason TEXT,
  page_type TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_diagnosis_targets_job ON diagnosis_targets(job_id);

-- Diagnosis page results: per-page crawl and scoring
CREATE TABLE IF NOT EXISTS diagnosis_page_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  target_id INTEGER,
  url TEXT NOT NULL,
  page_type TEXT,
  status_code INTEGER,
  canonical_url TEXT,
  title TEXT,
  has_blocker INTEGER DEFAULT 0,
  page_search_score INTEGER,
  page_toa_score INTEGER,
  page_overall_score INTEGER,
  auto_results_json TEXT,
  signals_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_diagnosis_page_results_job ON diagnosis_page_results(job_id);

-- Diagnosis events: progress log for polling
CREATE TABLE IF NOT EXISTS diagnosis_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  step TEXT NOT NULL,
  message TEXT,
  progress INTEGER DEFAULT 0,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_diagnosis_events_job ON diagnosis_events(job_id, created_at);
