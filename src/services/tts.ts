/**
 * TTS Service — OpenAI gpt-4o-mini-tts for narration audio generation.
 *
 * Generates emotionally expressive speech from video scripts.
 * Cost: ~$0.011 per 30-second video (750 chars at $15/1M chars).
 */

const TTS_API_URL = 'https://api.openai.com/v1/audio/speech';
const TTS_MODEL = 'gpt-4o-mini-tts';
const TTS_VOICE = 'coral'; // natural, versatile voice
const COST_PER_MILLION_CHARS = 15; // $15/1M characters

// ── Emotion Presets ──
// Each preset includes instructions that shape the TTS voice affect.
export const VOICE_PRESETS: Record<string, { instructions: string; speed: number }> = {
  news_shocking: {
    instructions: 'Speak with urgency and surprise, like a news anchor breaking a shocking story. Slightly faster pace, dramatic pauses before key reveals. Voice should convey "you won\'t believe this" energy.',
    speed: 1.1,
  },
  news_calm: {
    instructions: 'Speak calmly and authoritatively, like a trusted news anchor delivering important information. Clear, measured pace. Reassuring but serious tone.',
    speed: 1.0,
  },
  entertainment_hype: {
    instructions: 'Speak with high energy and excitement, like a popular YouTuber revealing something amazing. Enthusiastic, slightly louder on key words. Infectious excitement that makes viewers want to keep watching.',
    speed: 1.15,
  },
  storytelling: {
    instructions: 'Speak like a captivating storyteller. Vary your pace — slow down for dramatic moments, speed up for action. Use suspenseful pauses. Make the listener lean in.',
    speed: 1.0,
  },
  explainer: {
    instructions: 'Speak clearly and engagingly, like a friendly teacher explaining something fascinating. Emphasize key concepts. Make complex topics feel simple and interesting.',
    speed: 0.95,
  },
  warning: {
    instructions: 'Speak with serious concern, like warning a friend about a real danger. Urgent but not panicked. Emphasize the stakes. The listener should feel the gravity.',
    speed: 1.05,
  },
};

// ── Category → Voice Preset Mapping ──
// Reuses inferCategory() categories from image-generator.ts
const CATEGORY_TO_PRESET: Record<string, string> = {
  business: 'news_calm',
  technology: 'explainer',
  health: 'explainer',
  money: 'news_shocking',
  danger: 'warning',
  lifestyle: 'storytelling',
  general: 'entertainment_hype',
};

export interface TTSResult {
  audioBase64: string; // base64-encoded MP3
  durationEstimateSec: number;
  costUsd: number;
  preset: string;
  charCount: number;
}

/**
 * Infer the best voice preset from content category.
 */
export function inferVoicePreset(category: string): string {
  return CATEGORY_TO_PRESET[category] || CATEGORY_TO_PRESET.general;
}

/**
 * Generate TTS audio from script text using OpenAI gpt-4o-mini-tts.
 *
 * @param apiKey - OpenAI API key
 * @param text - Script text to narrate
 * @param presetName - Voice preset name (or auto-detect from category)
 * @param category - Content category for auto-preset selection
 * @param targetDurationSec - Target video duration; TTS speed is auto-adjusted to fit
 * @returns TTSResult with base64 MP3 audio
 */
export async function generateTTS(
  apiKey: string,
  text: string,
  presetName?: string,
  category?: string,
  targetDurationSec?: number,
): Promise<TTSResult> {
  const preset = presetName && VOICE_PRESETS[presetName]
    ? presetName
    : inferVoicePreset(category || 'general');

  const voiceConfig = VOICE_PRESETS[preset];

  // Clean script text for narration (remove formatting markers)
  const cleanText = text
    .replace(/[「」\*#]/g, '')
    .replace(/\n{2,}/g, '。\n')
    .replace(/\n/g, '、')
    .trim();

  const charCount = cleanText.length;
  const costUsd = (charCount / 1_000_000) * COST_PER_MILLION_CHARS;

  // Dynamic speed: estimate natural duration, then speed up to fit target
  const isJapanese = /[\u3000-\u9fff]/.test(cleanText);
  const charsPerSec = isJapanese ? 5 : 15; // Japanese ~5 chars/sec at 1.0x
  const estimatedNaturalSec = charCount / charsPerSec;
  let finalSpeed = voiceConfig.speed;
  if (targetDurationSec && targetDurationSec > 0 && estimatedNaturalSec > targetDurationSec) {
    // Speed up to fit within target duration (cap at 1.5x to keep natural)
    const neededSpeed = estimatedNaturalSec / targetDurationSec;
    finalSpeed = Math.min(1.5, voiceConfig.speed * neededSpeed);
  }
  // Clamp to OpenAI API limits (0.25–4.0)
  finalSpeed = Math.round(Math.max(0.25, Math.min(4.0, finalSpeed)) * 100) / 100;

  console.log(`[TTS] Generating: ${charCount} chars, preset=${preset}, speed=${finalSpeed} (base=${voiceConfig.speed}, est=${estimatedNaturalSec.toFixed(0)}s, target=${targetDurationSec || 'none'})`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const res = await fetch(TTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        voice: TTS_VOICE,
        input: cleanText,
        instructions: voiceConfig.instructions,
        speed: finalSpeed,
        response_format: 'mp3',
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`OpenAI TTS API error (${res.status}): ${errBody}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const audioBase64 = arrayBufferToBase64(arrayBuffer);

    const durationEstimateSec = Math.round(estimatedNaturalSec / finalSpeed);

    console.log(`[TTS] Generated: ${(arrayBuffer.byteLength / 1024).toFixed(1)}KB, ~${durationEstimateSec}s, speed=${finalSpeed}, $${costUsd.toFixed(4)}`);

    return {
      audioBase64,
      durationEstimateSec,
      costUsd,
      preset,
      charCount,
    };
  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw new Error('OpenAI TTS API timeout (30s)');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
