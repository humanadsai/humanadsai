// ============================================
// toA Audit API — POST /api/toa-audit, GET /api/toa-audit/:id
// ============================================

import type { Env } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { checkRateLimit } from '../../middleware/rate-limit';
import { crawlUrl, normalizeUrl, setSelfHandler } from '../../services/toa-audit/crawler';
import { handleRequest } from '../../router';
import {
  evaluateChecks,
  calculateScores,
  generateSummary,
  getTopActions,
  getManualChecks,
} from '../../services/toa-audit/scoring';
import type { SiteType, AuditResult } from '../../services/toa-audit/types';

function generateAuditId(url: string): string {
  try {
    const parsed = new URL(url);
    // e.g. "www.example.com" → "example-com", "sub.example.co.jp" → "sub-example-co-jp"
    let host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    // Replace dots with hyphens, strip non-alphanumeric except hyphens
    let slug = host.replace(/\./g, '-').replace(/[^a-z0-9-]/g, '');
    // Trim leading/trailing hyphens and collapse multiples
    slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
    // Truncate to 40 chars to keep URLs reasonable
    if (slug.length > 40) slug = slug.slice(0, 40).replace(/-$/, '');
    // Append short random suffix for uniqueness
    const bytes = new Uint8Array(3);
    crypto.getRandomValues(bytes);
    const suffix = Array.from(bytes).map(b => (b % 36).toString(36)).join('');
    return slug ? `${slug}-${suffix}` : suffix;
  } catch {
    // Fallback to random ID
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    for (const b of bytes) id += chars[b % chars.length];
    return id;
  }
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + ':toa-audit-salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

const VALID_SITE_TYPES: SiteType[] = ['all', 'media', 'saas', 'ec', 'marketplace', 'api_product', 'docs'];

// ============================================
// POST /api/toa-audit
// ============================================

export async function handleToaAuditCreate(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Origin validation — block cross-origin POST (CSRF prevention)
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');
  const requestUrl = new URL(request.url);
  const allowedOrigins = [requestUrl.origin, 'https://humanadsai.com'];
  if (origin && !allowedOrigins.includes(origin)) {
    return errors.forbidden(requestId, 'Cross-origin requests are not allowed');
  }
  if (!origin && referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (!allowedOrigins.includes(refOrigin)) {
        return errors.forbidden(requestId, 'Cross-origin requests are not allowed');
      }
    } catch { /* malformed referer, allow (some clients omit it) */ }
  }

  // Rate limit: 5/hour per IP
  const rateResult = await checkRateLimit(env, ip, 'toa-audit');
  if (!rateResult.allowed) {
    return errors.rateLimited(requestId, rateResult.retryAfter);
  }

  // Parse body
  let body: { url?: string; siteType?: string; rescan?: boolean };
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON body');
  }

  const url = body.url?.trim();
  const forceRescan = !!body.rescan;
  if (!url) {
    return errors.badRequest(requestId, 'URL is required');
  }

  // URL length limit (DoS prevention)
  if (url.length > 2048) {
    return errors.badRequest(requestId, 'URL too long (max 2048 characters)');
  }

  // Unified URL normalization (same function used by crawler for cache consistency)
  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeUrl(url);
    const parsed = new URL(normalizedUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return errors.badRequest(requestId, 'Only http/https URLs are supported');
    }
    // SSRF check at API level (crawler has its own deeper check)
    const host = parsed.hostname.toLowerCase();
    if (/^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|0\.|localhost$)/i.test(host) ||
        /^(fc00:|fe80:|fd[0-9a-f]{2}:|::1$|::$|::ffff:)/i.test(host) ||
        host.endsWith('.internal') || host.endsWith('.local') || host.endsWith('.localhost') ||
        (parsed.port && parsed.port !== '80' && parsed.port !== '443')) {
      return errors.badRequest(requestId, 'Internal/private URLs are not allowed');
    }
  } catch {
    return errors.badRequest(requestId, 'Invalid URL format');
  }

  const siteType = (body.siteType && VALID_SITE_TYPES.includes(body.siteType as SiteType))
    ? body.siteType as SiteType
    : 'all';

  // Check for cached recent result (< 1 hour), skip if rescan requested
  if (!forceRescan) try {
    const cached = await env.DB.prepare(
      "SELECT id, auto_results, scores, grade, has_blocker, summary, top_actions, duration_ms, created_at, completed_at FROM toa_audits WHERE url = ? AND status = 'completed' AND created_at > datetime('now', '-1 hour') ORDER BY created_at DESC LIMIT 1"
    ).bind(normalizedUrl).first<any>();

    if (cached && !['F', 'D'].includes(cached.grade)) {
      // Skip cached F/D-grade results (likely from self-fetch 522 errors)
      const scores = JSON.parse(cached.scores);
      const autoResults = JSON.parse(cached.auto_results);
      const topActions = JSON.parse(cached.top_actions || '[]');
      const manualChecks = getManualChecks(siteType);

      return success({
        id: cached.id,
        url: normalizedUrl,
        siteType,
        status: 'completed',
        scores,
        autoResults,
        manualChecks,
        summary: cached.summary,
        topActions,
        createdAt: cached.created_at,
        completedAt: cached.completed_at,
        durationMs: cached.duration_ms,
        cached: true,
        permalink: `/toa-audit/${cached.id}`,
      } as AuditResult & { cached: boolean; permalink: string }, requestId);
    }
  } catch (e) {
    // Table might not exist yet, continue
    console.error('Cache check failed:', e);
  }

  // Check for existing result to update (preserves permalink across re-diagnoses)
  let existingId: string | null = null;
  try {
    const existing = await env.DB.prepare(
      "SELECT id FROM toa_audits WHERE url = ? AND status = 'completed' AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1"
    ).bind(normalizedUrl).first<{ id: string }>();
    // Only reuse if it's already a domain-based slug (contains hyphen)
    if (existing && existing.id.includes('-')) existingId = existing.id;
  } catch { /* ignore */ }

  // Run crawl + scoring
  const startTime = Date.now();
  const auditId = existingId || generateAuditId(normalizedUrl);

  // Set up self-handler so the crawler can fetch our own pages internally
  const selfOrigin = new URL(request.url).origin;
  setSelfHandler(selfOrigin, async (req: Request) => {
    return handleRequest(req, env);
  });

  try {
    const crawlData = await crawlUrl(url);
    const autoResults = evaluateChecks(crawlData, siteType);
    const scores = calculateScores(autoResults);
    const summary = generateSummary(scores);
    const topActions = getTopActions(autoResults);
    const manualChecks = getManualChecks(siteType);
    const durationMs = Date.now() - startTime;

    // Save to D1 — UPDATE existing record or INSERT new one
    try {
      if (existingId) {
        await env.DB.prepare(
          `UPDATE toa_audits SET site_type = ?, auto_results = ?, scores = ?, grade = ?, has_blocker = ?, summary = ?, top_actions = ?, duration_ms = ?, ip_hash = ?, completed_at = datetime('now'), expires_at = datetime('now', '+30 days') WHERE id = ?`
        ).bind(
          siteType,
          JSON.stringify(autoResults),
          JSON.stringify(scores),
          scores.grade,
          scores.hasBlockerUnchecked ? 1 : 0,
          summary,
          JSON.stringify(topActions),
          durationMs,
          await hashIp(ip),
          existingId,
        ).run();
      } else {
        await env.DB.prepare(
          `INSERT INTO toa_audits (id, url, site_type, status, auto_results, scores, grade, has_blocker, summary, top_actions, duration_ms, ip_hash, completed_at, expires_at)
           VALUES (?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now', '+30 days'))`
        ).bind(
          auditId,
          normalizedUrl,
          siteType,
          JSON.stringify(autoResults),
          JSON.stringify(scores),
          scores.grade,
          scores.hasBlockerUnchecked ? 1 : 0,
          summary,
          JSON.stringify(topActions),
          durationMs,
          await hashIp(ip),
        ).run();
      }
    } catch (e) {
      console.error('Failed to save audit:', e);
      // Non-fatal: return results even if save fails
    }

    return success({
      id: auditId,
      url: normalizedUrl,
      siteType,
      status: 'completed',
      scores,
      autoResults,
      manualChecks,
      summary,
      topActions,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs,
      permalink: `/toa-audit/${auditId}`,
    }, requestId);
  } catch (e: any) {
    console.error('Audit failed:', e);

    // Sanitize error message — never expose internal details to client or DB
    const rawMsg = String(e.message || '');
    let safeMsg = 'Internal processing error';
    if (rawMsg.includes('SSRF')) safeMsg = 'URL blocked by security policy';
    else if (rawMsg.includes('Too many redirects')) safeMsg = 'Too many redirects';
    else if (rawMsg.includes('aborted') || rawMsg.includes('timeout')) safeMsg = 'Target site did not respond in time';
    else if (rawMsg.includes('too large')) safeMsg = 'Target page too large to analyze';

    // Save failure (with sanitized message only)
    try {
      if (existingId) {
        // Update existing record to failed status
        await env.DB.prepare(
          `UPDATE toa_audits SET status = 'failed', error_message = ?, duration_ms = ?, ip_hash = ? WHERE id = ?`
        ).bind(safeMsg, Date.now() - startTime, await hashIp(ip), existingId).run();
      } else {
        await env.DB.prepare(
          `INSERT INTO toa_audits (id, url, site_type, status, error_message, duration_ms, ip_hash)
           VALUES (?, ?, ?, 'failed', ?, ?, ?)`
        ).bind(auditId, normalizedUrl, siteType, safeMsg, Date.now() - startTime, await hashIp(ip)).run();
      }
    } catch { /* ignore */ }

    return errors.internalError(requestId);
  }
}

// ============================================
// GET /api/toa-audit/:id
// ============================================

export async function handleToaAuditGet(request: Request, env: Env, auditId: string): Promise<Response> {
  const requestId = generateRequestId();

  // Defensive validation (router regex should already constrain this)
  if (!/^[a-z0-9][a-z0-9-]{2,50}[a-z0-9]$/.test(auditId) && !/^[a-z0-9]{6,20}$/.test(auditId)) {
    return errors.badRequest(requestId, 'Invalid audit ID');
  }

  try {
    const row = await env.DB.prepare(
      "SELECT * FROM toa_audits WHERE id = ? AND expires_at > datetime('now')"
    ).bind(auditId).first<any>();

    if (!row) {
      return errors.notFound(requestId, 'Audit result');
    }

    if (row.status === 'failed') {
      return success({
        id: row.id,
        url: row.url,
        siteType: row.site_type,
        status: 'failed',
        error: row.error_message,
        createdAt: row.created_at,
      }, requestId);
    }

    const scores = JSON.parse(row.scores || '{}');
    const autoResults = JSON.parse(row.auto_results || '[]');
    const topActions = JSON.parse(row.top_actions || '[]');
    const manualChecks = getManualChecks(row.site_type || 'all');

    return success({
      id: row.id,
      url: row.url,
      siteType: row.site_type,
      status: row.status,
      scores,
      autoResults,
      manualChecks,
      summary: row.summary,
      topActions,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      durationMs: row.duration_ms,
      permalink: `/toa-audit/${row.id}`,
    }, requestId);
  } catch (e) {
    console.error('Get audit failed:', e);
    return errors.internalError(requestId);
  }
}
