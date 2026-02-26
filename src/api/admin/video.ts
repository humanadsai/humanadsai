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
import { invokeLambda, uploadToS3 } from '../../lib/aws-sigv4';
import { rewriteScript, evaluateScript, updateKnowhow } from '../../services/llm';
import { generateSlideImages, inferCategory } from '../../services/image-generator';
import { generateTTS, inferVoicePreset, VOICE_PRESETS } from '../../services/tts';
import { generateTimestamps } from '../../services/whisper';

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

const MAX_SLIDE_LINES = 2;
const MAX_LINE_CHARS = 30; // Force-split if a single line exceeds this (JP ~25, EN ~30)
const BG_PRESETS = ['gradient_blue', 'gradient_purple', 'solid_dark', 'solid_white', 'brand'];

/**
 * Split paragraph text into slide-sized chunks.
 * Preserves LLM-authored line breaks. Max 2 lines per slide.
 * Force-splits lines exceeding 30 chars at natural break points.
 */
function splitTextToSlides(text: string): string[] {
  // Split into individual lines (preserving LLM line breaks)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Force-split any overly long lines at natural break points
  const expandedLines: string[] = [];
  for (const line of lines) {
    if (line.length <= MAX_LINE_CHARS) {
      expandedLines.push(line);
    } else {
      // Split long line at sentence/phrase boundaries
      let remaining = line;
      while (remaining.length > MAX_LINE_CHARS) {
        // Try splitting at 。
        let idx = remaining.lastIndexOf('。', MAX_LINE_CHARS);
        if (idx > 0) { expandedLines.push(remaining.substring(0, idx + 1)); remaining = remaining.substring(idx + 1).trim(); continue; }
        // Try splitting at 、
        idx = remaining.lastIndexOf('、', MAX_LINE_CHARS);
        if (idx > 0) { expandedLines.push(remaining.substring(0, idx + 1)); remaining = remaining.substring(idx + 1).trim(); continue; }
        // Try splitting at '. ' or ', '
        idx = remaining.lastIndexOf('. ', MAX_LINE_CHARS);
        if (idx <= 0) idx = remaining.lastIndexOf(', ', MAX_LINE_CHARS);
        if (idx > 0) { expandedLines.push(remaining.substring(0, idx + 1)); remaining = remaining.substring(idx + 1).trim(); continue; }
        // Try splitting at space
        idx = remaining.lastIndexOf(' ', MAX_LINE_CHARS);
        if (idx > 0) { expandedLines.push(remaining.substring(0, idx)); remaining = remaining.substring(idx + 1).trim(); continue; }
        // Force split
        expandedLines.push(remaining.substring(0, MAX_LINE_CHARS));
        remaining = remaining.substring(MAX_LINE_CHARS).trim();
      }
      if (remaining) expandedLines.push(remaining);
    }
  }

  // Group into slides of max MAX_SLIDE_LINES lines
  const slides: string[] = [];
  for (let i = 0; i < expandedLines.length; i += MAX_SLIDE_LINES) {
    const chunk = expandedLines.slice(i, i + MAX_SLIDE_LINES);
    slides.push(chunk.join('\n'));
  }

  return slides.length > 0 ? slides : [text];
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
      const para = paragraphs[pi].trim();
      if (!para) continue;

      const subSlides = splitTextToSlides(para);

      for (const text of subSlides) {
        const isFirst = slides.length === 0;
        const plainText = text.replace(/\n/g, ' ');
        // Detect emphasis: contains numbers, or short impactful sentence
        const isEmphasis = !isFirst && (
          /\d+[%％万億件]/.test(plainText) ||
          (plainText.length <= 30 && (plainText.endsWith('！') || plainText.endsWith('!') || plainText.endsWith('。')))
        );
        const lineCount = text.split('\n').length;

        slides.push({
          type: isFirst ? 'hook' : (isEmphasis ? 'emphasis' : 'body'),
          text,
          durationSec: isFirst ? 3 : (isEmphasis ? 3 : Math.min(5, Math.max(3, Math.ceil(lineCount * 1.5)))),
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
  const defaultHashtags = ['#OpenClaw', '#RentAHuman'];
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

      // Slide-aware processing (preserve LLM line breaks)
      const subSlides = splitTextToSlides(para);

      for (const text of subSlides) {
        const emphasisWords = extractEmphasisWords(text);
        const cleanText = text.replace(/[「」\*]/g, '');
        const plainText = cleanText.replace(/\n/g, ' ');

        // Detect emphasis: numbers, short impactful
        const isEmphasis = !isFirst && (
          /\d+[%％万億件]/.test(plainText) ||
          (plainText.length <= 30 && (plainText.endsWith('！') || plainText.endsWith('!') || plainText.endsWith('。')))
        );
        const hasDanger = isDangerContent(plainText);

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

        const lineCount = cleanText.split('\n').length;
        slides.push({
          type: isFirst ? 'hook' : (isEmphasis ? 'emphasis' : 'body'),
          text: cleanText,
          durationSec: isFirst ? 3 : (isEmphasis ? 3 : Math.min(5, Math.max(3, Math.ceil(lineCount * 1.5)))),
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
  const defaultHashtags = ['#OpenClaw', '#RentAHuman'];
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
// Auto-fill Helpers (generate metadata from script)
// ============================================

// Keyword → hashtag mapping for Japanese content
const HASHTAG_KEYWORDS: Record<string, string> = {
  'AI': '#AI', '人工知能': '#AI', 'ChatGPT': '#ChatGPT', 'GPT': '#GPT',
  'OpenAI': '#OpenAI', 'Google': '#Google', 'Apple': '#Apple',
  'プログラミング': '#プログラミング', 'エンジニア': '#エンジニア',
  '投資': '#投資', '株': '#株式投資', '仮想通貨': '#仮想通貨', 'ビットコイン': '#ビットコイン',
  'お金': '#お金の話', '副業': '#副業', '年収': '#年収', '節約': '#節約',
  '健康': '#健康', 'ダイエット': '#ダイエット', '筋トレ': '#筋トレ', '睡眠': '#睡眠',
  '詐欺': '#注意喚起', '危険': '#注意喚起', 'やばい': '#やばい',
  '習慣': '#習慣', 'ルーティン': '#モーニングルーティン', '朝活': '#朝活',
  'ビジネス': '#ビジネス', '起業': '#起業', 'スタートアップ': '#スタートアップ',
  'テクノロジー': '#テクノロジー', 'ロボット': '#ロボット',
  '科学': '#サイエンス', '宇宙': '#宇宙', '歴史': '#歴史',
  'ゲーム': '#ゲーム', 'チェス': '#チェス',
  'マーケティング': '#マーケティング', 'SNS': '#SNS',
  '英語': '#英語学習', '勉強': '#勉強法',
};

/**
 * Generate a caption from the rewritten script.
 * Uses first 2-3 lines as a teaser + CTA.
 */
function generateCaptionFromScript(script: string): string {
  const lines = script.split('\n').map(l => l.replace(/[「」\*#]/g, '').trim()).filter(Boolean);
  const teaserLines = lines.slice(0, 3).join('\n');
  const caption = lines.length > 3
    ? teaserLines + '\n\n▶ 続きは動画で'
    : teaserLines;
  return caption.slice(0, 300);
}

/**
 * Generate hashtags from script content using keyword matching.
 */
function generateHashtagsFromScript(script: string): string {
  const lower = script.toLowerCase();
  const found = new Set<string>();
  for (const [kw, tag] of Object.entries(HASHTAG_KEYWORDS)) {
    if (lower.includes(kw.toLowerCase())) {
      found.add(tag);
    }
  }
  found.add('#Shorts');
  return [...found].slice(0, 8).join(' ');
}

/**
 * Generate a YouTube title from the script's first line (hook).
 * Adds "…" for curiosity if truncated.
 */
function generateYtTitleFromScript(script: string): string {
  const firstLine = script.split('\n').map(l => l.trim()).filter(Boolean)[0] || '';
  const clean = firstLine.replace(/[「」\*#]/g, '').trim();
  if (clean.length > 60) return clean.slice(0, 60) + '…';
  return clean;
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

  // Replace base64 data URIs with proxy URLs to keep Lambda payload under 256KB.
  // Remotion Lambda fetches images via GET /api/internal/slide-image/:vpId/:idx
  const lightPayload = JSON.parse(JSON.stringify(payload));
  let replacedCount = 0;
  if (lightPayload.slides) {
    for (let i = 0; i < lightPayload.slides.length; i++) {
      const slide = lightPayload.slides[i];
      if (slide.imageUrl && slide.imageUrl.startsWith('data:')) {
        slide.imageUrl = `${appUrl}/api/internal/slide-image/${videoPostId}/${i}`;
        replacedCount++;
      }
    }
  }
  console.log(`[Render] Payload: ${lightPayload.slides?.length} slides, ${replacedCount} base64→URL replaced, videoPostId=${videoPostId}`);

  // Remotion Lambda payload — must match SDK's renderMediaOnLambda() format exactly.
  // inputProps are wrapped in { type: 'payload', payload: '<json>' } for inline serialization.
  const remotionVersion = (env as any).REMOTION_VERSION || '4.0.242';
  const serializedInputProps = {
    type: 'payload',
    payload: JSON.stringify(lightPayload),
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
    audioCodec: 'aac',
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
        videoPost.hashtags_text || '#OpenClaw #RentAHuman',
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

  // Postiz API requires `date` (ISO 8601) and `tags` (array) for all post types
  const postDate = (postizType === 'schedule' && videoPost.scheduled_at)
    ? new Date(videoPost.scheduled_at).toISOString()
    : new Date().toISOString();

  const postTags = videoPost.hashtags_text
    ? videoPost.hashtags_text.split(/[\s,]+/).filter((h: string) => h.startsWith('#')).map((h: string) => ({ value: h.replace('#', ''), label: h.replace('#', '') }))
    : [];

  const body: any = {
    type: postizType,
    shortLink: false,
    date: postDate,
    tags: postTags,
    posts,
  };

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
export async function createVideoPost(request: Request, env: Env, ctx?: ExecutionContext): Promise<Response> {
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

  // Validate script has enough content (basic check)
  if (script_text.trim().split('\n').filter(l => l.trim()).length < 2) {
    return errors.badRequest(requestId, 'Script produced too few lines. Add more content.');
  }

  // Convert scheduled_at to UTC if provided
  let scheduledAtUtc: string | null = null;
  if (body.scheduled_at) {
    scheduledAtUtc = new Date(body.scheduled_at).toISOString();
  }

  const openrouterKey = (env as any).OPENROUTER_API_KEY;

  // Require LLM pipeline — without OpenRouter key, video creation is not supported
  if (!openrouterKey) {
    return error('LLM_NOT_CONFIGURED', 'OPENROUTER_API_KEY is not configured. Video creation requires the LLM pipeline.', requestId, 503);
  }

  const videoPostId = generateId('vp_');

  // Validate voice_preset if provided
  const voicePreset = body.voice_preset || null;
  if (voicePreset && !VOICE_PRESETS[voicePreset]) {
    return errors.badRequest(requestId, `Invalid voice_preset: ${voicePreset}. Valid: ${Object.keys(VOICE_PRESETS).join(', ')}`);
  }

  // Insert video_post with raw script only (slides built AFTER LLM rewrite in Stage 2)
  await env.DB.prepare(
    `INSERT INTO video_posts (
      id, internal_title, template_type, script_text, slides_json, slides_count,
      caption_text, hashtags_text, yt_title, yt_visibility, cta_text, bgm_preset,
      voice_preset, status, publish_mode, scheduled_at, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(
    videoPostId,
    internal_title,
    template_type,
    script_text,
    '{"slides":[],"metadata":{"totalDurationSec":0}}',
    0,
    body.caption_text || '',
    body.hashtags_text || '',
    body.yt_title || internal_title,
    body.yt_visibility || 'public',
    body.cta_text || null,
    body.bgm_preset || 'none',
    voicePreset,
    'script_rewriting',
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

  await logEvent(env.DB, videoPostId, 'pipeline', 'started', 'LLM pipeline started (rewrite → eval → images → render)');

  // ── LLM Pipeline: Rewrite + Eval (runs in waitUntil, ~25s) ──
  // After completion, cron picks up `script_approved` → images → render.
  {
    const targetDuration = Math.max(15, Math.min(45, body.duration_target_sec || 30));

    const inlinePromise = (async () => {
      try {
        // Step 0: Fetch persistent knowhow rules (PDCA)
        const knowhowRow = await env.DB.prepare('SELECT rules_text, version FROM video_knowhow WHERE id = ?').bind('global').first<any>();
        const pastLearnings = knowhowRow?.rules_text || await buildEvalKnowhow(env.DB);
        if (pastLearnings) {
          await logEvent(env.DB, videoPostId, 'llm_knowhow', 'info', `PDCA knowhow v${knowhowRow?.version || 0} injected: ${pastLearnings.length} chars`);
        }

        // Rewrite script (~15s)
        await logEvent(env.DB, videoPostId, 'llm_rewrite', 'started', 'LLM script rewrite started');
        const rewriteResult = await rewriteScript(openrouterKey, script_text, targetDuration, undefined, pastLearnings);

        await recordCost(env.DB, videoPostId, 'llm_rewrite', rewriteResult.costUsd, rewriteResult.inputTokens, rewriteResult.outputTokens, 'claude-sonnet-4');
        await logEvent(env.DB, videoPostId, 'llm_rewrite', 'success',
          `Script rewritten: ${rewriteResult.outputTokens} tokens, $${rewriteResult.costUsd.toFixed(4)}`
        );

        await env.DB.prepare(
          `UPDATE video_posts SET llm_rewritten_script = ?, status = 'evaluating_script', updated_at = datetime('now') WHERE id = ?`
        ).bind(rewriteResult.rewrittenScript, videoPostId).run();

        // Evaluate script (~10s)
        await logEvent(env.DB, videoPostId, 'llm_eval', 'started', 'Evaluation attempt #1');
        const evalResult = await evaluateScript(openrouterKey, rewriteResult.rewrittenScript);

        await recordCost(env.DB, videoPostId, 'llm_eval', evalResult.costUsd, evalResult.inputTokens, evalResult.outputTokens, 'claude-sonnet-4',
          { attempt: 1, score: evalResult.score }
        );
        await logEvent(env.DB, videoPostId, 'llm_eval', 'completed',
          `Score: ${evalResult.score}/100. H${evalResult.breakdown.hook}/P${evalResult.breakdown.pacing}/C${evalResult.breakdown.clarity}/CTA${evalResult.breakdown.cta}/E${evalResult.breakdown.emotion}`,
          { score: evalResult.score, breakdown: evalResult.breakdown }
        );

        await env.DB.prepare(
          `UPDATE video_posts SET llm_eval_score = ?, llm_eval_attempts = 1, llm_eval_feedback = ?,
            status = 'script_approved', updated_at = datetime('now') WHERE id = ?`
        ).bind(evalResult.score, JSON.stringify(evalResult), videoPostId).run();
        await logEvent(env.DB, videoPostId, 'llm_eval', 'success',
          `Script approved with score ${evalResult.score}/100. Cron will pick up images → render.`
        );
      } catch (err: any) {
        console.error(`[VideoPost] Inline pipeline error: ${err.message}`);
        await logEvent(env.DB, videoPostId, 'pipeline', 'failed', `Rewrite/eval error: ${err.message}. Use Retry button.`);
      }
    })();

    if (ctx) {
      ctx.waitUntil(inlinePromise);
    }

    return success({
      video_post_id: videoPostId,
      status: 'script_rewriting',
      message: 'Pipeline started: rewrite → eval → images → render. Refresh to see progress.',
    }, requestId, 201);
  }
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
export async function retryVideoPost(request: Request, env: Env, videoPostId: string, ctx?: ExecutionContext): Promise<Response> {
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
    else if (['evaluating_script', 'script_approved', 'generating_images', 'images_ready'].includes(post.status) && post.llm_eval_score > 0 && post.llm_rewritten_script) {
      // Eval already completed — skip to render with rewritten script
      retryStage = 'render_from_script';
    }
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

  if (retryStage === 'render_from_script') {
    // Eval already completed — set status for cron to pick up images → render
    await env.DB.prepare(
      `UPDATE video_posts SET status = 'script_approved', updated_at = datetime('now') WHERE id = ?`
    ).bind(videoPostId).run();

    await logEvent(env.DB, videoPostId, 'pipeline', 'retry', `Retry from rewritten script (eval ${post.llm_eval_score}/100), retry #${post.retry_count + 1}. Cron will pick up.`);

    return success({
      status: 'script_approved',
      retry_count: post.retry_count + 1,
      llm_eval_score: post.llm_eval_score,
      message: 'Queued for images → render on next cron cycle (~1 min)',
    }, requestId);
  }

  if (retryStage === 'llm_pipeline') {
    // Reset — cron will pick up script_rewriting → rewrite + eval
    await env.DB.prepare(
      `UPDATE video_posts SET status = 'script_rewriting', llm_eval_attempts = 0, llm_eval_score = NULL, llm_eval_feedback = NULL, llm_rewritten_script = NULL, updated_at = datetime('now') WHERE id = ?`
    ).bind(videoPostId).run();

    await logEvent(env.DB, videoPostId, 'llm_pipeline', 'retry', `LLM pipeline retry #${post.retry_count + 1}. Cron will pick up.`);

    return success({ status: 'script_rewriting', retry_count: post.retry_count + 1, message: 'Queued for rewrite + eval on next cron cycle (~1 min)' }, requestId);
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
// Eval Knowhow: PDCA Feedback Aggregation
// ============================================

/**
 * Aggregate past eval feedback into learnings for the next rewrite.
 * Queries recent evaluated video posts and builds a structured summary.
 */
async function buildEvalKnowhow(db: D1Database, limit: number = 10): Promise<string | undefined> {
  const rows = await db.prepare(
    `SELECT llm_eval_score, llm_eval_feedback
     FROM video_posts
     WHERE llm_eval_score IS NOT NULL AND llm_eval_feedback IS NOT NULL AND llm_eval_score > 0
     ORDER BY created_at DESC LIMIT ?`
  ).bind(limit).all();

  if (!rows.results || rows.results.length === 0) return undefined;

  // Parse feedback and aggregate dimension scores
  const dimensionTotals = { hook: 0, pacing: 0, clarity: 0, cta: 0, emotion: 0 };
  const dimensionMax = { hook: 30, pacing: 20, clarity: 20, cta: 15, emotion: 15 };
  const feedbackTexts: string[] = [];
  let count = 0;

  for (const row of rows.results) {
    try {
      const evalData = JSON.parse(row.llm_eval_feedback as string);
      if (evalData.breakdown) {
        dimensionTotals.hook += evalData.breakdown.hook || 0;
        dimensionTotals.pacing += evalData.breakdown.pacing || 0;
        dimensionTotals.clarity += evalData.breakdown.clarity || 0;
        dimensionTotals.cta += evalData.breakdown.cta || 0;
        dimensionTotals.emotion += evalData.breakdown.emotion || 0;
        count++;
      }
      if (evalData.feedback) {
        feedbackTexts.push(evalData.feedback);
      }
    } catch { /* skip unparseable */ }
  }

  if (count === 0) return undefined;

  // Calculate average scores and identify weak dimensions
  const avgScores = {
    hook: Math.round(dimensionTotals.hook / count),
    pacing: Math.round(dimensionTotals.pacing / count),
    clarity: Math.round(dimensionTotals.clarity / count),
    cta: Math.round(dimensionTotals.cta / count),
    emotion: Math.round(dimensionTotals.emotion / count),
  };

  // Find weak dimensions (below 70% of max)
  const weakDimensions: string[] = [];
  for (const [dim, avg] of Object.entries(avgScores)) {
    const max = dimensionMax[dim as keyof typeof dimensionMax];
    const pct = (avg / max) * 100;
    if (pct < 70) {
      weakDimensions.push(`${dim} (avg ${avg}/${max} = ${Math.round(pct)}%)`);
    }
  }

  // Build learnings string
  const lines: string[] = [];
  lines.push(`Based on ${count} past evaluations (avg score: ${Math.round(rows.results.reduce((s, r) => s + (r.llm_eval_score as number), 0) / count)}/100):`);

  if (weakDimensions.length > 0) {
    lines.push(`\nWeak areas to improve: ${weakDimensions.join(', ')}`);
  }

  // Extract unique feedback patterns (deduplicated, last 5)
  const recentFeedback = feedbackTexts.slice(0, 5);
  if (recentFeedback.length > 0) {
    lines.push('\nRecent evaluator feedback:');
    recentFeedback.forEach((fb, i) => {
      // Truncate long feedback to keep prompt size manageable
      const truncated = fb.length > 200 ? fb.substring(0, 200) + '...' : fb;
      lines.push(`${i + 1}. ${truncated}`);
    });
  }

  return lines.join('\n');
}

/**
 * GET /api/admin/eval-knowhow — View accumulated evaluation insights
 */
export async function getEvalKnowhow(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (!authResult.success) return authResult.error!;
  const requestId = generateRequestId();

  // Get aggregated knowhow
  const rows = await env.DB.prepare(
    `SELECT llm_eval_score, llm_eval_feedback, internal_title, created_at
     FROM video_posts
     WHERE llm_eval_score IS NOT NULL AND llm_eval_feedback IS NOT NULL AND llm_eval_score > 0
     ORDER BY created_at DESC LIMIT 20`
  ).all();

  if (!rows.results || rows.results.length === 0) {
    return success({ knowhow: null, message: 'No evaluations yet', history: [] }, requestId);
  }

  // Parse all evaluations
  const history: any[] = [];
  const dimensionTotals = { hook: 0, pacing: 0, clarity: 0, cta: 0, emotion: 0 };
  const dimensionMax = { hook: 30, pacing: 20, clarity: 20, cta: 15, emotion: 15 };
  let count = 0;

  for (const row of rows.results) {
    try {
      const evalData = JSON.parse(row.llm_eval_feedback as string);
      history.push({
        title: row.internal_title,
        score: row.llm_eval_score,
        feedback: evalData.feedback,
        breakdown: evalData.breakdown,
        created_at: row.created_at,
      });
      if (evalData.breakdown) {
        dimensionTotals.hook += evalData.breakdown.hook || 0;
        dimensionTotals.pacing += evalData.breakdown.pacing || 0;
        dimensionTotals.clarity += evalData.breakdown.clarity || 0;
        dimensionTotals.cta += evalData.breakdown.cta || 0;
        dimensionTotals.emotion += evalData.breakdown.emotion || 0;
        count++;
      }
    } catch { /* skip */ }
  }

  const avgScores = count > 0 ? {
    hook: Math.round(dimensionTotals.hook / count * 10) / 10,
    pacing: Math.round(dimensionTotals.pacing / count * 10) / 10,
    clarity: Math.round(dimensionTotals.clarity / count * 10) / 10,
    cta: Math.round(dimensionTotals.cta / count * 10) / 10,
    emotion: Math.round(dimensionTotals.emotion / count * 10) / 10,
  } : null;

  const avgTotal = count > 0 ? Math.round(rows.results.reduce((s, r) => s + (r.llm_eval_score as number), 0) / count) : 0;

  // Identify weak/strong areas
  const weakAreas: string[] = [];
  const strongAreas: string[] = [];
  if (avgScores) {
    for (const [dim, avg] of Object.entries(avgScores)) {
      const max = dimensionMax[dim as keyof typeof dimensionMax];
      const pct = (avg / max) * 100;
      if (pct < 70) weakAreas.push(dim);
      else if (pct >= 85) strongAreas.push(dim);
    }
  }

  // Fetch persistent knowhow rules
  const knowhowRow = await env.DB.prepare('SELECT rules_text, version, eval_count, updated_at FROM video_knowhow WHERE id = ?').bind('global').first<any>();

  return success({
    knowhow: {
      total_evaluations: count,
      avg_score: avgTotal,
      avg_breakdown: avgScores,
      weak_areas: weakAreas,
      strong_areas: strongAreas,
      dimension_max: dimensionMax,
    },
    persistent_rules: knowhowRow ? {
      rules_text: knowhowRow.rules_text,
      version: knowhowRow.version,
      eval_count: knowhowRow.eval_count,
      updated_at: knowhowRow.updated_at,
    } : null,
    history,
  }, requestId);
}

// ============================================
// Slide Image Proxy (serves base64 images via URL for Remotion Lambda)
// ============================================

/**
 * GET /api/internal/slide-image/:videoPostId/:slideIndex
 * Serves a slide's generated image as JPEG so Remotion Lambda can fetch it by URL.
 */
export async function serveSlideImage(request: Request, env: Env, videoPostId: string, slideIndex: number): Promise<Response> {
  const post = await env.DB.prepare('SELECT slides_json FROM video_posts WHERE id = ?').bind(videoPostId).first<any>();
  if (!post?.slides_json) {
    return new Response('Not found', { status: 404 });
  }

  let slides: any[];
  try {
    const parsed = JSON.parse(post.slides_json);
    slides = parsed.slides || [];
  } catch {
    return new Response('Invalid slides', { status: 500 });
  }

  const slide = slides[slideIndex];
  if (!slide?.imageUrl) {
    return new Response('No image for this slide', { status: 404 });
  }

  // Parse data URI: data:image/jpeg;base64,<data>
  const match = slide.imageUrl.match(/^data:image\/([\w+]+);base64,(.+)$/);
  if (!match) {
    // If it's already a URL, redirect
    return Response.redirect(slide.imageUrl, 302);
  }

  const mimeType = `image/${match[1]}`;
  const base64Data = match[2];

  // Decode base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Response(bytes, {
    headers: {
      'Content-Type': mimeType,
      'Content-Length': String(bytes.byteLength),
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

/**
 * GET /api/internal/tts-audio/:videoPostId
 * Serves TTS audio as MP3 so Remotion Lambda can fetch it by URL.
 */
export async function serveTtsAudio(request: Request, env: Env, videoPostId: string): Promise<Response> {
  // Handle CORS preflight (Remotion Lambda headless Chrome requires CORS)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Range',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const post = await env.DB.prepare('SELECT tts_audio_data FROM video_posts WHERE id = ?').bind(videoPostId).first<any>();
  if (!post?.tts_audio_data) {
    return new Response('No TTS audio', { status: 404 });
  }

  // Decode base64 to binary
  const binaryString = atob(post.tts_audio_data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Response(bytes, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(bytes.byteLength),
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'public, max-age=3600',
    },
  });
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

  const openrouterKey = (env as any).OPENROUTER_API_KEY;
  const openaiKey = (env as any).OPENAI_API_KEY;

  // ── Stage 1: script_rewriting → rewrite + eval (for retry path) ──
  if (openrouterKey) {
    const rewritePosts = await env.DB.prepare(
      `SELECT vp.* FROM video_posts vp WHERE vp.status = 'script_rewriting' AND vp.visibility = 'visible' LIMIT 1`
    ).all<any>();

    for (const post of rewritePosts.results || []) {
      try {
        console.log(`[VideoJobs] Stage 1: Rewriting post ${post.id}`);
        const targetDuration = Math.max(15, Math.min(45, post.duration_target_sec || 30));

        const knowhowRow = await env.DB.prepare('SELECT rules_text, version FROM video_knowhow WHERE id = ?').bind('global').first<any>();
        const pastLearnings = knowhowRow?.rules_text || await buildEvalKnowhow(env.DB);

        await logEvent(env.DB, post.id, 'llm_rewrite', 'started', 'LLM script rewrite started (cron)');
        const rewriteResult = await rewriteScript(openrouterKey, post.script_text, targetDuration, undefined, pastLearnings);

        await recordCost(env.DB, post.id, 'llm_rewrite', rewriteResult.costUsd, rewriteResult.inputTokens, rewriteResult.outputTokens, 'claude-sonnet-4');
        await logEvent(env.DB, post.id, 'llm_rewrite', 'success',
          `Script rewritten: ${rewriteResult.outputTokens} tokens, $${rewriteResult.costUsd.toFixed(4)}`
        );

        await env.DB.prepare(
          `UPDATE video_posts SET llm_rewritten_script = ?, status = 'evaluating_script', updated_at = datetime('now') WHERE id = ?`
        ).bind(rewriteResult.rewrittenScript, post.id).run();
      } catch (e: any) {
        console.error(`[VideoJobs] Stage 1 error for ${post.id}:`, e.message);
        await logEvent(env.DB, post.id, 'pipeline', 'failed', `Cron rewrite error: ${e.message}. Use Retry.`);
      }
    }
  }

  // ── Stage 2: evaluating_script → eval → script_approved ──
  if (openrouterKey) {
    const evalPosts = await env.DB.prepare(
      `SELECT vp.* FROM video_posts vp WHERE vp.status = 'evaluating_script' AND vp.visibility = 'visible' LIMIT 1`
    ).all<any>();

    for (const post of evalPosts.results || []) {
      try {
        if (!post.llm_rewritten_script) {
          await logEvent(env.DB, post.id, 'pipeline', 'failed', 'No rewritten script found for eval');
          continue;
        }
        console.log(`[VideoJobs] Stage 2: Evaluating post ${post.id}`);
        await logEvent(env.DB, post.id, 'llm_eval', 'started', 'Evaluation attempt #1 (cron)');
        const evalResult = await evaluateScript(openrouterKey, post.llm_rewritten_script);

        await recordCost(env.DB, post.id, 'llm_eval', evalResult.costUsd, evalResult.inputTokens, evalResult.outputTokens, 'claude-sonnet-4',
          { attempt: 1, score: evalResult.score }
        );
        await logEvent(env.DB, post.id, 'llm_eval', 'completed',
          `Score: ${evalResult.score}/100. H${evalResult.breakdown.hook}/P${evalResult.breakdown.pacing}/C${evalResult.breakdown.clarity}/CTA${evalResult.breakdown.cta}/E${evalResult.breakdown.emotion}`,
          { score: evalResult.score, breakdown: evalResult.breakdown }
        );

        // Auto-fill caption/hashtags/yt_title from rewritten script if empty
        const autoFillParts: string[] = [];
        const autoFillBinds: any[] = [];
        if (!post.caption_text) {
          const autoCaption = generateCaptionFromScript(post.llm_rewritten_script);
          autoFillParts.push('caption_text = ?');
          autoFillBinds.push(autoCaption);
        }
        if (!post.hashtags_text) {
          const autoHashtags = generateHashtagsFromScript(post.llm_rewritten_script);
          autoFillParts.push('hashtags_text = ?');
          autoFillBinds.push(autoHashtags);
        }
        if (!post.yt_title || post.yt_title === post.internal_title) {
          const autoYtTitle = generateYtTitleFromScript(post.llm_rewritten_script);
          autoFillParts.push('yt_title = ?');
          autoFillBinds.push(autoYtTitle);
        }
        const autoFillSql = autoFillParts.length > 0 ? ', ' + autoFillParts.join(', ') : '';

        await env.DB.prepare(
          `UPDATE video_posts SET llm_eval_score = ?, llm_eval_attempts = 1, llm_eval_feedback = ?${autoFillSql},
            status = 'script_approved', updated_at = datetime('now') WHERE id = ?`
        ).bind(evalResult.score, JSON.stringify(evalResult), ...autoFillBinds, post.id).run();
        await logEvent(env.DB, post.id, 'llm_eval', 'success', `Script approved with score ${evalResult.score}/100${autoFillParts.length > 0 ? ` (auto-filled: ${autoFillParts.length} fields)` : ''}`);
      } catch (e: any) {
        console.error(`[VideoJobs] Stage 2 error for ${post.id}:`, e.message);
        await logEvent(env.DB, post.id, 'pipeline', 'failed', `Cron eval error: ${e.message}. Use Retry.`);
      }
    }
  }

  // ── Stage 3: script_approved → build slides + generate images → images_ready ──
  {
    const approvedPosts = await env.DB.prepare(
      `SELECT vp.* FROM video_posts vp WHERE vp.status = 'script_approved' AND vp.visibility = 'visible' LIMIT 1`
    ).all<any>();

    for (const post of approvedPosts.results || []) {
      try {
        if (!post.llm_rewritten_script) {
          await logEvent(env.DB, post.id, 'pipeline', 'failed', 'No rewritten script found for slide build');
          continue;
        }
        console.log(`[VideoJobs] Stage 3: Building slides + images for post ${post.id}`);

        // Build slides from rewritten script
        const finalPayload = buildEnhancedSlidesPayload(
          post.llm_rewritten_script, post.template_type, post.internal_title,
          post.caption_text || '', post.hashtags_text || '', post.bgm_preset || 'none',
        );
        const finalDuration = Math.max(15, Math.min(45, finalPayload.metadata.totalDurationSec));
        finalPayload.slides = scaleSlidesToDuration(finalPayload.slides, finalDuration);
        finalPayload.metadata.totalDurationSec = Math.round(finalPayload.slides.reduce((sum: number, s: any) => sum + s.durationSec, 0) * 10) / 10;

        await logEvent(env.DB, post.id, 'build', 'success',
          `Slides built from rewritten script: ${finalPayload.slides.length} slides, ${finalPayload.metadata.totalDurationSec}s`
        );

        // Run image generation + TTS in parallel
        await env.DB.prepare(
          `UPDATE video_posts SET slides_json = ?, slides_count = ?, status = 'generating_images', updated_at = datetime('now') WHERE id = ?`
        ).bind(JSON.stringify(finalPayload), finalPayload.slides.length, post.id).run();

        // ── Image Generation (parallel task 1) ──
        const imageGenPromise = (async () => {
          if (!openaiKey) return null;
          const KEY_TYPES = ['hook', 'chapter_title', 'emphasis'];
          const keySlideCount = finalPayload.slides.filter((s: any) => KEY_TYPES.includes(s.type)).length;
          const actualCount = Math.min(keySlideCount, 3);
          await logEvent(env.DB, post.id, 'image_gen', 'started', `Generating ${actualCount} images (max 3 of ${keySlideCount} key slides)`);
          return generateSlideImages(openaiKey, finalPayload.slides);
        })();

        // ── TTS + Whisper (parallel task 2) ──
        // Use SLIDE texts (already duration-limited to 45s) instead of full script
        // to keep audio short enough for Shorts and within D1 storage limits.
        const ttsPromise = (async () => {
          if (!openaiKey) return null;
          try {
            // Build narration text from duration-limited slides (not full script)
            const slideTexts = finalPayload.slides
              .map((s: any) => s.text.replace(/[「」\*#]/g, ''))
              .join('\n');
            const targetDurationSec = finalPayload.metadata.totalDurationSec;

            const category = inferCategory(slideTexts);
            const presetName = post.voice_preset || inferVoicePreset(category);
            await logEvent(env.DB, post.id, 'tts', 'started', `Generating TTS: preset=${presetName}, ${slideTexts.length} chars from ${finalPayload.slides.length} slides (~${targetDurationSec}s target)`);
            const ttsResult = await generateTTS(openaiKey, slideTexts, presetName, category, targetDurationSec);
            await recordCost(env.DB, post.id, 'tts', ttsResult.costUsd, undefined, undefined, 'gpt-4o-mini-tts', { preset: ttsResult.preset, charCount: ttsResult.charCount });
            await logEvent(env.DB, post.id, 'tts', 'success', `TTS generated: ~${ttsResult.durationEstimateSec}s, ${(ttsResult.audioBase64.length / 1024).toFixed(0)}KB base64, $${ttsResult.costUsd.toFixed(4)}`);

            // Run Whisper on the generated audio
            await logEvent(env.DB, post.id, 'whisper', 'started', 'Generating word timestamps');
            const whisperResult = await generateTimestamps(openaiKey, ttsResult.audioBase64);
            await recordCost(env.DB, post.id, 'whisper', whisperResult.costUsd, undefined, undefined, 'whisper-1');
            await logEvent(env.DB, post.id, 'whisper', 'success', `${whisperResult.words.length} words, ${whisperResult.totalDurationSec.toFixed(1)}s, $${whisperResult.costUsd.toFixed(4)}`);

            return { tts: ttsResult, whisper: whisperResult };
          } catch (ttsErr: any) {
            console.error(`[VideoJobs] TTS/Whisper failed (non-blocking):`, ttsErr.message);
            await logEvent(env.DB, post.id, 'tts', 'failed', `TTS error (non-blocking): ${ttsErr.message}`);
            return null;
          }
        })();

        // Wait for both to complete
        const [imageResult, ttsWhisperResult] = await Promise.all([imageGenPromise, ttsPromise]);

        // Apply image results
        if (imageResult) {
          for (const img of imageResult.images) {
            if (finalPayload.slides[img.slideIndex]) {
              (finalPayload.slides[img.slideIndex] as any).imageUrl = img.imageUrl;
            }
            await logEvent(env.DB, post.id, 'image_gen', 'info', `Image ${imageResult.images.indexOf(img) + 1} done (slide ${img.slideIndex})`);
          }
          for (const err of imageResult.errors) {
            await logEvent(env.DB, post.id, 'image_gen', 'failed', `Image error: ${err.substring(0, 150)}`);
          }
          for (const cost of imageResult.costs) {
            await recordCost(env.DB, post.id, 'image_gen', cost.amountUsd, undefined, undefined, cost.model, { slideIndex: cost.slideIndex });
          }
          await logEvent(env.DB, post.id, 'image_gen', imageResult.images.length > 0 ? 'success' : 'failed',
            `Generated ${imageResult.images.length} images, $${imageResult.totalCostUsd.toFixed(4)}`
          );
        }

        // If TTS succeeded, rescale slide durations to match audio and save TTS data
        let ttsAudioBase64: string | null = null;
        let ttsTimestampsJson: string | null = null;
        let ttsPreset: string | null = null;
        if (ttsWhisperResult) {
          const audioDurationSec = ttsWhisperResult.whisper.totalDurationSec;
          // Redistribute slide durations proportionally to match audio length
          finalPayload.slides = scaleSlidesToDuration(finalPayload.slides, audioDurationSec);
          finalPayload.metadata.totalDurationSec = Math.round(finalPayload.slides.reduce((sum: number, s: any) => sum + s.durationSec, 0) * 10) / 10;
          await logEvent(env.DB, post.id, 'tts', 'info', `Slides rescaled to ${audioDurationSec.toFixed(1)}s audio duration`);

          ttsAudioBase64 = ttsWhisperResult.tts.audioBase64;
          ttsTimestampsJson = JSON.stringify(ttsWhisperResult.whisper.words);
          ttsPreset = ttsWhisperResult.tts.preset;
        }

        // Save slides (with images) and TTS data, advance status
        // Try with full TTS audio first; fall back to timestamps-only if D1 rejects the blob size.
        const slidesJson = JSON.stringify(finalPayload);
        const slidesCount = finalPayload.slides.length;
        try {
          if (ttsAudioBase64) {
            await env.DB.prepare(
              `UPDATE video_posts SET slides_json = ?, slides_count = ?, status = 'images_ready',
               tts_audio_data = ?, tts_timestamps_json = ?, voice_preset = ?, updated_at = datetime('now') WHERE id = ?`
            ).bind(slidesJson, slidesCount, ttsAudioBase64, ttsTimestampsJson, ttsPreset, post.id).run();
          } else {
            await env.DB.prepare(
              `UPDATE video_posts SET slides_json = ?, slides_count = ?, status = 'images_ready', updated_at = datetime('now') WHERE id = ?`
            ).bind(slidesJson, slidesCount, post.id).run();
          }
        } catch (dbErr: any) {
          // Fallback: if audio blob is too large for D1, save without audio data
          if (dbErr.message?.includes('TOOBIG') || dbErr.message?.includes('too big')) {
            console.warn(`[VideoJobs] TTS audio too large for D1 (${(ttsAudioBase64?.length || 0) / 1024}KB), saving timestamps only`);
            await logEvent(env.DB, post.id, 'tts', 'failed', `Audio base64 too large for D1 (${((ttsAudioBase64?.length || 0) / 1024).toFixed(0)}KB). Saving timestamps only — video will have subtitles but no narration audio.`);
            await env.DB.prepare(
              `UPDATE video_posts SET slides_json = ?, slides_count = ?, status = 'images_ready',
               tts_timestamps_json = ?, voice_preset = ?, updated_at = datetime('now') WHERE id = ?`
            ).bind(slidesJson, slidesCount, ttsTimestampsJson, ttsPreset, post.id).run();
          } else {
            throw dbErr; // Re-throw non-size errors
          }
        }
        await logEvent(env.DB, post.id, 'pipeline', 'info', `Slides + images${ttsWhisperResult ? ' + TTS' : ''} ready. Render next.`);
      } catch (e: any) {
        console.error(`[VideoJobs] Stage 3 error for ${post.id}:`, e.message);
        await logEvent(env.DB, post.id, 'pipeline', 'failed', `Cron images error: ${e.message}. Use Retry.`);
      }
    }
  }

  // ── Stage 4: images_ready → render + PDCA knowhow ──
  {
    const readyPosts = await env.DB.prepare(
      `SELECT vp.* FROM video_posts vp WHERE vp.status = 'images_ready' AND vp.visibility = 'visible' LIMIT 1`
    ).all<any>();

    for (const post of readyPosts.results || []) {
      try {
        if (!post.slides_json) {
          await logEvent(env.DB, post.id, 'pipeline', 'failed', 'No slides found for render');
          continue;
        }
        console.log(`[VideoJobs] Stage 4: Rendering post ${post.id}`);
        const slidesPayload = JSON.parse(post.slides_json);

        // Upload TTS audio to S3 so Remotion Lambda can fetch it directly
        if (post.tts_audio_data) {
          const awsRegion = (env as any).REMOTION_AWS_REGION || 'ap-northeast-1';
          const awsAccessKeyId = (env as any).AWS_ACCESS_KEY_ID;
          const awsSecretAccessKey = (env as any).AWS_SECRET_ACCESS_KEY;
          const s3Bucket = (env as any).REMOTION_S3_BUCKET || 'remotionlambda-apnortheast1-aam4p56xhk';

          if (awsAccessKeyId && awsSecretAccessKey) {
            try {
              // Decode base64 to binary
              const binaryString = atob(post.tts_audio_data);
              const audioBytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                audioBytes[i] = binaryString.charCodeAt(i);
              }

              const s3Key = `audio/${post.id}.mp3`;
              const s3Result = await uploadToS3({
                bucket: s3Bucket,
                key: s3Key,
                body: audioBytes.buffer as ArrayBuffer,
                contentType: 'audio/mpeg',
                region: awsRegion,
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey,
                acl: 'public-read',
              });

              if (s3Result.success) {
                slidesPayload.audioSrc = s3Result.url;
                console.log(`[TTS] Audio uploaded to S3: ${s3Result.url} (${audioBytes.length} bytes)`);
              } else {
                console.error(`[TTS] S3 upload failed: ${s3Result.error}`);
                await logEvent(env.DB, post.id, 'tts', 'warning', `S3 audio upload failed: ${s3Result.error}`);
              }
            } catch (e: any) {
              console.error(`[TTS] S3 upload error: ${e.message}`);
              await logEvent(env.DB, post.id, 'tts', 'warning', `S3 audio upload error: ${e.message}`);
            }
          }
        }
        if (post.tts_timestamps_json) {
          try {
            slidesPayload.timestamps = JSON.parse(post.tts_timestamps_json);
            slidesPayload.subtitleStyle = 'karaoke';
          } catch { /* ignore parse errors */ }
        }

        // Diagnostic: count slides with imageUrl
        const slidesWithImage = slidesPayload.slides?.filter((s: any) => s.imageUrl)?.length || 0;
        const hasTts = !!post.tts_audio_data;
        await logEvent(env.DB, post.id, 'render', 'info',
          `Render payload: ${slidesPayload.slides?.length} slides, ${slidesWithImage} with imageUrl, TTS=${hasTts}`
        );

        // Trigger Remotion render
        await env.DB.prepare(
          `UPDATE video_posts SET status = 'queued_render', updated_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();

        const renderJobId = generateId('vr_');
        await env.DB.prepare(
          `INSERT INTO video_render_jobs (id, video_post_id, remotion_composition, input_payload_json, render_status, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'queued', datetime('now'), datetime('now'))`
        ).bind(renderJobId, post.id, post.template_type === 'slideshow' ? 'Slideshow' : 'Explainer', JSON.stringify(slidesPayload)).run();

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
          await logEvent(env.DB, post.id, 'render', 'queued', renderResult.error || 'Render queued, will retry');
        }

        // PDCA knowhow update (non-critical)
        if (openrouterKey && post.llm_eval_feedback) {
          try {
            const knowhowRow = await env.DB.prepare('SELECT rules_text, version FROM video_knowhow WHERE id = ?').bind('global').first<any>();
            const currentRules = knowhowRow?.rules_text || '';
            const currentVersion = knowhowRow?.version || 0;
            const evalData = JSON.parse(post.llm_eval_feedback);
            const knowhowResult = await updateKnowhow(
              openrouterKey, currentRules, evalData.feedback, evalData.breakdown, evalData.score
            );
            await env.DB.prepare(
              `INSERT INTO video_knowhow (id, rules_text, version, eval_count, updated_at)
               VALUES ('global', ?, ?, 1, datetime('now'))
               ON CONFLICT(id) DO UPDATE SET rules_text = ?, version = ?, eval_count = eval_count + 1, updated_at = datetime('now')`
            ).bind(knowhowResult.updatedRules, currentVersion + 1, knowhowResult.updatedRules, currentVersion + 1).run();
            await recordCost(env.DB, post.id, 'llm_knowhow', knowhowResult.costUsd, knowhowResult.inputTokens, knowhowResult.outputTokens, 'claude-sonnet-4');
            await logEvent(env.DB, post.id, 'llm_knowhow', 'success',
              `Knowhow updated to v${currentVersion + 1}: ${knowhowResult.updatedRules.split('\n').length} rules, $${knowhowResult.costUsd.toFixed(4)}`
            );
          } catch (knowhowErr: any) {
            console.error('[VideoJobs] Knowhow update failed (non-critical):', knowhowErr.message);
          }
        }

        await logEvent(env.DB, post.id, 'pipeline', 'success', 'Pipeline stages 1-4 complete.');
      } catch (e: any) {
        console.error(`[VideoJobs] Stage 4 error for ${post.id}:`, e.message);
        await logEvent(env.DB, post.id, 'pipeline', 'failed', `Cron render error: ${e.message}. Use Retry.`);
      }
    }
  }

  // ── Stage 4b: Detect stuck renders (rendering > 10 min → render_failed) ──
  {
    const stuckPosts = await env.DB.prepare(
      `SELECT vp.id FROM video_posts vp
       WHERE vp.status = 'rendering' AND vp.visibility = 'visible'
         AND vp.updated_at < datetime('now', '-10 minutes')
       LIMIT 3`
    ).all<any>();

    for (const post of stuckPosts.results || []) {
      console.log(`[VideoJobs] Render timeout: post ${post.id} stuck > 10 min`);
      await env.DB.prepare(
        `UPDATE video_posts SET status = 'render_failed', updated_at = datetime('now') WHERE id = ?`
      ).bind(post.id).run();
      await env.DB.prepare(
        `UPDATE video_render_jobs SET render_status = 'failed', error_message = 'Render timeout (>10 min, no webhook received)', updated_at = datetime('now')
         WHERE video_post_id = ? AND render_status = 'rendering'`
      ).bind(post.id).run();
      await logEvent(env.DB, post.id, 'render', 'failed', 'Render timeout: no webhook received after 10 minutes. Use Retry.');
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
          const targetStatus = post.publish_mode === 'draft' ? 'draft_created' : (post.publish_mode === 'scheduled' ? 'scheduled' : 'publishing');
          await env.DB.prepare(
            `UPDATE video_post_targets SET postiz_post_id = ?, target_status = ?, error_code = NULL, error_message = NULL, updated_at = datetime('now')
             WHERE video_post_id = ? AND postiz_integration_id = ?`
          ).bind(r.postId, targetStatus, post.id, r.integration).run();

          if (r.integration) {
            const ytId = (env as any).POSTIZ_YOUTUBE_INTEGRATION_ID;
            const igId = (env as any).POSTIZ_INSTAGRAM_INTEGRATION_ID;
            const platform = r.integration === ytId ? 'youtube' : (r.integration === igId ? 'instagram' : null);
            if (platform) {
              await env.DB.prepare(
                `UPDATE video_post_targets SET postiz_post_id = ?, postiz_integration_id = ?, target_status = ?, error_code = NULL, error_message = NULL, updated_at = datetime('now')
                 WHERE video_post_id = ? AND platform = ?`
              ).bind(r.postId, r.integration, targetStatus, post.id, platform).run();
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

  // ── Stage 7: publishing → poll Postiz for confirmation ──
  const awaitingPublish = await env.DB.prepare(
    `SELECT vp.id, vp.publish_mode, vp.updated_at FROM video_posts vp
     WHERE vp.status = 'publishing' AND vp.visibility = 'visible'
     AND vp.updated_at < datetime('now', '-1 minute')
     LIMIT 3`
  ).all<any>();

  for (const post of awaitingPublish.results || []) {
    try {
      const targets = await env.DB.prepare(
        `SELECT postiz_post_id, platform FROM video_post_targets WHERE video_post_id = ? AND postiz_post_id IS NOT NULL`
      ).bind(post.id).all<any>();

      if (!targets.results?.length) continue;

      const apiKey = (env as any).POSTIZ_API_KEY;
      if (!apiKey) continue;

      // Query Postiz for posts around the updated_at time
      const start = new Date(new Date(post.updated_at).getTime() - 60 * 60 * 1000).toISOString();
      const end = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const res = await fetch(`https://api.postiz.com/public/v1/posts?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`, {
        headers: { 'Authorization': apiKey },
      });

      if (!res.ok) {
        console.log(`[VideoJobs] Postiz poll failed (${res.status}) for post ${post.id}`);
        continue;
      }

      const rawBody = await res.json() as any;
      // Postiz may return an array or { data: [...] } or { posts: [...] }
      const postizPosts: Array<{ id: string; state: string; releaseURL?: string }> =
        Array.isArray(rawBody) ? rawBody :
        Array.isArray(rawBody?.data) ? rawBody.data :
        Array.isArray(rawBody?.posts) ? rawBody.posts : [];
      console.log(`[VideoJobs] Postiz poll for ${post.id}: got ${postizPosts.length} posts (raw keys: ${Object.keys(rawBody || {}).join(',')})`);

      for (const target of targets.results) {
        const match = postizPosts.find((p: any) => p.id === target.postiz_post_id);
        if (!match) continue;

        if (match.state === 'PUBLISHED') {
          await env.DB.prepare(
            `UPDATE video_post_targets SET target_status = 'published', published_url = ?, error_code = NULL, error_message = NULL, updated_at = datetime('now')
             WHERE video_post_id = ? AND postiz_post_id = ?`
          ).bind(match.releaseURL || null, post.id, target.postiz_post_id).run();
          await logEvent(env.DB, post.id, 'publish', 'success', `Published on ${target.platform}: ${match.releaseURL || 'URL pending'}`);
        } else if (match.state === 'ERROR') {
          await env.DB.prepare(
            `UPDATE video_post_targets SET target_status = 'publish_failed', error_code = 'POSTIZ_PUBLISH_ERROR', updated_at = datetime('now')
             WHERE video_post_id = ? AND postiz_post_id = ?`
          ).bind(post.id, target.postiz_post_id).run();
          await logEvent(env.DB, post.id, 'publish', 'failed', `Postiz publish error on ${target.platform}`);
        }
        // state === 'QUEUE' → still waiting, do nothing
      }

      // Check if all targets are resolved
      const allTargets = await env.DB.prepare(
        `SELECT target_status FROM video_post_targets WHERE video_post_id = ?`
      ).bind(post.id).all<any>();

      const allResolved = (allTargets.results || []).every(
        (t: any) => t.target_status === 'published' || t.target_status === 'publish_failed'
      );

      if (allResolved) {
        const allPublished = (allTargets.results || []).every((t: any) => t.target_status === 'published');
        const newStatus = allPublished ? 'published' : 'publish_failed';
        await env.DB.prepare(
          `UPDATE video_posts SET status = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(newStatus, post.id).run();
        await logEvent(env.DB, post.id, 'status', 'success', `Final status: ${newStatus}`);
      }

      // Timeout: if still publishing after 30 minutes, mark as publish_timeout
      const updatedAt = new Date(post.updated_at).getTime();
      if (Date.now() - updatedAt > 30 * 60 * 1000) {
        await env.DB.prepare(
          `UPDATE video_posts SET status = 'publish_timeout', updated_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();
        await logEvent(env.DB, post.id, 'publish', 'failed', 'Publish timeout: no confirmation from Postiz after 30 minutes');
      }
    } catch (e: any) {
      console.error(`[VideoJobs] Postiz poll error for post ${post.id}:`, e);
    }
  }

  console.log('[VideoJobs] Video post job processing completed');
}
