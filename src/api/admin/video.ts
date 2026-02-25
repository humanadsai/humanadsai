/**
 * Admin Video Posts API
 *
 * Handles video creation, Remotion rendering, and Postiz posting.
 * POST /api/admin/video-posts        - Create video post
 * GET  /api/admin/video-posts        - List video posts
 * GET  /api/admin/video-posts/:id    - Get video post detail
 * POST /api/admin/video-posts/:id/retry - Retry failed stage
 * DELETE /api/admin/video-posts/:id  - Soft delete
 * POST /api/webhooks/remotion        - Remotion Lambda webhook
 */

import type { Env } from '../../types';
import { success, error, errors, generateRequestId } from '../../utils/response';
import { requireAdmin } from '../../middleware/admin';
import { arrayBufferToHex } from '../../utils/crypto';

// ============================================
// ID Generation
// ============================================

function generateId(prefix: string): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// Script → Slides Conversion (Rule-based)
// ============================================

interface Slide {
  type: 'hook' | 'body' | 'chapter_title' | 'emphasis' | 'cta';
  text: string;
  subtext?: string;
  durationSec: number;
  bgPreset?: string;
}

interface SlidesPayload {
  templateType: string;
  title: string;
  slides: Slide[];
  caption: string;
  hashtags: string[];
  bgmPreset: string;
  stylePreset: string;
  outroCta: { text: string; url: string };
  metadata: {
    totalDurationSec: number;
    totalSlides: number;
    fps: number;
    width: number;
    height: number;
    codec: string;
  };
}

const MAX_SLIDE_CHARS = 80;
const BG_PRESETS = ['gradient_blue', 'gradient_purple', 'solid_dark', 'solid_white', 'brand'];

function splitTextToSlides(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];

  const result: string[] = [];
  let remaining = text;

  while (remaining.length > maxChars) {
    // Try splitting at 。
    let splitIdx = remaining.lastIndexOf('。', maxChars);
    if (splitIdx > 0) {
      result.push(remaining.substring(0, splitIdx + 1));
      remaining = remaining.substring(splitIdx + 1).trim();
      continue;
    }
    // Try splitting at 、
    splitIdx = remaining.lastIndexOf('、', maxChars);
    if (splitIdx > 0) {
      result.push(remaining.substring(0, splitIdx + 1));
      remaining = remaining.substring(splitIdx + 1).trim();
      continue;
    }
    // Try splitting at '. '
    splitIdx = remaining.lastIndexOf('. ', maxChars);
    if (splitIdx > 0) {
      result.push(remaining.substring(0, splitIdx + 1));
      remaining = remaining.substring(splitIdx + 1).trim();
      continue;
    }
    // Force split at maxChars
    result.push(remaining.substring(0, maxChars));
    remaining = remaining.substring(maxChars).trim();
  }
  if (remaining.length > 0) {
    result.push(remaining);
  }
  return result;
}

function buildSlidesPayload(
  scriptText: string,
  templateType: string,
  internalTitle: string,
  captionText: string,
  hashtagsText: string,
  bgmPreset: string,
): SlidesPayload {
  const isExplainer = templateType === 'explainer';

  // Split by chapter separators (--- or more hyphens)
  const chapters = scriptText.split(/\n-{3,}\n/).map(c => c.trim()).filter(Boolean);

  const slides: Slide[] = [];
  let bgIdx = 0;

  for (let ci = 0; ci < chapters.length; ci++) {
    const chapter = chapters[ci];
    // Split by blank lines into paragraphs
    const paragraphs = chapter.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    // Add chapter title if explainer and multiple chapters
    if (isExplainer && chapters.length > 1 && ci > 0) {
      // Use first short line as chapter title, or generate one
      const firstLine = paragraphs[0] || '';
      if (firstLine.length <= 20) {
        slides.push({
          type: 'chapter_title',
          text: firstLine,
          durationSec: 2,
          bgPreset: BG_PRESETS[bgIdx % BG_PRESETS.length],
        });
        bgIdx++;
        paragraphs.shift();
      } else {
        slides.push({
          type: 'chapter_title',
          text: `Part ${ci + 1}`,
          durationSec: 2,
          bgPreset: BG_PRESETS[bgIdx % BG_PRESETS.length],
        });
        bgIdx++;
      }
    }

    for (let pi = 0; pi < paragraphs.length; pi++) {
      const para = paragraphs[pi].replace(/\n/g, ' ').trim();
      if (!para) continue;

      const subSlides = splitTextToSlides(para, MAX_SLIDE_CHARS);

      for (const text of subSlides) {
        const isFirst = slides.length === 0;
        // Detect emphasis: contains numbers, or short impactful sentence
        const isEmphasis = !isFirst && (
          /\d+[%％万億件]/.test(text) ||
          (text.length <= 30 && (text.endsWith('！') || text.endsWith('!') || text.endsWith('。')))
        );

        slides.push({
          type: isFirst ? 'hook' : (isEmphasis ? 'emphasis' : 'body'),
          text,
          durationSec: isFirst ? 3 : (isEmphasis ? 3 : Math.min(5, Math.max(3, Math.ceil(text.length / 20)))),
          bgPreset: BG_PRESETS[bgIdx % BG_PRESETS.length],
        });
        bgIdx++;
      }
    }
  }

  // Add CTA slide
  slides.push({
    type: 'cta',
    text: 'Follow us',
    subtext: 'humanadsai.com\n@HumanAdsAI',
    durationSec: 4,
    bgPreset: 'brand',
  });

  // Build caption
  const caption = captionText || scriptText.substring(0, 200).replace(/\n/g, ' ').trim();

  // Build hashtags
  const defaultHashtags = ['#HumanAds', '#HumanAdsAI'];
  const userHashtags = hashtagsText
    ? hashtagsText.split(/[\s,]+/).filter(h => h.startsWith('#'))
    : [];
  const hashtags = [...new Set([...userHashtags, ...defaultHashtags])];

  const totalDurationSec = slides.reduce((sum, s) => sum + s.durationSec, 0);

  return {
    templateType,
    title: internalTitle,
    slides,
    caption,
    hashtags,
    bgmPreset: bgmPreset || 'none',
    stylePreset: 'dark',
    outroCta: { text: 'Follow @HumanAdsAI', url: 'https://humanadsai.com' },
    metadata: {
      totalDurationSec,
      totalSlides: slides.length,
      fps: 30,
      width: 1080,
      height: 1920,
      codec: 'h264',
    },
  };
}

// ============================================
// Job Event Logging
// ============================================

async function logEvent(
  db: D1Database,
  videoPostId: string,
  jobType: string,
  eventType: string,
  message: string,
  metadata?: Record<string, unknown>,
) {
  await db.prepare(
    `INSERT INTO video_job_events (id, video_post_id, job_type, event_type, message, metadata_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    generateId('ve_'),
    videoPostId,
    jobType,
    eventType,
    message,
    metadata ? JSON.stringify(metadata) : null,
  ).run();
}

// ============================================
// Remotion Lambda Integration
// ============================================

async function triggerRemotionRender(
  env: Env,
  videoPostId: string,
  renderJobId: string,
  payload: SlidesPayload,
): Promise<{ success: boolean; renderId?: string; error?: string }> {
  const functionName = (env as any).REMOTION_LAMBDA_FUNCTION;
  const region = (env as any).REMOTION_AWS_REGION || 'ap-northeast-1';
  const serveUrl = (env as any).REMOTION_SERVE_URL;
  const webhookSecret = (env as any).REMOTION_WEBHOOK_SECRET;

  if (!functionName || !serveUrl) {
    return { success: false, error: 'Remotion Lambda not configured. Set REMOTION_LAMBDA_FUNCTION and REMOTION_SERVE_URL.' };
  }

  // For MVP: call Remotion Lambda via AWS API Gateway or direct Lambda invoke
  // This is a placeholder - actual implementation needs AWS SigV4 signing or API Gateway
  // For now, store the payload and mark as queued for manual/external processing
  return {
    success: true,
    renderId: `render_${generateId('')}`,
  };
}

// ============================================
// Postiz Integration
// ============================================

async function uploadToPostiz(
  env: Env,
  videoUrl: string,
): Promise<{ success: boolean; mediaId?: string; mediaPath?: string; error?: string }> {
  const apiKey = (env as any).POSTIZ_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'POSTIZ_API_KEY not configured' };
  }

  try {
    // Fetch video from S3/storage
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      return { success: false, error: `Failed to fetch video: ${videoRes.status}` };
    }

    const videoBlob = await videoRes.blob();

    // Upload to Postiz
    const form = new FormData();
    form.append('file', videoBlob, 'video.mp4');

    const uploadRes = await fetch('https://api.postiz.com/public/v1/upload', {
      method: 'POST',
      headers: { 'Authorization': apiKey },
      body: form,
    });

    if (!uploadRes.ok) {
      const errBody = await uploadRes.text();
      return { success: false, error: `Postiz upload failed (${uploadRes.status}): ${errBody}` };
    }

    const data = await uploadRes.json() as { id: string; path: string };
    return { success: true, mediaId: data.id, mediaPath: data.path };
  } catch (e: any) {
    return { success: false, error: `Postiz upload error: ${e.message}` };
  }
}

async function createPostizPost(
  env: Env,
  videoPost: any,
  targets: any[],
  mediaId: string,
  mediaPath: string,
): Promise<{ success: boolean; results?: Array<{ postId: string; integration: string }>; error?: string }> {
  const apiKey = (env as any).POSTIZ_API_KEY;
  const ytIntegrationId = (env as any).POSTIZ_YOUTUBE_INTEGRATION_ID;
  const igIntegrationId = (env as any).POSTIZ_INSTAGRAM_INTEGRATION_ID;

  if (!apiKey) {
    return { success: false, error: 'POSTIZ_API_KEY not configured' };
  }

  const posts: any[] = [];

  for (const target of targets) {
    if (target.platform === 'youtube' && ytIntegrationId) {
      const hashtags = videoPost.hashtags_text
        ? videoPost.hashtags_text.split(/[\s,]+/).filter((h: string) => h.startsWith('#')).map((h: string) => ({ value: h.replace('#', ''), label: h.replace('#', '') }))
        : [];

      posts.push({
        integration: { id: ytIntegrationId },
        value: [{
          content: videoPost.caption_text || '',
          image: [{ id: mediaId, path: mediaPath }],
        }],
        settings: {
          __type: 'youtube',
          title: videoPost.yt_title || videoPost.internal_title,
          type: videoPost.yt_visibility || 'unlisted',
          selfDeclaredMadeForKids: 'no',
          tags: hashtags,
        },
      });
    }

    if (target.platform === 'instagram' && igIntegrationId) {
      const captionWithTags = [
        videoPost.caption_text || '',
        '',
        videoPost.hashtags_text || '#HumanAds #HumanAdsAI',
      ].join('\n');

      posts.push({
        integration: { id: igIntegrationId },
        value: [{
          content: captionWithTags,
          image: [{ id: mediaId, path: mediaPath }],
        }],
        settings: {
          __type: 'instagram',
          post_type: 'post',
        },
      });
    }
  }

  if (posts.length === 0) {
    return { success: false, error: 'No valid platform targets configured' };
  }

  // Map publish_mode to Postiz type
  let postizType = 'draft';
  if (videoPost.publish_mode === 'publish_now') postizType = 'now';
  if (videoPost.publish_mode === 'scheduled') postizType = 'schedule';

  const body: any = {
    type: postizType,
    shortLink: false,
    posts,
  };

  if (postizType === 'schedule' && videoPost.scheduled_at) {
    body.date = videoPost.scheduled_at;
  }

  try {
    const res = await fetch('https://api.postiz.com/public/v1/posts', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { success: false, error: `Postiz create post failed (${res.status}): ${errBody}` };
    }

    const results = await res.json() as Array<{ postId: string; integration: string }>;
    return { success: true, results };
  } catch (e: any) {
    return { success: false, error: `Postiz API error: ${e.message}` };
  }
}

// ============================================
// API Handlers
// ============================================

/**
 * POST /api/admin/video-posts
 */
export async function createVideoPost(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const requestId = generateRequestId();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON body');
  }

  // Validate
  const { internal_title, template_type, script_text, platforms, publish_mode } = body;

  if (!internal_title || typeof internal_title !== 'string' || internal_title.length > 100) {
    return errors.badRequest(requestId, 'internal_title is required (max 100 chars)');
  }
  if (!template_type || !['slideshow', 'explainer'].includes(template_type)) {
    return errors.badRequest(requestId, 'template_type must be "slideshow" or "explainer"');
  }
  if (!script_text || typeof script_text !== 'string' || script_text.length < 1) {
    return errors.badRequest(requestId, 'script_text is required');
  }
  if (script_text.length > 10000) {
    return errors.badRequest(requestId, 'script_text must be 10,000 chars or less');
  }
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return errors.badRequest(requestId, 'At least one platform is required (youtube, instagram)');
  }
  for (const p of platforms) {
    if (!['youtube', 'instagram'].includes(p)) {
      return errors.badRequest(requestId, `Invalid platform: ${p}`);
    }
  }
  if (!publish_mode || !['draft', 'publish_now', 'scheduled'].includes(publish_mode)) {
    return errors.badRequest(requestId, 'publish_mode must be "draft", "publish_now", or "scheduled"');
  }
  if (publish_mode === 'scheduled') {
    if (!body.scheduled_at) {
      return errors.badRequest(requestId, 'scheduled_at is required for scheduled posts');
    }
    const scheduledDate = new Date(body.scheduled_at);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return errors.badRequest(requestId, 'scheduled_at must be a valid future date');
    }
  }
  if (platforms.includes('youtube') && body.yt_title && body.yt_title.length > 100) {
    return errors.badRequest(requestId, 'yt_title must be 100 chars or less');
  }

  // Build slides payload
  const slidesPayload = buildSlidesPayload(
    script_text,
    template_type,
    internal_title,
    body.caption_text || '',
    body.hashtags_text || '',
    body.bgm_preset || 'none',
  );

  if (slidesPayload.slides.length <= 1) {
    return errors.badRequest(requestId, 'Script produced too few slides. Add more content.');
  }

  // Convert scheduled_at to UTC if provided
  let scheduledAtUtc: string | null = null;
  if (body.scheduled_at) {
    scheduledAtUtc = new Date(body.scheduled_at).toISOString();
  }

  const videoPostId = generateId('vp_');
  const renderJobId = generateId('vr_');

  // Insert video_post
  await env.DB.prepare(
    `INSERT INTO video_posts (
      id, internal_title, template_type, script_text, slides_json, slides_count,
      caption_text, hashtags_text, yt_title, yt_visibility, cta_text, bgm_preset,
      status, publish_mode, scheduled_at, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued_render', ?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(
    videoPostId,
    internal_title,
    template_type,
    script_text,
    JSON.stringify(slidesPayload),
    slidesPayload.slides.length,
    body.caption_text || slidesPayload.caption,
    body.hashtags_text || slidesPayload.hashtags.join(' '),
    body.yt_title || internal_title,
    body.yt_visibility || 'unlisted',
    body.cta_text || null,
    body.bgm_preset || 'none',
    publish_mode,
    scheduledAtUtc,
    authResult.context!.operator.id,
  ).run();

  // Insert targets
  for (const platform of platforms) {
    await env.DB.prepare(
      `INSERT INTO video_post_targets (id, video_post_id, platform, target_status, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', datetime('now'), datetime('now'))`
    ).bind(generateId('vt_'), videoPostId, platform).run();
  }

  // Insert render job
  await env.DB.prepare(
    `INSERT INTO video_render_jobs (
      id, video_post_id, remotion_composition, input_payload_json,
      render_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'queued', datetime('now'), datetime('now'))`
  ).bind(
    renderJobId,
    videoPostId,
    template_type === 'slideshow' ? 'Slideshow' : 'Explainer',
    JSON.stringify(slidesPayload),
  ).run();

  // Log event
  await logEvent(env.DB, videoPostId, 'build', 'success',
    `Slides built: ${slidesPayload.slides.length} slides, ${slidesPayload.metadata.totalDurationSec}s`,
    { slidesCount: slidesPayload.slides.length, duration: slidesPayload.metadata.totalDurationSec }
  );

  // Trigger Remotion render (async best-effort)
  const renderResult = await triggerRemotionRender(env, videoPostId, renderJobId, slidesPayload);

  if (renderResult.success && renderResult.renderId) {
    await env.DB.prepare(
      `UPDATE video_render_jobs SET remotion_render_id = ?, render_status = 'rendering', started_at = datetime('now'), updated_at = datetime('now')
       WHERE id = ?`
    ).bind(renderResult.renderId, renderJobId).run();

    await env.DB.prepare(
      `UPDATE video_posts SET status = 'rendering', updated_at = datetime('now') WHERE id = ?`
    ).bind(videoPostId).run();

    await logEvent(env.DB, videoPostId, 'render', 'started',
      `Remotion render triggered: ${renderResult.renderId}`
    );
  } else {
    // Lambda not configured - stay in queued_render for manual processing
    await logEvent(env.DB, videoPostId, 'render', 'queued',
      renderResult.error || 'Render queued (Remotion Lambda not configured yet)'
    );
  }

  return success({
    video_post_id: videoPostId,
    status: renderResult.success ? 'rendering' : 'queued_render',
    render_job_id: renderJobId,
    slides_count: slidesPayload.slides.length,
    estimated_duration_sec: slidesPayload.metadata.totalDurationSec,
    slides_preview: slidesPayload.slides.map(s => ({ type: s.type, text: s.text.substring(0, 50), durationSec: s.durationSec })),
  }, requestId, 201);
}

/**
 * GET /api/admin/video-posts
 */
export async function listVideoPosts(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const requestId = generateRequestId();
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status');
  const platformFilter = url.searchParams.get('platform');

  let query = `
    SELECT vp.*,
      (SELECT GROUP_CONCAT(vpt.platform, ',') FROM video_post_targets vpt WHERE vpt.video_post_id = vp.id) as platforms,
      (SELECT GROUP_CONCAT(vpt.target_status, ',') FROM video_post_targets vpt WHERE vpt.video_post_id = vp.id) as target_statuses
    FROM video_posts vp
    WHERE vp.visibility = 'visible'
  `;
  const binds: string[] = [];

  if (statusFilter) {
    query += ` AND vp.status = ?`;
    binds.push(statusFilter);
  }

  if (platformFilter) {
    query += ` AND vp.id IN (SELECT video_post_id FROM video_post_targets WHERE platform = ?)`;
    binds.push(platformFilter);
  }

  query += ` ORDER BY vp.created_at DESC LIMIT 100`;

  const stmt = env.DB.prepare(query);
  const result = binds.length > 0 ? await stmt.bind(...binds).all() : await stmt.all();

  return success({
    video_posts: result.results || [],
    total: (result.results || []).length,
  }, requestId);
}

/**
 * GET /api/admin/video-posts/:id
 */
export async function getVideoPost(request: Request, env: Env, videoPostId: string): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const requestId = generateRequestId();

  const post = await env.DB.prepare('SELECT * FROM video_posts WHERE id = ? AND visibility = ?')
    .bind(videoPostId, 'visible')
    .first();

  if (!post) {
    return errors.notFound(requestId, 'Video post');
  }

  const targets = await env.DB.prepare('SELECT * FROM video_post_targets WHERE video_post_id = ?')
    .bind(videoPostId)
    .all();

  const renderJobs = await env.DB.prepare('SELECT * FROM video_render_jobs WHERE video_post_id = ? ORDER BY created_at DESC')
    .bind(videoPostId)
    .all();

  const events = await env.DB.prepare('SELECT * FROM video_job_events WHERE video_post_id = ? ORDER BY created_at DESC LIMIT 50')
    .bind(videoPostId)
    .all();

  return success({
    ...post,
    targets: targets.results || [],
    render_jobs: renderJobs.results || [],
    events: events.results || [],
  }, requestId);
}

/**
 * POST /api/admin/video-posts/:id/retry
 */
export async function retryVideoPost(request: Request, env: Env, videoPostId: string): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const requestId = generateRequestId();

  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const stage = body.stage || 'auto'; // render | postiz_upload | postiz_send | auto

  const post = await env.DB.prepare('SELECT * FROM video_posts WHERE id = ? AND visibility = ?')
    .bind(videoPostId, 'visible')
    .first<any>();

  if (!post) {
    return errors.notFound(requestId, 'Video post');
  }

  // Determine which stage to retry
  let retryStage = stage;
  if (retryStage === 'auto') {
    if (['render_failed', 'queued_render'].includes(post.status)) retryStage = 'render';
    else if (post.status === 'upload_failed') retryStage = 'postiz_upload';
    else if (['postiz_failed', 'render_succeeded'].includes(post.status)) retryStage = 'postiz_upload';
    else {
      return errors.badRequest(requestId, `Cannot retry from status: ${post.status}`);
    }
  }

  if (post.retry_count >= 3) {
    return errors.badRequest(requestId, 'Maximum retry count (3) reached');
  }

  await env.DB.prepare(
    `UPDATE video_posts SET retry_count = retry_count + 1, updated_at = datetime('now') WHERE id = ?`
  ).bind(videoPostId).run();

  if (retryStage === 'render') {
    // Create new render job
    const renderJobId = generateId('vr_');
    const slidesPayload = post.slides_json ? JSON.parse(post.slides_json) : null;

    if (!slidesPayload) {
      return errors.badRequest(requestId, 'No slides payload found');
    }

    await env.DB.prepare(
      `INSERT INTO video_render_jobs (id, video_post_id, remotion_composition, input_payload_json, render_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'queued', datetime('now'), datetime('now'))`
    ).bind(renderJobId, videoPostId, post.template_type === 'slideshow' ? 'Slideshow' : 'Explainer', post.slides_json).run();

    await env.DB.prepare(
      `UPDATE video_posts SET status = 'queued_render', updated_at = datetime('now') WHERE id = ?`
    ).bind(videoPostId).run();

    await logEvent(env.DB, videoPostId, 'render', 'retry', `Render retry #${post.retry_count + 1}`);

    return success({ status: 'queued_render', retry_count: post.retry_count + 1 }, requestId);
  }

  if (retryStage === 'postiz_upload') {
    await env.DB.prepare(
      `UPDATE video_posts SET status = 'render_succeeded', updated_at = datetime('now') WHERE id = ?`
    ).bind(videoPostId).run();

    await logEvent(env.DB, videoPostId, 'upload', 'retry', `Postiz upload retry #${post.retry_count + 1}`);

    return success({ status: 'render_succeeded', retry_count: post.retry_count + 1, message: 'Queued for Postiz upload on next cron cycle' }, requestId);
  }

  if (retryStage === 'postiz_send') {
    await env.DB.prepare(
      `UPDATE video_posts SET status = 'queued_postiz', updated_at = datetime('now') WHERE id = ?`
    ).bind(videoPostId).run();

    await logEvent(env.DB, videoPostId, 'postiz_send', 'retry', `Postiz send retry #${post.retry_count + 1}`);

    return success({ status: 'queued_postiz', retry_count: post.retry_count + 1, message: 'Queued for Postiz send on next cron cycle' }, requestId);
  }

  return errors.badRequest(requestId, `Unknown retry stage: ${retryStage}`);
}

/**
 * DELETE /api/admin/video-posts/:id
 */
export async function deleteVideoPost(request: Request, env: Env, videoPostId: string): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const requestId = generateRequestId();

  const result = await env.DB.prepare(
    `UPDATE video_posts SET visibility = 'deleted', updated_at = datetime('now') WHERE id = ? AND visibility = 'visible'`
  ).bind(videoPostId).run();

  if (!result.meta.changes || result.meta.changes === 0) {
    return errors.notFound(requestId, 'Video post');
  }

  await logEvent(env.DB, videoPostId, 'system', 'success', 'Video post deleted');

  return success({ deleted: true }, requestId);
}

/**
 * POST /api/webhooks/remotion
 * Receives render completion webhooks from Remotion Lambda
 */
export async function handleRemotionWebhook(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  // Verify webhook signature
  const signature = request.headers.get('X-Remotion-Signature');
  const status = request.headers.get('X-Remotion-Status');
  const webhookSecret = (env as any).REMOTION_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error('[RemotionWebhook] Missing signature or secret');
    return error('WEBHOOK_INVALID', 'Invalid webhook', requestId, 401);
  }

  // Verify HMAC
  const bodyText = await request.text();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(bodyText));
  const expectedSig = arrayBufferToHex(sig);

  if (signature !== expectedSig) {
    console.error('[RemotionWebhook] Signature mismatch');
    return error('WEBHOOK_INVALID', 'Invalid signature', requestId, 401);
  }

  let payload: any;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON');
  }

  const { renderId, customData, outputUrl, outputFile, costs, errors: renderErrors, timeToFinish } = payload;
  const videoPostId = customData?.videoPostId;
  const renderJobId = customData?.renderJobId;

  if (!videoPostId || !renderJobId) {
    return errors.badRequest(requestId, 'Missing customData.videoPostId or renderJobId');
  }

  if (status === 'success') {
    const videoUrl = outputUrl || outputFile;

    await env.DB.prepare(
      `UPDATE video_render_jobs SET
        render_status = 'completed',
        output_video_url = ?,
        render_cost_usd = ?,
        completed_at = datetime('now'),
        updated_at = datetime('now')
       WHERE id = ?`
    ).bind(videoUrl, costs?.accruedSoFar || null, renderJobId).run();

    await env.DB.prepare(
      `UPDATE video_posts SET status = 'render_succeeded', updated_at = datetime('now') WHERE id = ?`
    ).bind(videoPostId).run();

    await logEvent(env.DB, videoPostId, 'render', 'success',
      `Render completed in ${timeToFinish ? Math.round(timeToFinish / 1000) : '?'}s`,
      { renderId, videoUrl, cost: costs?.accruedSoFar, timeToFinish }
    );
  } else {
    const errMsg = renderErrors?.[0]?.message || `Render ${status}`;

    await env.DB.prepare(
      `UPDATE video_render_jobs SET render_status = 'failed', error_message = ?, completed_at = datetime('now'), updated_at = datetime('now')
       WHERE id = ?`
    ).bind(errMsg, renderJobId).run();

    await env.DB.prepare(
      `UPDATE video_posts SET status = 'render_failed', updated_at = datetime('now') WHERE id = ?`
    ).bind(videoPostId).run();

    await logEvent(env.DB, videoPostId, 'render', 'failed', errMsg, { renderId, errors: renderErrors });
  }

  return success({ received: true }, requestId);
}

// ============================================
// Cron Job: Process Video Post Pipeline
// ============================================

export async function processVideoPostJobs(env: Env): Promise<void> {
  console.log('[VideoJobs] Starting video post job processing');

  // 1. render_succeeded → upload to Postiz
  const readyToUpload = await env.DB.prepare(
    `SELECT vp.* FROM video_posts vp WHERE vp.status = 'render_succeeded' AND vp.visibility = 'visible' LIMIT 3`
  ).all<any>();

  for (const post of readyToUpload.results || []) {
    try {
      // Get render job with output URL
      const renderJob = await env.DB.prepare(
        `SELECT output_video_url FROM video_render_jobs WHERE video_post_id = ? AND render_status = 'completed' ORDER BY completed_at DESC LIMIT 1`
      ).bind(post.id).first<any>();

      if (!renderJob?.output_video_url) {
        console.log(`[VideoJobs] No video URL for post ${post.id}, skipping`);
        continue;
      }

      await env.DB.prepare(
        `UPDATE video_posts SET status = 'uploading_to_postiz', updated_at = datetime('now') WHERE id = ?`
      ).bind(post.id).run();

      await logEvent(env.DB, post.id, 'upload', 'started', 'Uploading video to Postiz');

      const uploadResult = await uploadToPostiz(env, renderJob.output_video_url);

      if (uploadResult.success) {
        // Save media info to all targets
        await env.DB.prepare(
          `UPDATE video_post_targets SET postiz_media_id = ?, postiz_media_path = ?, target_status = 'uploaded', updated_at = datetime('now')
           WHERE video_post_id = ?`
        ).bind(uploadResult.mediaId!, uploadResult.mediaPath!, post.id).run();

        await env.DB.prepare(
          `UPDATE video_posts SET status = 'queued_postiz', updated_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();

        await logEvent(env.DB, post.id, 'upload', 'success', `Uploaded to Postiz: ${uploadResult.mediaId}`);
      } else {
        await env.DB.prepare(
          `UPDATE video_posts SET status = 'upload_failed', updated_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();

        await logEvent(env.DB, post.id, 'upload', 'failed', uploadResult.error || 'Upload failed');
      }
    } catch (e: any) {
      console.error(`[VideoJobs] Upload error for post ${post.id}:`, e);
      await env.DB.prepare(
        `UPDATE video_posts SET status = 'upload_failed', updated_at = datetime('now') WHERE id = ?`
      ).bind(post.id).run();
      await logEvent(env.DB, post.id, 'upload', 'failed', e.message);
    }
  }

  // 2. queued_postiz → create Postiz post
  const readyToPost = await env.DB.prepare(
    `SELECT vp.* FROM video_posts vp WHERE vp.status = 'queued_postiz' AND vp.visibility = 'visible' LIMIT 3`
  ).all<any>();

  for (const post of readyToPost.results || []) {
    try {
      const targets = await env.DB.prepare(
        `SELECT * FROM video_post_targets WHERE video_post_id = ?`
      ).bind(post.id).all<any>();

      const firstTarget = (targets.results || [])[0];
      if (!firstTarget?.postiz_media_id || !firstTarget?.postiz_media_path) {
        console.log(`[VideoJobs] No media uploaded for post ${post.id}`);
        continue;
      }

      // Check idempotency: skip if any target already has a postiz_post_id
      const hasExisting = (targets.results || []).some((t: any) => t.postiz_post_id);
      if (hasExisting) {
        console.log(`[VideoJobs] Post ${post.id} already has Postiz post ID, skipping`);
        await env.DB.prepare(
          `UPDATE video_posts SET status = 'postiz_draft_created', updated_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();
        continue;
      }

      await env.DB.prepare(
        `UPDATE video_posts SET status = 'sending_to_postiz', updated_at = datetime('now') WHERE id = ?`
      ).bind(post.id).run();

      await logEvent(env.DB, post.id, 'postiz_send', 'started', 'Creating Postiz post');

      const result = await createPostizPost(
        env, post, targets.results || [],
        firstTarget.postiz_media_id, firstTarget.postiz_media_path
      );

      if (result.success && result.results) {
        // Save postiz_post_id for each target
        for (const r of result.results) {
          await env.DB.prepare(
            `UPDATE video_post_targets SET postiz_post_id = ?, target_status = ?, updated_at = datetime('now')
             WHERE video_post_id = ? AND postiz_integration_id = ?`
          ).bind(r.postId, post.publish_mode === 'draft' ? 'draft_created' : (post.publish_mode === 'scheduled' ? 'scheduled' : 'publishing'), post.id, r.integration).run();

          // Also try matching by platform if integration ID wasn't saved
          if (r.integration) {
            const ytId = (env as any).POSTIZ_YOUTUBE_INTEGRATION_ID;
            const igId = (env as any).POSTIZ_INSTAGRAM_INTEGRATION_ID;
            const platform = r.integration === ytId ? 'youtube' : (r.integration === igId ? 'instagram' : null);
            if (platform) {
              await env.DB.prepare(
                `UPDATE video_post_targets SET postiz_post_id = ?, postiz_integration_id = ?, target_status = ?, updated_at = datetime('now')
                 WHERE video_post_id = ? AND platform = ?`
              ).bind(r.postId, r.integration, post.publish_mode === 'draft' ? 'draft_created' : (post.publish_mode === 'scheduled' ? 'scheduled' : 'publishing'), post.id, platform).run();
            }
          }
        }

        // Update overall status
        let newStatus = 'postiz_draft_created';
        if (post.publish_mode === 'scheduled') newStatus = 'scheduled';
        if (post.publish_mode === 'publish_now') newStatus = 'publishing';

        await env.DB.prepare(
          `UPDATE video_posts SET status = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(newStatus, post.id).run();

        await logEvent(env.DB, post.id, 'postiz_send', 'success',
          `Postiz post created: ${result.results.map(r => r.postId).join(', ')}`
        );
      } else {
        await env.DB.prepare(
          `UPDATE video_posts SET status = 'postiz_failed', updated_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();

        // Update target error info
        const errCode = result.error?.includes('401') ? 'POSTIZ_AUTH_EXPIRED' :
                        result.error?.includes('429') ? 'POSTIZ_RATE_LIMITED' :
                        result.error?.includes('disabled') ? 'POSTIZ_CHANNEL_DISABLED' :
                        'POSTIZ_API_ERROR';

        await env.DB.prepare(
          `UPDATE video_post_targets SET target_status = 'send_failed', error_code = ?, error_message = ?, updated_at = datetime('now')
           WHERE video_post_id = ?`
        ).bind(errCode, result.error || 'Unknown error', post.id).run();

        await logEvent(env.DB, post.id, 'postiz_send', 'failed', result.error || 'Postiz send failed');
      }
    } catch (e: any) {
      console.error(`[VideoJobs] Postiz send error for post ${post.id}:`, e);
      await env.DB.prepare(
        `UPDATE video_posts SET status = 'postiz_failed', updated_at = datetime('now') WHERE id = ?`
      ).bind(post.id).run();
      await logEvent(env.DB, post.id, 'postiz_send', 'failed', e.message);
    }
  }

  console.log('[VideoJobs] Video post job processing completed');
}
