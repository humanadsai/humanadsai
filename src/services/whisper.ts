/**
 * Whisper Service — OpenAI Whisper API for word-level timestamps.
 *
 * Takes TTS audio and returns precise per-word timing data
 * for karaoke-style subtitle rendering in Remotion.
 * Cost: ~$0.005 per 30-second audio ($0.006/min).
 */

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const WHISPER_MODEL = 'whisper-1';
const COST_PER_MINUTE = 0.006;

// Minimum word duration threshold — morphemes shorter than this
// get merged into the previous word (handles Japanese particles like は、が、を)
const MIN_WORD_DURATION_SEC = 0.1;

export interface WordTimestamp {
  word: string;
  start: number; // seconds
  end: number;   // seconds
}

export interface WhisperResult {
  words: WordTimestamp[];
  totalDurationSec: number;
  costUsd: number;
  rawText: string;
}

/**
 * Generate word-level timestamps from audio using Whisper API.
 *
 * @param apiKey - OpenAI API key
 * @param audioBase64 - Base64-encoded MP3 audio
 * @returns WhisperResult with word timestamps
 */
export async function generateTimestamps(
  apiKey: string,
  audioBase64: string,
): Promise<WhisperResult> {
  // Decode base64 to binary
  const binaryString = atob(audioBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });

  const durationMin = audioBlob.size / (16000 * 2 * 60); // rough estimate from file size
  console.log(`[Whisper] Processing: ${(audioBlob.size / 1024).toFixed(1)}KB audio`);

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.mp3');
  formData.append('model', WHISPER_MODEL);
  formData.append('language', 'ja');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'word');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const res = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Whisper API error (${res.status}): ${errBody}`);
    }

    const data = await res.json() as {
      text: string;
      duration?: number;
      words?: Array<{ word: string; start: number; end: number }>;
    };

    if (!data.words || data.words.length === 0) {
      throw new Error('Whisper returned no word timestamps');
    }

    // Merge short morphemes into previous word
    const mergedWords = mergeShortMorphemes(data.words);

    const totalDurationSec = data.duration || (mergedWords.length > 0 ? mergedWords[mergedWords.length - 1].end : 0);
    const costUsd = (totalDurationSec / 60) * COST_PER_MINUTE;

    console.log(`[Whisper] Result: ${mergedWords.length} words, ${totalDurationSec.toFixed(1)}s, $${costUsd.toFixed(4)}`);

    return {
      words: mergedWords,
      totalDurationSec,
      costUsd,
      rawText: data.text,
    };
  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw new Error('Whisper API timeout (30s)');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Merge short morphemes (< 0.1s) into the previous word.
 * Japanese tokenization often splits particles (は、が、を、に) into separate entries.
 * Merging them produces cleaner subtitle groups.
 */
function mergeShortMorphemes(
  words: Array<{ word: string; start: number; end: number }>,
): WordTimestamp[] {
  if (words.length === 0) return [];

  const result: WordTimestamp[] = [];

  for (const w of words) {
    const duration = w.end - w.start;
    const cleanWord = w.word.trim();

    if (!cleanWord) continue;

    if (result.length > 0 && duration < MIN_WORD_DURATION_SEC) {
      // Merge into previous word
      const prev = result[result.length - 1];
      prev.word += cleanWord;
      prev.end = w.end;
    } else {
      result.push({
        word: cleanWord,
        start: w.start,
        end: w.end,
      });
    }
  }

  return result;
}
