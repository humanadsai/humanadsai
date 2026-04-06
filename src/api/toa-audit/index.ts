// ============================================
// toA Audit API — POST /api/toa-audit, GET /api/toa-audit/:id
// ============================================

import type { Env } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { checkRateLimit } from '../../middleware/rate-limit';
import { crawlUrl } from '../../services/toa-audit/crawler';
import {
  evaluateChecks,
  calculateScores,
  generateSummary,
  getTopActions,
  getManualChecks,
} from '../../services/toa-audit/scoring';
import type { SiteType, AuditResult } from '../../services/toa-audit/types';

function generateAuditId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  for (const b of bytes) {
    id += chars[b % chars.length];
  }
  return id;
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

  // Rate limit: 5/hour per IP
  const rateResult = await checkRateLimit(env, ip, 'toa-audit');
  if (!rateResult.allowed) {
    return errors.rateLimited(requestId, rateResult.retryAfter);
  }

  // Parse body
  let body: { url?: string; siteType?: string };
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON body');
  }

  const url = body.url?.trim();
  if (!url) {
    return errors.badRequest(requestId, 'URL is required');
  }

  // Basic URL validation
  let normalizedUrl: string;
  try {
    const testUrl = url.startsWith('http') ? url : 'https://' + url;
    const parsed = new URL(testUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return errors.badRequest(requestId, 'Only http/https URLs are supported');
    }
    normalizedUrl = parsed.origin + parsed.pathname.replace(/\/+$/, '') || parsed.origin;
  } catch {
    return errors.badRequest(requestId, 'Invalid URL format');
  }

  // SSRF check
  try {
    const parsed = new URL(normalizedUrl);
    const host = parsed.hostname;
    if (/^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|0\.|localhost)/i.test(host) ||
        /^(fc00:|fe80:|::1$)/i.test(host)) {
      return errors.badRequest(requestId, 'Internal/private URLs are not allowed');
    }
  } catch {
    return errors.badRequest(requestId, 'Invalid URL');
  }

  const siteType = (body.siteType && VALID_SITE_TYPES.includes(body.siteType as SiteType))
    ? body.siteType as SiteType
    : 'all';

  // Check for cached recent result (< 1 hour)
  try {
    const cached = await env.DB.prepare(
      "SELECT id, auto_results, scores, grade, has_blocker, summary, top_actions, duration_ms, created_at, completed_at FROM toa_audits WHERE url = ? AND status = 'completed' AND created_at > datetime('now', '-1 hour') ORDER BY created_at DESC LIMIT 1"
    ).bind(normalizedUrl).first<any>();

    if (cached) {
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

  // Run crawl + scoring
  const startTime = Date.now();
  const auditId = generateAuditId();

  try {
    const crawlData = await crawlUrl(url);
    const autoResults = evaluateChecks(crawlData, siteType);
    const scores = calculateScores(autoResults);
    const summary = generateSummary(scores);
    const topActions = getTopActions(autoResults);
    const manualChecks = getManualChecks(siteType);
    const durationMs = Date.now() - startTime;

    // Save to D1
    try {
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

    // Save failure
    try {
      await env.DB.prepare(
        `INSERT INTO toa_audits (id, url, site_type, status, error_message, duration_ms, ip_hash)
         VALUES (?, ?, ?, 'failed', ?, ?, ?)`
      ).bind(auditId, normalizedUrl, siteType, e.message || 'Unknown error', Date.now() - startTime, await hashIp(ip)).run();
    } catch { /* ignore */ }

    return errors.internalError(requestId);
  }
}

// ============================================
// GET /api/toa-audit/:id
// ============================================

export async function handleToaAuditGet(request: Request, env: Env, auditId: string): Promise<Response> {
  const requestId = generateRequestId();

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
