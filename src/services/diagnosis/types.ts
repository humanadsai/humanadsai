import type { SiteType, AutoCheckResult } from '../toa-audit/types';

// ============================================
// Source & Page Types
// ============================================

export type SourceType =
  | 'seed'
  | 'sitemap'
  | 'internal_link'
  | 'nav'
  | 'footer'
  | 'breadcrumb'
  | 'cta'
  | 'robots_sitemap';

export type PageType =
  | 'homepage'
  | 'pricing'
  | 'docs'
  | 'about'
  | 'faq'
  | 'blog'
  | 'product'
  | 'login'
  | 'contact'
  | 'other';

export type DiagnosisStatus =
  | 'pending'
  | 'discovering'
  | 'crawling'
  | 'scoring'
  | 'completed'
  | 'failed';

// ============================================
// Database Row Types
// ============================================

export interface DiagnosisJob {
  id: string;
  owner_id: string;
  input_url: string;
  normalized_domain: string;
  site_type: SiteType;
  status: DiagnosisStatus;
  current_step: string | null;
  progress_percent: number;
  discovered_count: number;
  processed_count: number;
  total_count: number;
  search_score: number | null;
  toa_score: number | null;
  overall_score: number | null;
  grade: string | null;
  has_blocker: number;
  summary: string | null;
  scores_json: string | null;
  top_actions_json: string | null;
  auto_results_json: string | null;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  deleted_at: string | null;
}

export interface DiagnosisTarget {
  id: number;
  job_id: string;
  url: string;
  normalized_url: string;
  source_type: SourceType;
  priority_score: number;
  depth: number;
  included: number;
  skip_reason: string | null;
  page_type: string | null;
  created_at: string;
}

export interface DiagnosisPageResult {
  id: number;
  job_id: string;
  target_id: number | null;
  url: string;
  page_type: string | null;
  status_code: number | null;
  canonical_url: string | null;
  title: string | null;
  has_blocker: number;
  page_search_score: number | null;
  page_toa_score: number | null;
  page_overall_score: number | null;
  auto_results_json: string | null;
  signals_json: string | null;
  created_at: string;
}

export interface DiagnosisEvent {
  id: number;
  job_id: string;
  step: string;
  message: string | null;
  progress: number;
  detail: string | null;
  created_at: string;
}

// ============================================
// API Response Types
// ============================================

export interface DiagnosisStatusResponse {
  status: DiagnosisStatus;
  progress_percent: number;
  current_step: string | null;
  discovered_count: number;
  processed_count: number;
  total_count: number;
  events: DiagnosisEvent[];
}

export interface DiagnosisResultResponse {
  id: string;
  input_url: string;
  normalized_domain: string;
  site_type: SiteType;
  status: DiagnosisStatus;
  scores: {
    searchScore: number;
    toaScore: number;
    overall: number;
    grade: string;
    hasBlocker: boolean;
    ai_discovery?: number;
    ai_comprehension?: number;
    agent_transaction?: number;
    toa_infra?: number;
  } | null;
  summary: string | null;
  topActions: AutoCheckResult[] | null;
  autoResults: AutoCheckResult[] | null;
  targets: DiagnosisTarget[];
  pageResults: DiagnosisPageResult[];
  durationMs: number | null;
  createdAt: string;
  finishedAt: string | null;
}

export interface DiagnosisHistoryItem {
  id: string;
  input_url: string;
  normalized_domain: string;
  status: DiagnosisStatus;
  overall_score: number | null;
  search_score: number | null;
  toa_score: number | null;
  grade: string | null;
  created_at: string;
  finished_at: string | null;
}

// ============================================
// Pipeline Internal Types
// ============================================

export interface DiscoveredUrl {
  url: string;
  normalizedUrl: string;
  sourceType: SourceType;
  depth: number;
  pageType: PageType;
  priorityScore: number;
}

export interface PageCrawlResult {
  targetId: number;
  url: string;
  pageType: PageType;
  statusCode: number | null;
  canonicalUrl: string | null;
  title: string | null;
  hasBloker: boolean;
  searchScore: number;
  toaScore: number;
  overallScore: number;
  autoResults: AutoCheckResult[];
  signalsJson: string;
}
