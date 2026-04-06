import type { CrawlData, SiteType, AutoCheckResult, Scores } from '../toa-audit/types';
import { evaluateChecks, calculateScores, generateSummary, getTopActions } from '../toa-audit/scoring';
import type { PageType, PageCrawlResult } from './types';

// ============================================
// Page Type Weights for Aggregation
// ============================================

const PAGE_WEIGHTS: Record<PageType, number> = {
  homepage: 3.0,
  pricing: 2.0,
  docs: 2.0,
  about: 1.5,
  faq: 1.5,
  contact: 1.0,
  product: 1.5,
  login: 1.0,
  blog: 0.5,
  other: 1.0,
};

// ============================================
// Aggregation Result
// ============================================

export interface AggregatedResult {
  scores: Scores;
  summary: string;
  topActions: AutoCheckResult[];
  autoResults: AutoCheckResult[];
}

/**
 * Evaluate a single page's crawl data and produce scores.
 * Site-wide signals (robots, sitemap, llms) come from the homepage crawl.
 */
export function evaluatePage(
  pageCrawlData: CrawlData,
  homepageCrawlData: CrawlData,
  siteType: SiteType,
): { autoResults: AutoCheckResult[]; scores: Scores } {
  // Merge site-wide data from homepage into page data
  const merged: CrawlData = {
    ...pageCrawlData,
    robots: homepageCrawlData.robots,
    llmsTxt: homepageCrawlData.llmsTxt,
    sitemap: homepageCrawlData.sitemap,
    paths: homepageCrawlData.paths,
  };

  const autoResults = evaluateChecks(merged, siteType);
  const scores = calculateScores(autoResults);
  return { autoResults, scores };
}

/**
 * Aggregate scores from multiple pages using weighted average.
 */
export function aggregateMultiPageScores(
  homepageCrawlData: CrawlData,
  pageResults: PageCrawlResult[],
  siteType: SiteType,
): AggregatedResult {
  if (pageResults.length === 0) {
    // Fallback: just use homepage
    const autoResults = evaluateChecks(homepageCrawlData, siteType);
    const scores = calculateScores(autoResults);
    return {
      scores,
      summary: generateSummary(scores),
      topActions: getTopActions(autoResults),
      autoResults,
    };
  }

  // Weighted average across all pages
  let totalWeight = 0;
  let wDiscovery = 0;
  let wComprehension = 0;
  let wTransaction = 0;
  let wInfra = 0;
  let hasBlocker = false;

  // Collect all auto results for top actions (homepage-weighted)
  const allAutoResults: AutoCheckResult[] = [];
  let homepageAutoResults: AutoCheckResult[] = [];

  for (const page of pageResults) {
    const pageType = (page.pageType || 'other') as PageType;
    const weight = PAGE_WEIGHTS[pageType] || 1.0;
    totalWeight += weight;

    wDiscovery += (page.searchScore || 0) * weight;
    wComprehension += (page.searchScore || 0) * weight; // searchScore combines both
    wTransaction += (page.toaScore || 0) * weight;
    wInfra += (page.toaScore || 0) * weight;

    if (page.hasBloker) hasBlocker = true;

    if (pageType === 'homepage') {
      homepageAutoResults = page.autoResults;
    }
  }

  // Use homepage auto results as the base (site-wide checks live there)
  const baseAutoResults = homepageAutoResults.length > 0
    ? homepageAutoResults
    : evaluateChecks(homepageCrawlData, siteType);

  // Calculate weighted averages
  const avgSearch = totalWeight > 0 ? Math.round(wDiscovery / totalWeight) : 0;
  const avgToa = totalWeight > 0 ? Math.round(wTransaction / totalWeight) : 0;
  const overall = Math.round((avgSearch + avgToa) / 2);

  // Grade
  let grade: string;
  if (overall >= 95) grade = 'A+';
  else if (overall >= 85) grade = 'A';
  else if (overall >= 75) grade = 'B+';
  else if (overall >= 60) grade = 'B';
  else if (overall >= 40) grade = 'C';
  else if (overall >= 20) grade = 'D';
  else grade = 'F';

  if (hasBlocker && ['A+', 'A'].includes(grade)) {
    grade = 'B+';
  }

  const scores: Scores = {
    ai_discovery: avgSearch,
    ai_comprehension: avgSearch,
    agent_transaction: avgToa,
    toa_infra: avgToa,
    searchScore: avgSearch,
    toaScore: avgToa,
    overall,
    grade,
    hasBlockerUnchecked: hasBlocker,
  };

  const summary = generateSummary(scores);
  const topActions = getTopActions(baseAutoResults);

  return {
    scores,
    summary,
    topActions,
    autoResults: baseAutoResults,
  };
}
