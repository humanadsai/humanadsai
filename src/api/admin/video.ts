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
import { invokeLambda } from '../../lib/aws-sigv4';
import { rewriteScript, evaluateScript } from '../../services/llm';
import { generateSlideImages } from '../../services/image-generator';

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
  sceneType?: 'standard' | 'hook_punch' | 'reveal_list' | 'concept_explain' | 'danger_shift' | 'cta_tease';
  listItems?: string[];
  captionEmphasisWords?: string[];
  motionPreset?: 'none' | 'zoom_in' | 'pulse' | 'slide_left';
  visualNotes?: string;
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
// Enhanced Slides Builder (Scene-type aware)
// ============================================

const ENHANCED_BG_PRESETS = [
  'gradient_blue', 'gradient_purple', 'solid_dark', 'solid_white', 'brand',
  'danger_red', 'warm_amber', 'clean_minimal',
];

// Danger-related keywords for auto-detection
const DANGER_KEYWORDS = ['危険', '注意', '警告', 'リスク', '問題', '失敗', 'NG', 'やばい', '絶対', 'まずい', '損', '詐欺'];

/**
 * Extract emphasis words from text.
 * Matches 「」, **word**, *word* patterns.
 */
function extractEmphasisWords(text: string): string[] {
  const words: string[] = [];
  // Match 「...」
  const kakko = text.match(/「([^」]+)」/g);
  if (kakko) {
    for (const m of kakko) {
      words.push(m.slice(1, -1));
    }
  }
  // Match **word** or *word*
  const bold = text.match(/\*\*([^*]+)\*\*/g);
  if (bold) {
    for (const m of bold) {
      words.push(m.slice(2, -2));
    }
  }
  const italic = text.match(/(?<!\*)\*([^*]+)\*(?!\*)/g);
  if (italic) {
    for (const m of italic) {
      words.push(m.slice(1, -1));
    }
  }
  return [...new Set(words)];
}

/**
 * Detect if text contains list-like content (numbered items, bullet points).
 */
function isListContent(text: string): boolean {
  const lines = text.split('\n').filter(Boolean);
  if (lines.length < 2) return false;
  const listPatterns = /^[\s]*[•・\-\d①②③④⑤⑥⑦⑧⑨⑩]/;
  const matchCount = lines.filter(l => listPatterns.test(l)).length;
  return matchCount >= 2;
}

/**
 * Detect if text contains alarming/danger content.
 */
function isDangerContent(text: string): boolean {
  return DANGER_KEYWORDS.some(kw => text.includes(kw));
}

/**
 * Build enhanced slides payload with scene types, emphasis, and motion presets.
 * Original buildSlidesPayload() is unchanged for backward compat.
 */
function buildEnhancedSlidesPayload(
  scriptText: string,
  templateType: string,
  internalTitle: string,
  captionText: string,
  hashtagsText: string,
  bgmPreset: string,
): SlidesPayload {
  const isExplainer = templateType === 'explainer';

  // Split by chapter separators
  const chapters = scriptText.split(/\n-{3,}\n/).map(c => c.trim()).filter(Boolean);

  const slides: Slide[] = [];
  let bgIdx = 0;

  for (let ci = 0; ci < chapters.length; ci++) {
    const chapter = chapters[ci];
    const paragraphs = chapter.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    if (isExplainer && chapters.length > 1 && ci > 0) {
      const firstLine = paragraphs[0] || '';
      if (firstLine.length <= 20) {
        slides.push({
          type: 'chapter_title',
          text: firstLine,
          durationSec: 2,
          bgPreset: ENHANCED_BG_PRESETS[bgIdx % ENHANCED_BG_PRESETS.length],
          sceneType: 'standard',
          motionPreset: 'none',
        });
        bgIdx++;
        paragraphs.shift();
      } else {
        slides.push({
          type: 'chapter_title',
          text: `Part ${ci + 1}`,
          durationSec: 2,
          bgPreset: ENHANCED_BG_PRESETS[bgIdx % ENHANCED_BG_PRESETS.length],
          sceneType: 'standard',
          motionPreset: 'none',
        });
        bgIdx++;
      }
    }

    for (let pi = 0; pi < paragraphs.length; pi++) {
      const para = paragraphs[pi].trim();
      if (!para) continue;

      const isFirst = slides.length === 0;

      // Check for list content
      if (isListContent(para)) {
        const items = para.split('\n')
          .map(l => l.replace(/^[\s]*[•・\-\d①②③④⑤⑥⑦⑧⑨⑩]+[\.\)、\s]*/, '').trim())
          .filter(Boolean);
        slides.push({
          type: 'body',
          text: items.join('\n'),
          durationSec: Math.min(6, Math.max(3, items.length * 1.5)),
          bgPreset: ENHANCED_BG_PRESETS[bgIdx % ENHANCED_BG_PRESETS.length],
          sceneType: 'reveal_list',
          listItems: items.slice(0, 5),
          motionPreset: 'none',
        });
        bgIdx++;
        continue;
      }

      // Single-line processing
      const cleanPara = para.replace(/\n/g, ' ').trim();
      const subSlides = splitTextToSlides(cleanPara, MAX_SLIDE_CHARS);

      for (const text of subSlides) {
        const emphasisWords = extractEmphasisWords(text);
        const cleanText = text.replace(/[「」\*]/g, '');

        // Detect emphasis: numbers, short impactful
        const isEmphasis = !isFirst && (
          /\d+[%％万億件]/.test(text) ||
          (text.length <= 30 && (text.endsWith('！') || text.endsWith('!') || text.endsWith('。')))
        );
        const hasDanger = isDangerContent(text);

        // Scene type assignment
        let sceneType: Slide['sceneType'] = 'standard';
        let motionPreset: Slide['motionPreset'] = 'none';
        let bgPreset = ENHANCED_BG_PRESETS[bgIdx % ENHANCED_BG_PRESETS.length];

        if (isFirst) {
          sceneType = 'hook_punch';
          motionPreset = 'zoom_in';
        } else if (hasDanger) {
          sceneType = 'danger_shift';
          bgPreset = 'danger_red';
        } else if (isEmphasis) {
          sceneType = 'standard';
          motionPreset = 'pulse';
        } else {
          sceneType = 'concept_explain';
        }

        slides.push({
          type: isFirst ? 'hook' : (isEmphasis ? 'emphasis' : 'body'),
          text: cleanText,
          durationSec: isFirst ? 3 : (isEmphasis ? 3 : Math.min(5, Math.max(3, Math.ceil(cleanText.length / 20)))),
          bgPreset,
          sceneType,
          captionEmphasisWords: emphasisWords.length > 0 ? emphasisWords : undefined,
          motionPreset,
        });
        bgIdx++;
      }
    }
  }

  // CTA slide with cta_tease scene
  slides.push({
    type: 'cta',
    text: 'Follow us',
    subtext: 'humanadsai.com\n@HumanAdsAI',
    durationSec: 4,
    bgPreset: 'brand',
    sceneType: 'cta_tease',
    motionPreset: 'none',
  });

  const caption = captionText || scriptText.substring(0, 200).replace(/\n/g, ' ').trim();
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

/**
 * Scale slide durations to hit a target total duration.
 * Hook (first) stays 2-3s, CTA (last) stays 3-4s. Body slides scale proportionally.
 */
function scaleSlidesToDuration(slides: Slide[], targetSec: number): Slide[] {
  if (slides.length < 2) return slides;

  const result = slides.map(s => ({ ...s }));
  const hookIdx = 0;
  const ctaIdx = result.length - 1;

  // Fixed durations for hook and CTA
  const hookDuration = Math.min(3, Math.max(2, result[hookIdx].durationSec));
  const ctaDuration = Math.min(4, Math.max(3, result[ctaIdx].durationSec));
  result[hookIdx].durationSec = hookDuration;
  result[ctaIdx].durationSec = ctaDuration;

  const fixedDuration = hookDuration + ctaDuration;
  const remainingTarget = targetSec - fixedDuration;

  if (remainingTarget <= 0 || result.length <= 2) return result;

  // Body slides (everything between hook and CTA)
  const bodySlides = result.slice(1, ctaIdx);
  const currentBodyTotal = bodySlides.reduce((sum, s) => sum + s.durationSec, 0);

  if (currentBodyTotal <= 0) return result;

  const scaleFactor = remainingTarget / currentBodyTotal;

  for (let i = 1; i < ctaIdx; i++) {
    let scaled = Math.round(result[i].durationSec * scaleFactor * 10) / 10;
    scaled = Math.max(2, Math.min(6, scaled)); // enforce min 2s / max 6s
    result[i].durationSec = scaled;
  }

  return result;
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
  const accessKeyId = (env as any).AWS_ACCESS_KEY_ID;
  const secretAccessKey = (env as any).AWS_SECRET_ACCESS_KEY;
  const appUrl = (env as any).APP_URL || 'https://humanadsai.com';

  if (!functionName || !serveUrl) {
    return { success: false, error: 'Remotion Lambda not configured. Set REMOTION_LAMBDA_FUNCTION and REMOTION_SERVE_URL.' };
  }

  if (!accessKeyId || !secretAccessKey) {
    return { success: false, error: 'AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.' };
  }

  // Remotion Lambda payload — must match SDK's renderMediaOnLambda() format exactly.
  // inputProps are wrapped in { type: 'payload', payload: '<json>' } for inline serialization.
  const remotionVersion = (env as any).REMOTION_VERSION || '4.0.242';
  const serializedInputProps = {
    type: 'payload',
    payload: JSON.stringify(payload),
  };

  const remotionPayload: Record<string, unknown> = {
    type: 'start',
    version: remotionVersion,
    serveUrl,
    composition: 'Slideshow',
    codec: 'h264',
    imageFormat: 'jpeg',
    inputProps: serializedInputProps,
    crf: null,
    envVariables: {},
    pixelFormat: null,
    proResProfile: null,
    x264Preset: null,
    jpegQuality: 80,
    maxRetries: 1,
    privacy: 'public',
    logLevel: 'warning',
    frameRange: null,
    outName: null,
    timeoutInMilliseconds: 240000,
    chromiumOptions: {},
    scale: 1,
    everyNthFrame: 1,
    numberOfGifLoops: null,
    concurrencyPerLambda: 1,
    downloadBehavior: { type: 'play-in-browser' },
    muted: false,
    overwrite: false,
    audioBitrate: null,
    videoBitrate: null,
    encodingBufferSize: null,
    encodingMaxRate: null,
    webhook: null,
    forceHeight: null,
    forceWidth: null,
    rendererFunctionName: null,
    framesPerLambda: null,
    bucketName: null,
    audioCodec: null,
    offthreadVideoCacheSizeInBytes: null,
    deleteAfter: null,
    colorSpace: null,
    preferLossless: false,
    forcePathStyle: false,
    metadata: null,
  };

  if (webhookSecret) {
    remotionPayload.webhook = {
      url: `${appUrl}/api/webhooks/remotion`,
      secret: webhookSecret,
      customData: { videoPostId, renderJobId },
    };
  }

  try {
    const result = await invokeLambda({
      functionName,
      region,
      payload: remotionPayload,
      invocationType: 'Event', // async — avoids Worker timeout
      accessKeyId,
      secretAccessKey,
    });

    if (result.statusCode === 202) {
      // Async invoke accepted; actual renderId arrives via webhook
      return { success: true, renderId: `lambda_${renderJobId}` };
    }

    return {
      success: false,
      error: `Lambda invoke failed: HTTP ${result.statusCode} – ${result.body || 'no body'}`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Lambda invoke error: ${message}` };
  }
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

      // Prefix YouTube title with variant_id when present
      const ytTitle = videoPost.variant_id
        ? `[${videoPost.variant_id}] ${videoPost.yt_title || videoPost.internal_title}`
        : (videoPost.yt_title || videoPost.internal_title);

      posts.push({
        integration: { id: ytIntegrationId },
        value: [{
          content: videoPost.caption_text || '',
          image: [{ id: mediaId, path: mediaPath }],
        }],
        settings: {
          __type: 'youtube',
          title: ytTitle,
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
  // If scheduled_at has already passed (e.g. rendering took too long), fall back to immediate post
  let postizType = 'draft';
  if (videoPost.publish_mode === 'publish_now') postizType = 'now';
  if (videoPost.publish_mode === 'scheduled') {
    const scheduledTime = new Date(videoPost.scheduled_at).getTime();
    if (isNaN(scheduledTime) || scheduledTime <= Date.now()) {
      postizType = 'now';
    } else {
      postizType = 'schedule';
    }
  }

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
  let { internal_title, template_type, script_text, platforms, publish_mode } = body;

  // Auto-generate title from script first line if not provided
  if ((!internal_title || typeof internal_title !== 'string') && script_text && typeof script_text === 'string') {
    const firstLine = script_text.split('\n')[0].trim();
    internal_title = firstLine.length > 50 ? firstLine.slice(0, 50) + '...' : firstLine;
  }
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

  // Enforce 15-45s duration range
  const clampedDuration = Math.max(15, Math.min(45, slidesPayload.metadata.totalDurationSec));
  slidesPayload.slides = scaleSlidesToDuration(slidesPayload.slides, clampedDuration);
  slidesPayload.metadata.totalDurationSec = slidesPayload.slides.reduce((sum, s) => sum + s.durationSec, 0);

  // Convert scheduled_at to UTC if provided
  let scheduledAtUtc: string | null = null;
  if (body.scheduled_at) {
    scheduledAtUtc = new Date(body.scheduled_at).toISOString();
  }

  const openrouterKey = (env as any).OPENROUTER_API_KEY;
  const videoPostId = generateId('vp_');

  // Insert video_post (initial status: script_rewriting if LLM available, queued_render otherwise)
  await env.DB.prepare(
    `INSERT INTO video_posts (
      id, internal_title, template_type, script_text, slides_json, slides_count,
      caption_text, hashtags_text, yt_title, yt_visibility, cta_text, bgm_preset,
      status, publish_mode, scheduled_at, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
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
    openrouterKey ? 'script_rewriting' : 'queued_render',
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

  await logEvent(env.DB, videoPostId, 'build', 'success',
    `Slides built: ${slidesPayload.slides.length} slides, ${slidesPayload.metadata.totalDurationSec}s`,
    { slidesCount: slidesPayload.slides.length, duration: slidesPayload.metadata.totalDurationSec }
  );

  // ── LLM Pipeline: run inline ──
  if (openrouterKey) {
    const targetDuration = Math.max(15, Math.min(45, body.duration_target_sec || 30));
    let currentScript = script_text;
    let bestScript = script_text;
    let bestScore = 0;
    let totalAttempts = 0;
    const MAX_INLINE_ATTEMPTS = 3;

    try {
      // Step 1: Rewrite
      await logEvent(env.DB, videoPostId, 'llm_rewrite', 'started', 'LLM script rewrite started');
      const rewriteResult = await rewriteScript(openrouterKey, script_text, targetDuration);
      currentScript = rewriteResult.rewrittenScript;
      bestScript = currentScript;

      await recordCost(env.DB, videoPostId, 'llm_rewrite', rewriteResult.costUsd, rewriteResult.inputTokens, rewriteResult.outputTokens, 'claude-sonnet-4');
      await logEvent(env.DB, videoPostId, 'llm_rewrite', 'success',
        `Script rewritten: ${rewriteResult.outputTokens} tokens, $${rewriteResult.costUsd.toFixed(4)}`
      );

      await env.DB.prepare(
        `UPDATE video_posts SET llm_rewritten_script = ?, status = 'evaluating_script', updated_at = datetime('now') WHERE id = ?`
      ).bind(currentScript, videoPostId).run();

      // Step 2: Evaluate loop (up to 10 attempts)
      for (let attempt = 1; attempt <= MAX_INLINE_ATTEMPTS; attempt++) {
        totalAttempts = attempt;
        await logEvent(env.DB, videoPostId, 'llm_eval', 'started', `Evaluation attempt #${attempt}`);

        const evalResult = await evaluateScript(openrouterKey, currentScript);
        await recordCost(env.DB, videoPostId, 'llm_eval', evalResult.costUsd, evalResult.inputTokens, evalResult.outputTokens, 'claude-sonnet-4',
          { attempt, score: evalResult.score }
        );

        await logEvent(env.DB, videoPostId, 'llm_eval', 'completed',
          `Score: ${evalResult.score}/100 (#${attempt}). H${evalResult.breakdown.hook}/P${evalResult.breakdown.pacing}/C${evalResult.breakdown.clarity}/CTA${evalResult.breakdown.cta}/E${evalResult.breakdown.emotion}`,
          { score: evalResult.score, breakdown: evalResult.breakdown }
        );

        if (evalResult.score > bestScore) {
          bestScore = evalResult.score;
          bestScript = currentScript;
        }

        if (evalResult.score >= 90) {
          // Passed!
          await env.DB.prepare(
            `UPDATE video_posts SET llm_eval_score = ?, llm_eval_attempts = ?, llm_eval_feedback = ?,
              llm_rewritten_script = ?, status = 'script_approved', updated_at = datetime('now') WHERE id = ?`
          ).bind(evalResult.score, attempt, JSON.stringify(evalResult), currentScript, videoPostId).run();
          await logEvent(env.DB, videoPostId, 'llm_eval', 'success', `Script approved: ${evalResult.score}/100 after ${attempt} attempt(s)`);
          break;
        }

        if (attempt >= MAX_INLINE_ATTEMPTS) {
          // Max attempts — use best version
          await env.DB.prepare(
            `UPDATE video_posts SET llm_eval_score = ?, llm_eval_attempts = ?, llm_eval_feedback = ?,
              llm_rewritten_script = ?, status = 'script_approved', updated_at = datetime('now') WHERE id = ?`
          ).bind(bestScore, attempt, JSON.stringify(evalResult), bestScript, videoPostId).run();
          await logEvent(env.DB, videoPostId, 'llm_eval', 'warning',
            `Max attempts (10) reached. Using best script with score ${bestScore}/100`
          );
          break;
        }

        // Rewrite with feedback
        const rewriteRetry = await rewriteScript(openrouterKey, script_text, targetDuration, evalResult.feedback);
        currentScript = rewriteRetry.rewrittenScript;
        await recordCost(env.DB, videoPostId, 'llm_rewrite', rewriteRetry.costUsd, rewriteRetry.inputTokens, rewriteRetry.outputTokens, 'claude-sonnet-4',
          { attempt, rewriteAfterEval: true }
        );

        await env.DB.prepare(
          `UPDATE video_posts SET llm_rewritten_script = ?, llm_eval_score = ?, llm_eval_attempts = ?, llm_eval_feedback = ?,
            updated_at = datetime('now') WHERE id = ?`
        ).bind(currentScript, evalResult.score, attempt, JSON.stringify(evalResult), videoPostId).run();
      }

      // Step 3: Rebuild slides from approved script
      const finalScript = bestScore >= 90 ? currentScript : bestScript;
      const finalPayload = buildEnhancedSlidesPayload(
        finalScript, template_type, internal_title,
        body.caption_text || '', body.hashtags_text || '', body.bgm_preset || 'none',
      );
      const finalDuration = Math.max(15, Math.min(45, finalPayload.metadata.totalDurationSec));
      finalPayload.slides = scaleSlidesToDuration(finalPayload.slides, finalDuration);
      finalPayload.metadata.totalDurationSec = finalPayload.slides.reduce((sum, s) => sum + s.durationSec, 0);

      await env.DB.prepare(
        `UPDATE video_posts SET slides_json = ?, slides_count = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(JSON.stringify(finalPayload), finalPayload.slides.length, videoPostId).run();

      // Step 4: Trigger render
      const renderJobId = generateId('vr_');
      await env.DB.prepare(
        `INSERT INTO video_render_jobs (id, video_post_id, remotion_composition, input_payload_json, render_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'queued', datetime('now'), datetime('now'))`
      ).bind(renderJobId, videoPostId, template_type === 'slideshow' ? 'Slideshow' : 'Explainer', JSON.stringify(finalPayload)).run();

      await env.DB.prepare(
        `UPDATE video_posts SET status = 'queued_render', updated_at = datetime('now') WHERE id = ?`
      ).bind(videoPostId).run();

      const renderResult = await triggerRemotionRender(env, videoPostId, renderJobId, finalPayload);
      if (renderResult.success && renderResult.renderId) {
        await env.DB.prepare(
          `UPDATE video_render_jobs SET remotion_render_id = ?, render_status = 'rendering', started_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
        ).bind(renderResult.renderId, renderJobId).run();
        await env.DB.prepare(
          `UPDATE video_posts SET status = 'rendering', updated_at = datetime('now') WHERE id = ?`
        ).bind(videoPostId).run();
        await logEvent(env.DB, videoPostId, 'render', 'started', `Remotion render triggered: ${renderResult.renderId}`);
      } else {
        await logEvent(env.DB, videoPostId, 'render', 'queued', renderResult.error || 'Render queued');
      }

      return success({
        video_post_id: videoPostId,
        status: renderResult.success ? 'rendering' : 'queued_render',
        llm_eval_score: bestScore,
        llm_eval_attempts: totalAttempts,
        slides_count: finalPayload.slides.length,
        estimated_duration_sec: finalPayload.metadata.totalDurationSec,
        slides_preview: finalPayload.slides.map(s => ({ type: s.type, text: s.text.substring(0, 50), durationSec: s.durationSec })),
      }, requestId, 201);

    } catch (llmErr: any) {
      // LLM failed — fall through to direct render with original script
      console.error(`[VideoPost] LLM pipeline error: ${llmErr.message}`);
      await logEvent(env.DB, videoPostId, 'llm_pipeline', 'failed', `LLM error: ${llmErr.message}. Falling back to direct render.`);
    }
  }

  // Direct render flow (no LLM or LLM failed)
  const renderJobId = generateId('vr_');
  await env.DB.prepare(
    `INSERT INTO video_render_jobs (id, video_post_id, remotion_composition, input_payload_json, render_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'queued', datetime('now'), datetime('now'))`
  ).bind(renderJobId, videoPostId, template_type === 'slideshow' ? 'Slideshow' : 'Explainer', JSON.stringify(slidesPayload)).run();

  const renderResult = await triggerRemotionRender(env, videoPostId, renderJobId, slidesPayload);
  if (renderResult.success && renderResult.renderId) {
    await env.DB.prepare(
      `UPDATE video_render_jobs SET remotion_render_id = ?, render_status = 'rendering', started_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    ).bind(renderResult.renderId, renderJobId).run();
    await env.DB.prepare(
      `UPDATE video_posts SET status = 'rendering', updated_at = datetime('now') WHERE id = ?`
    ).bind(videoPostId).run();
    await logEvent(env.DB, videoPostId, 'render', 'started', `Remotion render triggered: ${renderResult.renderId}`);
  } else {
    await env.DB.prepare(
      `UPDATE video_posts SET status = 'queued_render', updated_at = datetime('now') WHERE id = ?`
    ).bind(videoPostId).run();
    await logEvent(env.DB, videoPostId, 'render', 'queued', renderResult.error || 'Render queued');
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

  // Fetch generation costs
  const costs = await env.DB.prepare(
    'SELECT * FROM video_generation_costs WHERE video_post_id = ? ORDER BY created_at ASC'
  ).bind(videoPostId).all();

  // Aggregate costs by type
  const costsByType: Record<string, { count: number; total: number }> = {};
  let totalCost = 0;
  for (const c of (costs.results || []) as any[]) {
    if (!costsByType[c.cost_type]) costsByType[c.cost_type] = { count: 0, total: 0 };
    costsByType[c.cost_type].count++;
    costsByType[c.cost_type].total += c.amount_usd || 0;
    totalCost += c.amount_usd || 0;
  }

  return success({
    ...post,
    targets: targets.results || [],
    render_jobs: renderJobs.results || [],
    events: events.results || [],
    generation_costs: costs.results || [],
    costs_summary: { by_type: costsByType, total_usd: totalCost },
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
    else if (['queued', 'script_rewriting', 'evaluating_script', 'script_approved', 'generating_images', 'images_ready'].includes(post.status)) {
      // Reset to beginning of LLM pipeline
      retryStage = 'llm_pipeline';
    }
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

    await logEvent(env.DB, videoPostId, 'render', 'retry', `Render retry #${post.retry_count + 1}`);

    // Trigger Remotion Lambda render
    const renderResult = await triggerRemotionRender(env, videoPostId, renderJobId, slidesPayload);

    if (renderResult.success) {
      await env.DB.prepare(
        `UPDATE video_render_jobs SET render_status = 'rendering', remotion_render_id = ?, started_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
      ).bind(renderResult.renderId, renderJobId).run();

      await env.DB.prepare(
        `UPDATE video_posts SET status = 'rendering', updated_at = datetime('now') WHERE id = ?`
      ).bind(videoPostId).run();

      await logEvent(env.DB, videoPostId, 'render', 'started', `Remotion render triggered: ${renderResult.renderId}`);

      return success({ status: 'rendering', render_job_id: renderJobId, render_id: renderResult.renderId }, requestId);
    }

    // Lambda not configured or failed — stay in queued_render
    await env.DB.prepare(
      `UPDATE video_posts SET status = 'queued_render', updated_at = datetime('now') WHERE id = ?`
    ).bind(videoPostId).run();

    await logEvent(env.DB, videoPostId, 'render', 'failed', `Render trigger failed: ${renderResult.error}`);

    return success({ status: 'queued_render', retry_count: post.retry_count + 1, error: renderResult.error }, requestId);
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

  if (retryStage === 'llm_pipeline') {
    // Reset to beginning of LLM pipeline
    await env.DB.prepare(
      `UPDATE video_posts SET status = 'queued', llm_eval_attempts = 0, llm_eval_score = NULL, llm_eval_feedback = NULL, llm_rewritten_script = NULL, updated_at = datetime('now') WHERE id = ?`
    ).bind(videoPostId).run();

    await logEvent(env.DB, videoPostId, 'llm_pipeline', 'retry', `LLM pipeline retry #${post.retry_count + 1}`);

    return success({ status: 'queued', retry_count: post.retry_count + 1, message: 'Queued for LLM pipeline on next cron cycle' }, requestId);
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

  // Verify HMAC — Remotion signs JSON.stringify(body) and prefixes with "sha512="
  const bodyText = await request.text();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(bodyText));
  const expectedSig = `sha512=${arrayBufferToHex(sig)}`;

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
// Variant Generation
// ============================================

/**
 * POST /api/admin/video-posts/generate-variants
 * Generate A/B test variants from a base script with hook/CTA/duration combinations.
 */
export async function generateVariants(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const requestId = generateRequestId();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON body');
  }

  const {
    topic_id,
    episode_number,
    script_text,
    hook_variants,
    cta_variants,
    durations,
    self_score,
    platforms,
    publish_mode,
    template_type,
    internal_title,
    caption_text,
    hashtags_text,
    bgm_preset,
  } = body;

  if (!topic_id || typeof topic_id !== 'string') {
    return errors.badRequest(requestId, 'topic_id is required');
  }
  if (!episode_number || typeof episode_number !== 'number') {
    return errors.badRequest(requestId, 'episode_number must be a number');
  }
  if (!script_text || typeof script_text !== 'string') {
    return errors.badRequest(requestId, 'script_text is required');
  }
  if (!hook_variants || !Array.isArray(hook_variants) || hook_variants.length === 0) {
    return errors.badRequest(requestId, 'hook_variants[] is required (at least 1)');
  }
  if (!cta_variants || !Array.isArray(cta_variants) || cta_variants.length === 0) {
    return errors.badRequest(requestId, 'cta_variants[] is required (at least 1)');
  }
  if (!durations || !Array.isArray(durations) || durations.length === 0) {
    return errors.badRequest(requestId, 'durations[] is required (e.g. [33, 39, 45])');
  }
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return errors.badRequest(requestId, 'platforms[] is required');
  }

  const hookLabels = 'ABCDEFGHIJ';
  const variants: any[] = [];
  let variantCounter = 1;

  // Build base enhanced payload from script
  const basePayload = buildEnhancedSlidesPayload(
    script_text,
    template_type || 'slideshow',
    internal_title || `${topic_id}_EP${String(episode_number).padStart(2, '0')}`,
    caption_text || '',
    hashtags_text || '',
    bgm_preset || 'none',
  );

  // Cartesian product: hooks × CTAs × durations
  for (let hi = 0; hi < hook_variants.length; hi++) {
    for (let ci = 0; ci < cta_variants.length; ci++) {
      for (const dur of durations) {
        const hookLabel = hookLabels[hi] || `H${hi}`;
        const ctaLabel = String(ci + 1);
        const variantId = `YTShorts_${topic_id}_EP${String(episode_number).padStart(2, '0')}_HOOK${hookLabel}_CTA${ctaLabel}_LEN${dur}_V${String(variantCounter).padStart(2, '0')}`;

        // Clone base slides and replace hook + CTA text
        let variantSlides = basePayload.slides.map(s => ({ ...s }));

        // Replace first slide (hook) text
        if (variantSlides.length > 0) {
          variantSlides[0].text = hook_variants[hi];
        }

        // Replace last slide (CTA) text
        if (variantSlides.length > 1) {
          variantSlides[variantSlides.length - 1].text = cta_variants[ci];
        }

        // Scale to target duration
        variantSlides = scaleSlidesToDuration(variantSlides, dur);

        const totalDurationSec = variantSlides.reduce((sum: number, s: Slide) => sum + s.durationSec, 0);

        const variantPayload: SlidesPayload = {
          ...basePayload,
          title: variantId,
          slides: variantSlides,
          metadata: {
            ...basePayload.metadata,
            totalDurationSec,
            totalSlides: variantSlides.length,
          },
        };

        const videoPostId = generateId('vp_');
        const renderJobId = generateId('vr_');

        // Insert video_post
        await env.DB.prepare(
          `INSERT INTO video_posts (
            id, internal_title, template_type, script_text, slides_json, slides_count,
            caption_text, hashtags_text, yt_title, yt_visibility, bgm_preset,
            status, publish_mode, variant_id, topic_id, episode_number,
            hook_type, cta_type, duration_target_sec, self_score_json, parent_post_id,
            created_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unlisted', ?, 'queued_render', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
        ).bind(
          videoPostId,
          variantId,
          template_type || 'slideshow',
          script_text,
          JSON.stringify(variantPayload),
          variantSlides.length,
          caption_text || variantPayload.caption,
          hashtags_text || variantPayload.hashtags.join(' '),
          variantId, // yt_title = variant_id for tracking
          bgm_preset || 'none',
          publish_mode || 'draft',
          variantId,
          topic_id,
          episode_number,
          hookLabel,
          ctaLabel,
          dur,
          self_score ? JSON.stringify(self_score) : null,
          null, // parent_post_id
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
          ) VALUES (?, ?, 'Slideshow', ?, 'queued', datetime('now'), datetime('now'))`
        ).bind(renderJobId, videoPostId, JSON.stringify(variantPayload)).run();

        await logEvent(env.DB, videoPostId, 'variant', 'created',
          `Variant ${variantId}: hook=${hookLabel}, cta=${ctaLabel}, dur=${dur}s`,
          { variantId, hookType: hookLabel, ctaType: ctaLabel, duration: dur }
        );

        variants.push({
          video_post_id: videoPostId,
          variant_id: variantId,
          hook_type: hookLabel,
          cta_type: ctaLabel,
          duration_target: dur,
          slides_count: variantSlides.length,
          actual_duration: totalDurationSec,
        });

        variantCounter++;
      }
    }
  }

  return success({
    variants_created: variants.length,
    topic_id,
    episode_number,
    variants,
  }, requestId, 201);
}

// ============================================
// Metrics API
// ============================================

/**
 * POST /api/admin/video-posts/:id/metrics
 * Add PDCA metrics at a checkpoint (1h, 6h, 24h, 72h).
 */
export async function addVideoMetrics(request: Request, env: Env, videoPostId: string): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const requestId = generateRequestId();

  const post = await env.DB.prepare('SELECT id FROM video_posts WHERE id = ? AND visibility = ?')
    .bind(videoPostId, 'visible').first();
  if (!post) return errors.notFound(requestId, 'Video post');

  let body: any;
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON body');
  }

  const { checkpoint, views, likes, comments, shares, retention_3s, retention_5s, completion_rate, ctr, avg_view_duration_sec } = body;

  if (!checkpoint || !['1h', '6h', '24h', '72h'].includes(checkpoint)) {
    return errors.badRequest(requestId, 'checkpoint must be one of: 1h, 6h, 24h, 72h');
  }

  const metricsId = generateId('vm_');
  await env.DB.prepare(
    `INSERT INTO video_pdca_metrics (
      id, video_post_id, checkpoint, views, likes, comments, shares,
      retention_3s, retention_5s, completion_rate, ctr, avg_view_duration_sec,
      measured_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(
    metricsId, videoPostId, checkpoint,
    views || 0, likes || 0, comments || 0, shares || 0,
    retention_3s ?? null, retention_5s ?? null, completion_rate ?? null,
    ctr ?? null, avg_view_duration_sec ?? null,
  ).run();

  return success({ metrics_id: metricsId, checkpoint }, requestId, 201);
}

/**
 * GET /api/admin/video-posts/:id/metrics
 * List all PDCA metrics for a video post.
 */
export async function getVideoMetrics(request: Request, env: Env, videoPostId: string): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const requestId = generateRequestId();

  const metrics = await env.DB.prepare(
    `SELECT * FROM video_pdca_metrics WHERE video_post_id = ? ORDER BY created_at ASC`
  ).bind(videoPostId).all();

  // Determine next suggested checkpoint
  const existingCheckpoints = (metrics.results || []).map((m: any) => m.checkpoint);
  const allCheckpoints = ['1h', '6h', '24h', '72h'];
  const nextCheckpoint = allCheckpoints.find(cp => !existingCheckpoints.includes(cp)) || null;

  return success({
    metrics: metrics.results || [],
    next_suggested_checkpoint: nextCheckpoint,
  }, requestId);
}

// ============================================
// PDCA Analysis Engine
// ============================================

interface AnalysisThresholds {
  retention_3s_min: number;
  completion_rate_min: number;
  comment_rate_min: number;
  share_rate_min: number;
}

const DEFAULT_THRESHOLDS: AnalysisThresholds = {
  retention_3s_min: 70, // %
  completion_rate_min: 30, // %
  comment_rate_min: 2, // % (comments / views * 100)
  share_rate_min: 1, // % (shares / views * 100)
};

/**
 * POST /api/admin/video-posts/analyze
 * Rule-based PDCA analysis for variants of a topic/episode.
 */
export async function analyzeVariants(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;

  const requestId = generateRequestId();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON body');
  }

  const { topic_id, episode_number, thresholds } = body;

  if (!topic_id) return errors.badRequest(requestId, 'topic_id is required');

  const th: AnalysisThresholds = { ...DEFAULT_THRESHOLDS, ...(thresholds || {}) };

  // Fetch all variants for this topic/episode
  let query = `SELECT vp.*,
    (SELECT json_group_array(json_object(
      'checkpoint', m.checkpoint, 'views', m.views, 'likes', m.likes,
      'comments', m.comments, 'shares', m.shares,
      'retention_3s', m.retention_3s, 'retention_5s', m.retention_5s,
      'completion_rate', m.completion_rate, 'ctr', m.ctr,
      'avg_view_duration_sec', m.avg_view_duration_sec
    )) FROM video_pdca_metrics m WHERE m.video_post_id = vp.id) as metrics_json
    FROM video_posts vp WHERE vp.topic_id = ? AND vp.visibility = 'visible'`;

  const binds: any[] = [topic_id];
  if (episode_number) {
    query += ' AND vp.episode_number = ?';
    binds.push(episode_number);
  }
  query += ' ORDER BY vp.created_at ASC';

  const stmt = env.DB.prepare(query);
  const result = binds.length > 1 ? await stmt.bind(...binds).all() : await stmt.bind(binds[0]).all();
  const posts = result.results || [];

  if (posts.length === 0) {
    return errors.notFound(requestId, 'No variants found for this topic');
  }

  // Analyze each variant
  const variantAnalysis: any[] = [];
  const weaknesses: any[] = [];
  const keepPoints: string[] = [];
  let bestVariant: any = null;
  let bestViews = -1;

  for (const post of posts as any[]) {
    let metrics: any[] = [];
    try {
      metrics = JSON.parse(post.metrics_json || '[]');
    } catch { metrics = []; }

    // Use the latest checkpoint metrics
    const latestMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null;

    const analysis: any = {
      variant_id: post.variant_id,
      video_post_id: post.id,
      hook_type: post.hook_type,
      cta_type: post.cta_type,
      duration_target: post.duration_target_sec,
      checkpoints_recorded: metrics.length,
      latest_metrics: latestMetrics,
      weaknesses: [] as string[],
      strengths: [] as string[],
    };

    if (latestMetrics) {
      const views = latestMetrics.views || 0;

      // Track best variant by views
      if (views > bestViews) {
        bestViews = views;
        bestVariant = post.variant_id;
      }

      // Hook weakness: retention_3s < threshold
      if (latestMetrics.retention_3s !== null && latestMetrics.retention_3s < th.retention_3s_min) {
        analysis.weaknesses.push('hook_weak');
        weaknesses.push({
          variant_id: post.variant_id,
          weakness: 'hook_weak',
          cause: `3s retention ${latestMetrics.retention_3s}% < ${th.retention_3s_min}%`,
          suggestion: 'Try more provocative hook, larger font, faster reveal',
        });
      } else if (latestMetrics.retention_3s !== null) {
        analysis.strengths.push(`Strong hook (${latestMetrics.retention_3s}% retention at 3s)`);
      }

      // Duration weakness: completion_rate < threshold
      if (latestMetrics.completion_rate !== null && latestMetrics.completion_rate < th.completion_rate_min) {
        analysis.weaknesses.push('too_long_or_boring');
        weaknesses.push({
          variant_id: post.variant_id,
          weakness: 'too_long_or_boring',
          cause: `Completion rate ${latestMetrics.completion_rate}% < ${th.completion_rate_min}%`,
          suggestion: 'Shorten duration, add more visual transitions, cut filler',
        });
      } else if (latestMetrics.completion_rate !== null) {
        analysis.strengths.push(`Good completion rate (${latestMetrics.completion_rate}%)`);
        keepPoints.push(`${post.variant_id}: completion rate ${latestMetrics.completion_rate}%`);
      }

      // CTA weakness: comment_rate < threshold
      if (views > 0) {
        const commentRate = (latestMetrics.comments / views) * 100;
        if (commentRate < th.comment_rate_min) {
          analysis.weaknesses.push('cta_weak');
          weaknesses.push({
            variant_id: post.variant_id,
            weakness: 'cta_weak',
            cause: `Comment rate ${commentRate.toFixed(1)}% < ${th.comment_rate_min}%`,
            suggestion: 'Add question in CTA, use controversy, ask for opinion',
          });
        }

        const shareRate = (latestMetrics.shares / views) * 100;
        if (shareRate < th.share_rate_min) {
          analysis.weaknesses.push('not_shareable');
          weaknesses.push({
            variant_id: post.variant_id,
            weakness: 'not_shareable',
            cause: `Share rate ${shareRate.toFixed(1)}% < ${th.share_rate_min}%`,
            suggestion: 'Add surprising fact, controversial take, or emotional peak',
          });
        } else {
          analysis.strengths.push(`Shareable content (${shareRate.toFixed(1)}% share rate)`);
          keepPoints.push(`${post.variant_id}: share rate ${shareRate.toFixed(1)}%`);
        }
      }
    }

    variantAnalysis.push(analysis);
  }

  // Aggregate unique weaknesses
  const uniqueWeaknesses = [...new Set(weaknesses.map(w => w.weakness))];

  // Generate next variant suggestions
  const nextVariantSpecs: string[] = [];
  if (uniqueWeaknesses.includes('hook_weak')) {
    nextVariantSpecs.push('Create HOOK_E/F variants with question-based or shock-value hooks');
  }
  if (uniqueWeaknesses.includes('too_long_or_boring')) {
    nextVariantSpecs.push('Create LEN27/LEN30 shorter variants');
  }
  if (uniqueWeaknesses.includes('cta_weak')) {
    nextVariantSpecs.push('Create CTA4/CTA5 variants with question-based CTAs');
  }
  if (bestVariant) {
    nextVariantSpecs.push(`Use ${bestVariant} as base for iteration`);
  }

  // Save suggestion to DB
  const suggestionId = generateId('vs_');
  await env.DB.prepare(
    `INSERT INTO video_improvement_suggestions (
      id, topic_id, episode_number, weakness, cause, suggestions_json,
      next_variants_json, keep_points_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    suggestionId,
    topic_id,
    episode_number || null,
    uniqueWeaknesses.join(', ') || 'none',
    weaknesses.length > 0 ? weaknesses.map(w => w.cause).join('; ') : 'No weaknesses detected',
    JSON.stringify(weaknesses.map(w => w.suggestion)),
    JSON.stringify(nextVariantSpecs),
    JSON.stringify(keepPoints),
  ).run();

  return success({
    topic_id,
    episode_number,
    variants_analyzed: variantAnalysis.length,
    best_variant: bestVariant,
    best_views: bestViews,
    weaknesses: uniqueWeaknesses,
    weakness_details: weaknesses,
    keep_points: keepPoints,
    next_variant_suggestions: nextVariantSpecs,
    variant_analysis: variantAnalysis,
    suggestion_id: suggestionId,
  }, requestId);
}

// ============================================
// Cost Recording Helper
// ============================================

async function recordCost(
  db: D1Database,
  videoPostId: string,
  costType: string,
  amountUsd: number,
  inputTokens?: number,
  outputTokens?: number,
  model?: string,
  metadata?: Record<string, unknown>,
) {
  await db.prepare(
    `INSERT INTO video_generation_costs (id, video_post_id, cost_type, amount_usd, input_tokens, output_tokens, model, metadata_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    generateId('vc_'),
    videoPostId,
    costType,
    amountUsd,
    inputTokens ?? null,
    outputTokens ?? null,
    model ?? null,
    metadata ? JSON.stringify(metadata) : null,
  ).run();
}

// ============================================
// Cron Job: Process Video Post Pipeline
// ============================================

export async function processVideoPostJobs(env: Env): Promise<void> {
  console.log('[VideoJobs] Starting video post job processing');

  const anthropicKey = (env as any).OPENROUTER_API_KEY;
  const stabilityKey = (env as any).STABILITY_API_KEY;

  // ── Stage 1: queued → script_rewriting (LLM rewrite) ──
  if (anthropicKey) {
    const queuedPosts = await env.DB.prepare(
      `SELECT vp.* FROM video_posts vp WHERE vp.status = 'queued' AND vp.visibility = 'visible' LIMIT 1`
    ).all<any>();

    for (const post of queuedPosts.results || []) {
      try {
        await env.DB.prepare(
          `UPDATE video_posts SET status = 'script_rewriting', updated_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();

        await logEvent(env.DB, post.id, 'llm_rewrite', 'started', 'LLM script rewrite started');

        const targetDuration = Math.max(15, Math.min(45,
          post.duration_target_sec || 30
        ));

        const result = await rewriteScript(anthropicKey, post.script_text, targetDuration);

        // Save rewritten script
        await env.DB.prepare(
          `UPDATE video_posts SET llm_rewritten_script = ?, status = 'evaluating_script', updated_at = datetime('now') WHERE id = ?`
        ).bind(result.rewrittenScript, post.id).run();

        // Rebuild slides from rewritten script
        const slidesPayload = buildEnhancedSlidesPayload(
          result.rewrittenScript,
          post.template_type,
          post.internal_title,
          post.caption_text || '',
          post.hashtags_text || '',
          post.bgm_preset || 'none',
        );

        // Enforce 15-45s duration
        const clampedDuration = Math.max(15, Math.min(45, slidesPayload.metadata.totalDurationSec));
        slidesPayload.slides = scaleSlidesToDuration(slidesPayload.slides, clampedDuration);
        slidesPayload.metadata.totalDurationSec = slidesPayload.slides.reduce((sum, s) => sum + s.durationSec, 0);

        await env.DB.prepare(
          `UPDATE video_posts SET slides_json = ?, slides_count = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(JSON.stringify(slidesPayload), slidesPayload.slides.length, post.id).run();

        await recordCost(env.DB, post.id, 'llm_rewrite', result.costUsd, result.inputTokens, result.outputTokens, 'claude-sonnet-4-6');

        await logEvent(env.DB, post.id, 'llm_rewrite', 'success',
          `Script rewritten: ${result.outputTokens} output tokens, $${result.costUsd.toFixed(4)}`,
          { inputTokens: result.inputTokens, outputTokens: result.outputTokens, cost: result.costUsd }
        );
      } catch (e: any) {
        console.error(`[VideoJobs] LLM rewrite error for post ${post.id}:`, e);
        // Stay in queued state for retry on next cycle
        await env.DB.prepare(
          `UPDATE video_posts SET status = 'queued', updated_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();
        await logEvent(env.DB, post.id, 'llm_rewrite', 'failed', e.message);
      }
    }
  }

  // ── Stage 2: evaluating_script → score loop ──
  if (anthropicKey) {
    const evalPosts = await env.DB.prepare(
      `SELECT vp.* FROM video_posts vp WHERE vp.status = 'evaluating_script' AND vp.visibility = 'visible' LIMIT 1`
    ).all<any>();

    for (const post of evalPosts.results || []) {
      try {
        const scriptToEval = post.llm_rewritten_script || post.script_text;
        const attempts = (post.llm_eval_attempts || 0) + 1;

        await logEvent(env.DB, post.id, 'llm_eval', 'started', `Evaluation attempt #${attempts}`);

        const evalResult = await evaluateScript(anthropicKey, scriptToEval);

        await recordCost(env.DB, post.id, 'llm_eval', evalResult.costUsd, evalResult.inputTokens, evalResult.outputTokens, 'claude-sonnet-4-6',
          { attempt: attempts, score: evalResult.score }
        );

        await logEvent(env.DB, post.id, 'llm_eval', 'completed',
          `Score: ${evalResult.score}/100 (attempt #${attempts}). Breakdown: H${evalResult.breakdown.hook}/P${evalResult.breakdown.pacing}/C${evalResult.breakdown.clarity}/CTA${evalResult.breakdown.cta}/E${evalResult.breakdown.emotion}`,
          { score: evalResult.score, breakdown: evalResult.breakdown, attempt: attempts }
        );

        if (evalResult.score >= 90) {
          // Passed! Move to image generation
          await env.DB.prepare(
            `UPDATE video_posts SET
              llm_eval_score = ?, llm_eval_attempts = ?, llm_eval_feedback = ?,
              status = 'script_approved', updated_at = datetime('now')
             WHERE id = ?`
          ).bind(evalResult.score, attempts, JSON.stringify(evalResult), post.id).run();

          await logEvent(env.DB, post.id, 'llm_eval', 'success',
            `Script approved with score ${evalResult.score}/100 after ${attempts} attempt(s)`
          );
        } else if (attempts >= 10) {
          // Max attempts reached — use current version anyway
          await env.DB.prepare(
            `UPDATE video_posts SET
              llm_eval_score = ?, llm_eval_attempts = ?, llm_eval_feedback = ?,
              status = 'script_approved', updated_at = datetime('now')
             WHERE id = ?`
          ).bind(evalResult.score, attempts, JSON.stringify(evalResult), post.id).run();

          await logEvent(env.DB, post.id, 'llm_eval', 'warning',
            `Max attempts (10) reached. Using script with score ${evalResult.score}/100`,
            { score: evalResult.score, maxAttemptsReached: true }
          );
        } else {
          // Score too low — rewrite with feedback and stay in evaluating_script
          const rewriteResult = await rewriteScript(
            anthropicKey,
            post.script_text,
            Math.max(15, Math.min(45, post.duration_target_sec || 30)),
            evalResult.feedback,
          );

          await recordCost(env.DB, post.id, 'llm_rewrite', rewriteResult.costUsd, rewriteResult.inputTokens, rewriteResult.outputTokens, 'claude-sonnet-4-6',
            { attempt: attempts, rewriteAfterEval: true }
          );

          // Rebuild slides
          const slidesPayload = buildEnhancedSlidesPayload(
            rewriteResult.rewrittenScript,
            post.template_type,
            post.internal_title,
            post.caption_text || '',
            post.hashtags_text || '',
            post.bgm_preset || 'none',
          );
          const clampedDuration = Math.max(15, Math.min(45, slidesPayload.metadata.totalDurationSec));
          slidesPayload.slides = scaleSlidesToDuration(slidesPayload.slides, clampedDuration);
          slidesPayload.metadata.totalDurationSec = slidesPayload.slides.reduce((sum, s) => sum + s.durationSec, 0);

          await env.DB.prepare(
            `UPDATE video_posts SET
              llm_rewritten_script = ?, llm_eval_score = ?, llm_eval_attempts = ?, llm_eval_feedback = ?,
              slides_json = ?, slides_count = ?,
              status = 'evaluating_script', updated_at = datetime('now')
             WHERE id = ?`
          ).bind(
            rewriteResult.rewrittenScript,
            evalResult.score,
            attempts,
            JSON.stringify(evalResult),
            JSON.stringify(slidesPayload),
            slidesPayload.slides.length,
            post.id,
          ).run();

          await logEvent(env.DB, post.id, 'llm_eval', 'retry',
            `Score ${evalResult.score}/100 < 90. Rewriting with feedback (attempt #${attempts})`,
            { score: evalResult.score, feedback: evalResult.feedback }
          );
        }
      } catch (e: any) {
        console.error(`[VideoJobs] LLM eval error for post ${post.id}:`, e);
        await logEvent(env.DB, post.id, 'llm_eval', 'failed', e.message);
        // Stay in evaluating_script for retry next cycle
      }
    }
  }

  // ── Stage 3: script_approved → generating_images ──
  if (stabilityKey) {
    const approvedPosts = await env.DB.prepare(
      `SELECT vp.* FROM video_posts vp WHERE vp.status = 'script_approved' AND vp.visibility = 'visible' LIMIT 1`
    ).all<any>();

    for (const post of approvedPosts.results || []) {
      try {
        await env.DB.prepare(
          `UPDATE video_posts SET status = 'generating_images', updated_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();

        await logEvent(env.DB, post.id, 'image_gen', 'started', 'Generating slide images');

        const slidesPayload: SlidesPayload = JSON.parse(post.slides_json);
        const imageResult = await generateSlideImages(stabilityKey, slidesPayload.slides);

        // Update slides with generated images
        for (const img of imageResult.images) {
          if (slidesPayload.slides[img.slideIndex]) {
            (slidesPayload.slides[img.slideIndex] as any).imageUrl = img.imageDataUri;
          }
        }

        await env.DB.prepare(
          `UPDATE video_posts SET slides_json = ?, status = 'images_ready', updated_at = datetime('now') WHERE id = ?`
        ).bind(JSON.stringify(slidesPayload), post.id).run();

        // Record costs per image
        for (const cost of imageResult.costs) {
          await recordCost(env.DB, post.id, 'image_gen', cost.amountUsd, undefined, undefined, cost.model,
            { slideIndex: cost.slideIndex }
          );
        }

        await logEvent(env.DB, post.id, 'image_gen', 'success',
          `Generated ${imageResult.images.length} images, total cost: $${imageResult.totalCostUsd.toFixed(4)}`,
          { imageCount: imageResult.images.length, totalCost: imageResult.totalCostUsd }
        );
      } catch (e: any) {
        console.error(`[VideoJobs] Image gen error for post ${post.id}:`, e);
        // Fall back to script_approved so it can retry or proceed without images
        await env.DB.prepare(
          `UPDATE video_posts SET status = 'images_ready', updated_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();
        await logEvent(env.DB, post.id, 'image_gen', 'failed', `Image gen failed, proceeding without images: ${e.message}`);
      }
    }
  } else {
    // No Stability key — skip image generation, move script_approved → images_ready
    const approvedPosts = await env.DB.prepare(
      `SELECT id FROM video_posts WHERE status = 'script_approved' AND visibility = 'visible' LIMIT 3`
    ).all<any>();
    for (const post of approvedPosts.results || []) {
      await env.DB.prepare(
        `UPDATE video_posts SET status = 'images_ready', updated_at = datetime('now') WHERE id = ?`
      ).bind(post.id).run();
      await logEvent(env.DB, post.id, 'image_gen', 'skipped', 'STABILITY_API_KEY not configured, skipping image generation');
    }
  }

  // ── Stage 4: images_ready → queued_render (trigger Remotion) ──
  const readyToRender = await env.DB.prepare(
    `SELECT vp.* FROM video_posts vp WHERE vp.status = 'images_ready' AND vp.visibility = 'visible' LIMIT 1`
  ).all<any>();

  for (const post of readyToRender.results || []) {
    try {
      const slidesPayload: SlidesPayload = JSON.parse(post.slides_json);
      const renderJobId = generateId('vr_');

      await env.DB.prepare(
        `INSERT INTO video_render_jobs (
          id, video_post_id, remotion_composition, input_payload_json,
          render_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'queued', datetime('now'), datetime('now'))`
      ).bind(
        renderJobId,
        post.id,
        post.template_type === 'slideshow' ? 'Slideshow' : 'Explainer',
        post.slides_json,
      ).run();

      const renderResult = await triggerRemotionRender(env, post.id, renderJobId, slidesPayload);

      if (renderResult.success && renderResult.renderId) {
        await env.DB.prepare(
          `UPDATE video_render_jobs SET remotion_render_id = ?, render_status = 'rendering', started_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
        ).bind(renderResult.renderId, renderJobId).run();
        await env.DB.prepare(
          `UPDATE video_posts SET status = 'rendering', updated_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();
        await logEvent(env.DB, post.id, 'render', 'started', `Remotion render triggered: ${renderResult.renderId}`);
      } else {
        await env.DB.prepare(
          `UPDATE video_posts SET status = 'queued_render', updated_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();
        await logEvent(env.DB, post.id, 'render', 'queued', renderResult.error || 'Render queued (Remotion Lambda not configured yet)');
      }
    } catch (e: any) {
      console.error(`[VideoJobs] Render trigger error for post ${post.id}:`, e);
      await env.DB.prepare(
        `UPDATE video_posts SET status = 'queued_render', updated_at = datetime('now') WHERE id = ?`
      ).bind(post.id).run();
      await logEvent(env.DB, post.id, 'render', 'failed', e.message);
    }
  }

  // ── Stage 5: render_succeeded → upload to Postiz ──
  const readyToUpload = await env.DB.prepare(
    `SELECT vp.* FROM video_posts vp WHERE vp.status = 'render_succeeded' AND vp.visibility = 'visible' LIMIT 3`
  ).all<any>();

  for (const post of readyToUpload.results || []) {
    try {
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

  // ── Stage 6: queued_postiz → create Postiz post ──
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
        for (const r of result.results) {
          await env.DB.prepare(
            `UPDATE video_post_targets SET postiz_post_id = ?, target_status = ?, updated_at = datetime('now')
             WHERE video_post_id = ? AND postiz_integration_id = ?`
          ).bind(r.postId, post.publish_mode === 'draft' ? 'draft_created' : (post.publish_mode === 'scheduled' ? 'scheduled' : 'publishing'), post.id, r.integration).run();

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
