import type { Env } from '../../types';
import type { CrawlData, SiteType } from '../toa-audit/types';
import { crawlUrl, normalizeUrl, safeFetch, safeFetchText, isPrivateUrl, getOrigin, analyzeHtml } from '../toa-audit/crawler';
import { evaluateChecks, calculateScores } from '../toa-audit/scoring';
import { scorePriority, detectPageType, shouldSkipUrl, isSameDomain, extractDomain } from './priority';
import { aggregateMultiPageScores } from './aggregator';
import type { DiscoveredUrl, PageCrawlResult, SourceType } from './types';

// ============================================
// Constants
// ============================================

const MAX_TARGETS = 15;
const MAX_SITEMAP_URLS = 500;
const MAX_INTERNAL_LINKS = 100;
const BATCH_SIZE = 5;
const PAGE_FETCH_TIMEOUT = 8000;

/**
 * Extract <loc> URLs from sitemap XML text
 */
function parseSitemapUrls(xmlText: string): string[] {
  const urls: string[] = [];
  const locRegex = /<loc>\s*(.*?)\s*<\/loc>/gi;
  let match;
  while ((match = locRegex.exec(xmlText)) !== null && urls.length < MAX_SITEMAP_URLS) {
    const url = match[1].trim();
    if (url && /^https?:\/\//i.test(url)) urls.push(url);
  }
  return urls;
}

// ============================================
// Pipeline Entry Point
// ============================================

export async function runDiagnosisPipeline(
  env: Env,
  jobId: string,
  inputUrl: string,
  siteType: SiteType,
): Promise<void> {
  const startTime = Date.now();

  try {
    // ---- Phase 1: Discovery ----
    await updateJob(env, jobId, {
      status: 'discovering',
      current_step: 'discovery',
      started_at: new Date().toISOString(),
    });
    await emitEvent(env, jobId, 'discovery', 'Discovering target URLs...', 5);

    const normalizedUrl = normalizeUrl(inputUrl);
    const domain = extractDomain(normalizedUrl);

    // Crawl homepage (full crawl: robots, sitemap, llms, HTML)
    let homepageCrawl: CrawlData;
    try {
      homepageCrawl = await crawlUrl(normalizedUrl);
    } catch (err: any) {
      throw new Error(`Homepage crawl failed: ${err.message}`);
    }

    await emitEvent(env, jobId, 'discovery', 'Homepage analyzed. Parsing sitemap...', 15);

    // Discover URLs from multiple sources
    const discovered: Map<string, DiscoveredUrl> = new Map();
    const origin = getOrigin(normalizedUrl);

    // 1. Seed URL
    addDiscovered(discovered, normalizedUrl, 'seed', 0, domain);

    // 2. Sitemap URLs — fetch raw XML and parse <loc> entries
    if (homepageCrawl.sitemap.exists && homepageCrawl.sitemap.urlCount > 0) {
      try {
        const sitemapFetched = await safeFetchText(origin + '/sitemap.xml');
        if (sitemapFetched.status === 200) {
          const sitemapUrls = parseSitemapUrls(sitemapFetched.text);
          for (const url of sitemapUrls) {
            addDiscovered(discovered, url, 'sitemap', 1, domain);
          }
        }
      } catch {
        // Sitemap fetch failed, continue without
      }
    }

    // 3. Internal links from homepage HTML (content.links from crawler)
    const links = extractInternalLinks(homepageCrawl, normalizedUrl, domain);
    for (const link of links.slice(0, MAX_INTERNAL_LINKS)) {
      addDiscovered(discovered, link.url, link.sourceType, 1, domain);
    }

    await emitEvent(env, jobId, 'discovery', `Found ${discovered.size} candidate URLs`, 25);

    // ---- Phase 2: Priority & Selection ----
    const allTargets = Array.from(discovered.values())
      .sort((a, b) => b.priorityScore - a.priorityScore);

    const selectedTargets = allTargets.slice(0, MAX_TARGETS);
    const skippedTargets = allTargets.slice(MAX_TARGETS);

    // Save all targets to DB
    await saveTargets(env, jobId, selectedTargets, true);
    if (skippedTargets.length > 0) {
      await saveTargets(env, jobId, skippedTargets, false, 'low_priority');
    }

    await updateJob(env, jobId, {
      discovered_count: allTargets.length,
      total_count: selectedTargets.length,
      progress_percent: 30,
    });

    await emitEvent(env, jobId, 'selection', `Selected top ${selectedTargets.length} URLs for diagnosis`, 30);

    // ---- Phase 3: Batch Crawl ----
    await updateJob(env, jobId, { status: 'crawling', current_step: 'crawling' });

    const pageResults: PageCrawlResult[] = [];
    const targetIds = await getTargetIds(env, jobId);

    for (let i = 0; i < selectedTargets.length; i += BATCH_SIZE) {
      const batch = selectedTargets.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(selectedTargets.length / BATCH_SIZE);

      await emitEvent(
        env, jobId, 'crawling',
        `Crawling batch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, selectedTargets.length)} of ${selectedTargets.length})`,
        30 + Math.round((i / selectedTargets.length) * 50),
      );

      const batchResults = await Promise.allSettled(
        batch.map(async (target, idx) => {
          const targetId = targetIds.get(target.normalizedUrl) || 0;
          return crawlSinglePage(target, homepageCrawl, siteType, targetId);
        }),
      );

      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          pageResults.push(result.value);
        }
      }

      // Update processed count
      const processed = Math.min(i + BATCH_SIZE, selectedTargets.length);
      await updateJob(env, jobId, { processed_count: processed });
    }

    // Save page results
    await savePageResults(env, jobId, pageResults);

    await emitEvent(env, jobId, 'crawling', `Crawled ${pageResults.length} pages`, 80);

    // ---- Phase 4: Scoring & Aggregation ----
    await updateJob(env, jobId, { status: 'scoring', current_step: 'scoring', progress_percent: 85 });
    await emitEvent(env, jobId, 'scoring', 'Calculating aggregate scores...', 85);

    const aggregated = aggregateMultiPageScores(homepageCrawl, pageResults, siteType);

    // ---- Phase 5: Save Final Results ----
    await emitEvent(env, jobId, 'saving', 'Saving results...', 95);

    const duration = Date.now() - startTime;
    await updateJob(env, jobId, {
      status: 'completed',
      current_step: 'completed',
      progress_percent: 100,
      search_score: aggregated.scores.searchScore,
      toa_score: aggregated.scores.toaScore,
      overall_score: aggregated.scores.overall,
      grade: aggregated.scores.grade,
      has_blocker: aggregated.scores.hasBlockerUnchecked ? 1 : 0,
      summary: aggregated.summary,
      scores_json: JSON.stringify(aggregated.scores),
      top_actions_json: JSON.stringify(aggregated.topActions),
      auto_results_json: JSON.stringify(aggregated.autoResults),
      duration_ms: duration,
      finished_at: new Date().toISOString(),
    });

    await emitEvent(env, jobId, 'completed', 'Diagnosis complete', 100);

  } catch (err: any) {
    console.error(`[Diagnosis] Pipeline error for job ${jobId}: ${err.message}`);
    await updateJob(env, jobId, {
      status: 'failed',
      current_step: 'failed',
      error_message: err.message || 'Unknown error',
      finished_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
    });
    await emitEvent(env, jobId, 'failed', `Error: ${err.message}`, 0);
  }
}

// ============================================
// Single Page Crawl
// ============================================

async function crawlSinglePage(
  target: DiscoveredUrl,
  homepageCrawl: CrawlData,
  siteType: SiteType,
  targetId: number,
): Promise<PageCrawlResult | null> {
  try {
    if (isPrivateUrl(target.url)) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PAGE_FETCH_TIMEOUT);
    let resp: Response;
    try {
      resp = await safeFetch(target.url);
    } finally {
      clearTimeout(timeoutId);
    }

    const statusCode = resp.status;
    if (statusCode >= 400) {
      return {
        targetId,
        url: target.url,
        pageType: target.pageType,
        statusCode,
        canonicalUrl: null,
        title: null,
        hasBloker: false,
        searchScore: 0,
        toaScore: 0,
        overallScore: 0,
        autoResults: [],
        signalsJson: JSON.stringify({ statusCode }),
      };
    }

    // Analyze HTML via HTMLRewriter
    const htmlAnalysis = await analyzeHtml(resp, target.url);

    // Build CrawlData for this page (flat structure matching types)
    const pageCrawl: CrawlData = {
      url: target.url,
      normalizedUrl: target.normalizedUrl,
      robots: homepageCrawl.robots,
      llmsTxt: homepageCrawl.llmsTxt,
      sitemap: homepageCrawl.sitemap,
      schema: htmlAnalysis.schema,
      semantic: htmlAnalysis.semantic,
      headings: htmlAnalysis.headings,
      ogp: htmlAnalysis.ogp,
      meta: htmlAnalysis.meta,
      images: htmlAnalysis.images,
      content: htmlAnalysis.content,
      http: {
        statusCode,
        redirectChain: 0,
        isHttps: target.url.startsWith('https'),
        headers: {},
        ttfbMs: 0,
      },
      paths: homepageCrawl.paths,
      errors: [],
      crawledAt: new Date().toISOString(),
    };

    const autoResults = evaluateChecks(pageCrawl, siteType);
    const scores = calculateScores(autoResults);

    return {
      targetId,
      url: target.url,
      pageType: target.pageType,
      statusCode,
      canonicalUrl: htmlAnalysis.meta.canonical || null,
      title: htmlAnalysis.meta.title || null,
      hasBloker: scores.hasBlockerUnchecked,
      searchScore: scores.searchScore,
      toaScore: scores.toaScore,
      overallScore: scores.overall,
      autoResults,
      signalsJson: JSON.stringify({
        statusCode,
        canonical: htmlAnalysis.meta.canonical,
        title: htmlAnalysis.meta.title,
        schemaTypes: htmlAnalysis.schema.types,
        hasOgp: !!htmlAnalysis.ogp.title,
        headingCount: htmlAnalysis.headings.length,
        imageCount: htmlAnalysis.images.total,
        altCoverage: htmlAnalysis.images.total > 0 ? Math.round((htmlAnalysis.images.withAlt / htmlAnalysis.images.total) * 100) : 100,
      }),
    };
  } catch (err: any) {
    console.error(`[Diagnosis] Page crawl error for ${target.url}: ${err.message}`);
    return null;
  }
}

// ============================================
// URL Discovery Helpers
// ============================================

function addDiscovered(
  map: Map<string, DiscoveredUrl>,
  url: string,
  sourceType: SourceType,
  depth: number,
  baseDomain: string,
): void {
  const skipReason = shouldSkipUrl(url);
  if (skipReason) return;

  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeUrl(url);
  } catch {
    return;
  }

  if (!isSameDomain(normalizedUrl, baseDomain)) return;

  // Dedupe by normalized URL
  if (map.has(normalizedUrl)) {
    const existing = map.get(normalizedUrl)!;
    // Keep higher priority source
    const newPriority = scorePriority(normalizedUrl, sourceType, depth);
    if (newPriority > existing.priorityScore) {
      existing.sourceType = sourceType;
      existing.priorityScore = newPriority;
      existing.depth = Math.min(existing.depth, depth);
    }
    return;
  }

  const pageType = detectPageType(normalizedUrl);
  const priorityScore = scorePriority(normalizedUrl, sourceType, depth);

  map.set(normalizedUrl, {
    url: normalizedUrl,
    normalizedUrl,
    sourceType,
    depth,
    pageType,
    priorityScore,
  });
}

interface LinkInfo {
  url: string;
  sourceType: SourceType;
}

function extractInternalLinks(
  crawlData: CrawlData,
  pageUrl: string,
  baseDomain: string,
): LinkInfo[] {
  const links: LinkInfo[] = [];
  if (!crawlData.links) return links;

  for (const link of crawlData.links) {
    try {
      const absoluteUrl = new URL(link.href, pageUrl).href;
      if (!isSameDomain(absoluteUrl, baseDomain)) continue;
      if (shouldSkipUrl(absoluteUrl)) continue;

      // Infer source type from link context (simple heuristic)
      let sourceType: SourceType = 'internal_link';
      // Links in common nav patterns are likely nav links
      // This is a simple heuristic; the crawler doesn't distinguish nav/footer/etc.
      links.push({ url: absoluteUrl, sourceType });
    } catch {
      // Invalid URL, skip
    }
  }

  return links;
}

// ============================================
// Database Helpers
// ============================================

async function updateJob(
  env: Env,
  jobId: string,
  updates: Record<string, string | number | null>,
): Promise<void> {
  const keys = Object.keys(updates);
  const sets = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => updates[k]);

  try {
    await env.DB.prepare(`UPDATE diagnosis_jobs SET ${sets} WHERE id = ?`)
      .bind(...values, jobId)
      .run();
  } catch (err: any) {
    console.error(`[Diagnosis] Failed to update job ${jobId}: ${err.message}`);
  }
}

async function emitEvent(
  env: Env,
  jobId: string,
  step: string,
  message: string,
  progress: number,
): Promise<void> {
  try {
    await env.DB.prepare(
      `INSERT INTO diagnosis_events (job_id, step, message, progress) VALUES (?, ?, ?, ?)`,
    ).bind(jobId, step, message, progress).run();
  } catch (err: any) {
    console.error(`[Diagnosis] Failed to emit event for job ${jobId}: ${err.message}`);
  }
}

async function saveTargets(
  env: Env,
  jobId: string,
  targets: DiscoveredUrl[],
  included: boolean,
  skipReason?: string,
): Promise<void> {
  // Batch insert (D1 supports multiple bind calls via batch)
  const stmts = targets.map(t =>
    env.DB.prepare(
      `INSERT INTO diagnosis_targets (job_id, url, normalized_url, source_type, priority_score, depth, included, skip_reason, page_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      jobId, t.url, t.normalizedUrl, t.sourceType,
      t.priorityScore, t.depth,
      included ? 1 : 0, skipReason || null, t.pageType,
    ),
  );

  try {
    // D1 batch (max ~100 statements per batch)
    for (let i = 0; i < stmts.length; i += 50) {
      await env.DB.batch(stmts.slice(i, i + 50));
    }
  } catch (err: any) {
    console.error(`[Diagnosis] Failed to save targets for job ${jobId}: ${err.message}`);
  }
}

async function getTargetIds(
  env: Env,
  jobId: string,
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    const rows = await env.DB.prepare(
      `SELECT id, normalized_url FROM diagnosis_targets WHERE job_id = ? AND included = 1`,
    ).bind(jobId).all<{ id: number; normalized_url: string }>();

    for (const row of rows.results) {
      map.set(row.normalized_url, row.id);
    }
  } catch {
    // Non-fatal
  }
  return map;
}

async function savePageResults(
  env: Env,
  jobId: string,
  results: PageCrawlResult[],
): Promise<void> {
  const stmts = results.map(r =>
    env.DB.prepare(
      `INSERT INTO diagnosis_page_results
       (job_id, target_id, url, page_type, status_code, canonical_url, title,
        has_blocker, page_search_score, page_toa_score, page_overall_score,
        auto_results_json, signals_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      jobId, r.targetId, r.url, r.pageType, r.statusCode,
      r.canonicalUrl, r.title,
      r.hasBloker ? 1 : 0, r.searchScore, r.toaScore, r.overallScore,
      JSON.stringify(r.autoResults), r.signalsJson,
    ),
  );

  try {
    for (let i = 0; i < stmts.length; i += 50) {
      await env.DB.batch(stmts.slice(i, i + 50));
    }
  } catch (err: any) {
    console.error(`[Diagnosis] Failed to save page results for job ${jobId}: ${err.message}`);
  }
}
