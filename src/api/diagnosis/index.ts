// ============================================
// Diagnosis API — Multi-URL diagnosis with Turnstile + admin auth
// ============================================

import type { Env } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { requireAdmin } from '../../middleware/admin';
import { checkRateLimit } from '../../middleware/rate-limit';
import { verifyTurnstile } from '../../services/turnstile';
import { normalizeUrl, isPrivateUrl } from '../../services/toa-audit/crawler';
import { runDiagnosisPipeline } from '../../services/diagnosis/pipeline';
import { extractDomain } from '../../services/diagnosis/priority';
import { getExecCtx } from '../../router';
import type { SiteType } from '../../services/toa-audit/types';
import type {
  DiagnosisJob,
  DiagnosisTarget,
  DiagnosisPageResult,
  DiagnosisEvent,
  DiagnosisHistoryItem,
} from '../../services/diagnosis/types';

const VALID_SITE_TYPES: SiteType[] = ['all', 'media', 'saas', 'ec', 'marketplace', 'api_product', 'docs'];

function generateJobId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  for (const b of bytes) id += chars[b % chars.length];
  return id;
}

// ============================================
// POST /api/diagnosis — Create diagnosis job
// ============================================

export async function handleDiagnosisCreate(
  request: Request,
  env: Env,
): Promise<Response> {
  const requestId = generateRequestId();

  // 1. Admin auth
  const auth = await requireAdmin(request, env);
  if (!auth.success) return auth.error!;
  const operator = auth.context!.operator;

  // 2. Rate limit (per operator)
  const rateResult = await checkRateLimit(env, operator.id, 'diagnosis');
  if (!rateResult.allowed) {
    return errors.rateLimited(requestId, rateResult.retryAfter);
  }

  // 3. Parse body
  let body: { url?: string; siteType?: string; turnstileToken?: string };
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON body');
  }

  // 4. Turnstile verification
  const turnstileToken = body.turnstileToken;
  if (!turnstileToken) {
    return errors.badRequest(requestId, 'Human verification token required');
  }

  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '0.0.0.0';
  const turnstileSecret = env.TURNSTILE_SECRET_KEY || '';

  if (turnstileSecret) {
    const turnstileResult = await verifyTurnstile(turnstileToken, ip, turnstileSecret);
    if (!turnstileResult.success) {
      return errors.forbidden(requestId, 'Human verification failed. Please try again.');
    }
  }
  // If no secret configured (dev mode), skip verification

  // 5. URL validation
  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return errors.badRequest(requestId, 'URL is required');
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeUrl(rawUrl);
    new URL(normalizedUrl); // Validate
  } catch {
    return errors.badRequest(requestId, 'Invalid URL format');
  }

  if (isPrivateUrl(normalizedUrl)) {
    return errors.badRequest(requestId, 'Internal/private URLs are not allowed');
  }

  const siteType: SiteType = VALID_SITE_TYPES.includes(body.siteType as SiteType)
    ? (body.siteType as SiteType) : 'all';

  // 6. Check for duplicate running job
  const existing = await env.DB.prepare(
    `SELECT id FROM diagnosis_jobs
     WHERE owner_id = ? AND normalized_domain = ? AND status IN ('pending','discovering','crawling','scoring')
     AND deleted_at IS NULL
     LIMIT 1`,
  ).bind(operator.id, extractDomain(normalizedUrl)).first<{ id: string }>();

  if (existing) {
    return errors.conflict(requestId, `A diagnosis is already running for this domain (job: ${existing.id})`);
  }

  // 7. Create job
  const jobId = generateJobId();
  const domain = extractDomain(normalizedUrl);

  await env.DB.prepare(
    `INSERT INTO diagnosis_jobs (id, owner_id, input_url, normalized_domain, site_type, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
  ).bind(jobId, operator.id, normalizedUrl, domain, siteType).run();

  // 8. Start background pipeline
  const ctx = getExecCtx();
  const pipelinePromise = runDiagnosisPipeline(env, jobId, normalizedUrl, siteType);

  if (ctx) {
    ctx.waitUntil(pipelinePromise);
  } else {
    // Fallback: await (may timeout for long crawls)
    pipelinePromise.catch(err => {
      console.error(`[Diagnosis] Pipeline error (no ctx): ${err.message}`);
    });
  }

  return success({ id: jobId, status: 'pending' }, requestId, 202);
}

// ============================================
// GET /api/diagnosis/:id/status — Poll progress
// ============================================

export async function handleDiagnosisStatus(
  request: Request,
  env: Env,
  jobId: string,
): Promise<Response> {
  const requestId = generateRequestId();

  if (!/^[a-z0-9]{6,20}$/.test(jobId)) {
    return errors.badRequest(requestId, 'Invalid job ID');
  }

  const job = await env.DB.prepare(
    `SELECT status, current_step, progress_percent, discovered_count, processed_count, total_count
     FROM diagnosis_jobs WHERE id = ? AND deleted_at IS NULL`,
  ).bind(jobId).first<Pick<DiagnosisJob,
    'status' | 'current_step' | 'progress_percent' | 'discovered_count' | 'processed_count' | 'total_count'
  >>();

  if (!job) {
    return errors.notFound(requestId, 'Diagnosis job');
  }

  // Get latest events
  const events = await env.DB.prepare(
    `SELECT step, message, progress, created_at FROM diagnosis_events
     WHERE job_id = ? ORDER BY created_at DESC LIMIT 20`,
  ).bind(jobId).all<DiagnosisEvent>();

  return success({
    status: job.status,
    progress_percent: job.progress_percent,
    current_step: job.current_step,
    discovered_count: job.discovered_count,
    processed_count: job.processed_count,
    total_count: job.total_count,
    events: events.results || [],
  }, requestId);
}

// ============================================
// GET /api/diagnosis/:id — Full results (admin only)
// ============================================

export async function handleDiagnosisGet(
  request: Request,
  env: Env,
  jobId: string,
): Promise<Response> {
  const requestId = generateRequestId();
  const auth = await requireAdmin(request, env);
  if (!auth.success) return auth.error!;

  if (!/^[a-z0-9]{6,20}$/.test(jobId)) {
    return errors.badRequest(requestId, 'Invalid job ID');
  }

  const job = await env.DB.prepare(
    `SELECT * FROM diagnosis_jobs WHERE id = ? AND deleted_at IS NULL`,
  ).bind(jobId).first<DiagnosisJob>();

  if (!job) {
    return errors.notFound(requestId, 'Diagnosis job');
  }

  // Owner check
  if (job.owner_id !== auth.context!.operator.id) {
    return errors.forbidden(requestId, 'You can only view your own diagnoses');
  }

  // Get targets and page results
  const [targets, pageResults] = await Promise.all([
    env.DB.prepare(
      `SELECT * FROM diagnosis_targets WHERE job_id = ? ORDER BY priority_score DESC`,
    ).bind(jobId).all<DiagnosisTarget>(),
    env.DB.prepare(
      `SELECT * FROM diagnosis_page_results WHERE job_id = ? ORDER BY page_overall_score DESC`,
    ).bind(jobId).all<DiagnosisPageResult>(),
  ]);

  const scores = job.scores_json ? JSON.parse(job.scores_json) : null;
  const topActions = job.top_actions_json ? JSON.parse(job.top_actions_json) : null;
  const autoResults = job.auto_results_json ? JSON.parse(job.auto_results_json) : null;

  return success({
    id: job.id,
    input_url: job.input_url,
    normalized_domain: job.normalized_domain,
    site_type: job.site_type,
    status: job.status,
    scores,
    summary: job.summary,
    topActions,
    autoResults,
    targets: targets.results || [],
    pageResults: (pageResults.results || []).map(pr => ({
      ...pr,
      auto_results_json: undefined, // Too large for list view
      signals: pr.signals_json ? JSON.parse(pr.signals_json) : null,
      signals_json: undefined,
    })),
    durationMs: job.duration_ms,
    createdAt: job.created_at,
    finishedAt: job.finished_at,
    errorMessage: job.error_message,
  }, requestId);
}

// ============================================
// GET /api/diagnosis/history — List past diagnoses (admin only)
// ============================================

export async function handleDiagnosisHistory(
  request: Request,
  env: Env,
): Promise<Response> {
  const requestId = generateRequestId();
  const auth = await requireAdmin(request, env);
  if (!auth.success) return auth.error!;

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const offset = (page - 1) * limit;

  const [items, countResult] = await Promise.all([
    env.DB.prepare(
      `SELECT id, input_url, normalized_domain, status, overall_score, search_score, toa_score,
              grade, created_at, finished_at
       FROM diagnosis_jobs
       WHERE owner_id = ? AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    ).bind(auth.context!.operator.id, limit, offset).all<DiagnosisHistoryItem>(),
    env.DB.prepare(
      `SELECT COUNT(*) as count FROM diagnosis_jobs
       WHERE owner_id = ? AND deleted_at IS NULL`,
    ).bind(auth.context!.operator.id).first<{ count: number }>(),
  ]);

  return success({
    items: items.results || [],
    total: countResult?.count || 0,
    page,
    limit,
  }, requestId);
}

// ============================================
// DELETE /api/diagnosis/:id — Soft delete (admin only)
// ============================================

export async function handleDiagnosisDelete(
  request: Request,
  env: Env,
  jobId: string,
): Promise<Response> {
  const requestId = generateRequestId();
  const auth = await requireAdmin(request, env);
  if (!auth.success) return auth.error!;

  const job = await env.DB.prepare(
    `SELECT id, owner_id FROM diagnosis_jobs WHERE id = ? AND deleted_at IS NULL`,
  ).bind(jobId).first<{ id: string; owner_id: string }>();

  if (!job) {
    return errors.notFound(requestId, 'Diagnosis job');
  }
  if (job.owner_id !== auth.context!.operator.id) {
    return errors.forbidden(requestId, 'You can only delete your own diagnoses');
  }

  await env.DB.prepare(
    `UPDATE diagnosis_jobs SET deleted_at = datetime('now') WHERE id = ?`,
  ).bind(jobId).run();

  return success({ deleted: true }, requestId);
}

// ============================================
// POST /api/diagnosis/:id/rerun — Re-run diagnosis (admin only)
// ============================================

export async function handleDiagnosisRerun(
  request: Request,
  env: Env,
  jobId: string,
): Promise<Response> {
  const requestId = generateRequestId();
  const auth = await requireAdmin(request, env);
  if (!auth.success) return auth.error!;

  // Rate limit
  const rateResult = await checkRateLimit(env, auth.context!.operator.id, 'diagnosis');
  if (!rateResult.allowed) {
    return errors.rateLimited(requestId, rateResult.retryAfter);
  }

  const job = await env.DB.prepare(
    `SELECT id, owner_id, input_url, site_type FROM diagnosis_jobs WHERE id = ? AND deleted_at IS NULL`,
  ).bind(jobId).first<{ id: string; owner_id: string; input_url: string; site_type: SiteType }>();

  if (!job) {
    return errors.notFound(requestId, 'Diagnosis job');
  }
  if (job.owner_id !== auth.context!.operator.id) {
    return errors.forbidden(requestId, 'You can only rerun your own diagnoses');
  }

  // Turnstile token from body
  let body: { turnstileToken?: string } = {};
  try {
    body = await request.json();
  } catch { /* empty body ok for rerun if we skip turnstile */ }

  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const turnstileSecret = env.TURNSTILE_SECRET_KEY || '';
  if (turnstileSecret && body.turnstileToken) {
    const turnstileResult = await verifyTurnstile(body.turnstileToken, ip, turnstileSecret);
    if (!turnstileResult.success) {
      return errors.forbidden(requestId, 'Human verification failed');
    }
  }

  // Create new job
  const newJobId = generateJobId();
  const domain = extractDomain(job.input_url);

  await env.DB.prepare(
    `INSERT INTO diagnosis_jobs (id, owner_id, input_url, normalized_domain, site_type, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
  ).bind(newJobId, auth.context!.operator.id, job.input_url, domain, job.site_type).run();

  const ctx = getExecCtx();
  const pipeline = runDiagnosisPipeline(env, newJobId, job.input_url, job.site_type);
  if (ctx) ctx.waitUntil(pipeline);
  else pipeline.catch(err => console.error(`[Diagnosis] Rerun pipeline error: ${err.message}`));

  return success({ id: newJobId, status: 'pending', previousJobId: jobId }, requestId, 202);
}
