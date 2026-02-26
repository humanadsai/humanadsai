/**
 * LLM Service — OpenRouter API client for script rewriting and evaluation.
 *
 * Uses OpenRouter (OpenAI-compatible) API via fetch().
 * Two functions:
 *   1. rewriteScript()   — rewrites a script for viral short-form video
 *   2. evaluateScript()  — harsh "辛口" evaluator scores 0-100
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const LLM_MODEL = 'anthropic/claude-sonnet-4.6';

// OpenRouter pricing for claude-sonnet-4 (approximate)
const INPUT_COST_PER_TOKEN = 0.000003;  // $3 per 1M input tokens
const OUTPUT_COST_PER_TOKEN = 0.000015; // $15 per 1M output tokens

export interface RewriteResult {
  rewrittenScript: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface EvalBreakdown {
  hook: number;
  pacing: number;
  clarity: number;
  cta: number;
  emotion: number;
}

export interface EvalResult {
  score: number;
  feedback: string;
  breakdown: EvalBreakdown;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

async function callLLM(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 2048,
): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000); // 25s timeout

  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://humanadsai.com',
        'X-Title': 'HumanAds Video Pipeline',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`OpenRouter API error (${res.status}): ${errBody}`);
    }

    const data = await res.json() as any;
    const content = data.choices?.[0]?.message?.content || '';
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;

    return { content, inputTokens, outputTokens };
  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw new Error('OpenRouter API timeout (25s). Retry with shorter script.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Rewrite a script for viral short-form video (15-45 seconds).
 *
 * @param apiKey - OpenRouter API key
 * @param script - Original script text
 * @param targetDurationSec - Target duration (15-45)
 * @param feedback - Optional evaluator feedback to incorporate
 */
export async function rewriteScript(
  apiKey: string,
  script: string,
  targetDurationSec: number = 30,
  feedback?: string,
  pastLearnings?: string,
): Promise<RewriteResult> {
  // ~2-3 words/sec for Japanese, ~2.5 words/sec for English
  const minWords = Math.floor(targetDurationSec * 2);
  const maxWords = Math.ceil(targetDurationSec * 3);

  let learningsBlock = '';
  if (pastLearnings) {
    learningsBlock = `

IMPORTANT — Past evaluation insights (ノウハウ):
The following patterns have been identified from previous script evaluations. Apply these learnings to produce a higher-scoring script:
${pastLearnings}`;
  }

  const systemPrompt = `You are an elite viral short-form video scriptwriter. Your videos get 10M+ views.
Your mission: rewrite scripts into 15-45 second TikTok/YouTube Shorts that STOP the scroll.

Rules:
- Target duration: ${targetDurationSec} seconds (approximately ${minWords}-${maxWords} words)
- Structure: 衝撃のフック (1行！) → 本編 → 余韻のある締め
- NO promotional CTA. NO "フォロー" or "チャンネル登録". The content itself makes people follow
- Write in the same language as the input script

=== 最初の1秒で全てが決まる ===
- フック（1行目）は動画の生死を決める。1000万回再生されるかゼロかはここで決まる
- フックは必ず1行、15文字以内。「え？」と思わせる衝撃の一言
- 数字・疑問・常識の否定・恐怖・好奇心のどれかを必ず使う
- 例：「年収の9割は嘘」「AIに職を奪われた男」「知らないと損する真実」

=== スライドテキスト ===
- 各段落 = 1スライド。1スライドは【絶対に1〜2行】。3行以上は禁止
- 1行は最大15文字（日本語）。画面で一目で読める長さ
- 1スライド1メッセージ。短く、衝撃的に
- 各スライドの最後は次を見たくなる「引き」で終わる
- 改行は自然なフレーズの区切りで

=== 日本語ルール ===
- 中学生が一瞬で分かる日本語のみ
- 英語・カタカナ英語禁止（コンテンツ→動画、インパクト→衝撃）
- 体言止め・問いかけ・断言が効果的
- 漢字は最小限、ひらがな多め

Output format — rewritten script text ONLY:
- 段落の間は空行で区切る（各段落 = 1スライド）
- スライド内の改行でテキストの折り返し位置を制御
- --- で章を区切る
- 1段落目は必ずフック（1行、15文字以内）
- 最終段落は余韻のある締め（CTAではない）
- メタデータ・ラベル・タイミング情報は一切書かない${learningsBlock}`;

  let userMessage = `Rewrite this script for a ${targetDurationSec}-second short-form video:\n\n${script}`;
  if (feedback) {
    userMessage += `\n\n---\nEvaluator feedback to address:\n${feedback}`;
  }

  const result = await callLLM(apiKey, systemPrompt, userMessage);
  const costUsd = result.inputTokens * INPUT_COST_PER_TOKEN + result.outputTokens * OUTPUT_COST_PER_TOKEN;

  return {
    rewrittenScript: result.content.trim(),
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costUsd,
  };
}

export interface KnowhowUpdateResult {
  updatedRules: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

/**
 * Synthesize evaluation feedback into persistent knowhow rules.
 * Called after each evaluation to update accumulated learnings.
 *
 * @param apiKey - OpenRouter API key
 * @param currentRules - Current knowhow rules (empty string if first time)
 * @param evalFeedback - Latest evaluation feedback text
 * @param evalBreakdown - Score breakdown { hook, pacing, clarity, cta, emotion }
 * @param evalScore - Total score
 */
export async function updateKnowhow(
  apiKey: string,
  currentRules: string,
  evalFeedback: string,
  evalBreakdown: EvalBreakdown,
  evalScore: number,
): Promise<KnowhowUpdateResult> {
  const systemPrompt = `あなたはショート動画スクリプト最適化の専門家です。
評価フィードバックから具体的な改善ルールを抽出し、ノウハウとして蓄積します。

ルール:
- 最大15個のルール（1ルール1-2文、日本語で）
- 各ルールは具体的で実行可能なもの（例: 「CTAは定型文を避け、自分ごと化する問いかけにする」）
- 既存ルールと新しいフィードバックをマージ
- 改善された点はルールを更新（「解決済み」は削除）
- スコアが低い次元のルールを優先
- 重複は統合、矛盾は最新を優先

出力フォーマット: 番号付きリストのみ（説明不要）
1. ルール1
2. ルール2
...`;

  const weakDims: string[] = [];
  const dimMax: Record<string, number> = { hook: 30, pacing: 20, clarity: 20, cta: 15, emotion: 15 };
  for (const [dim, score] of Object.entries(evalBreakdown)) {
    const max = dimMax[dim] || 20;
    if ((score / max) < 0.7) weakDims.push(`${dim}: ${score}/${max}`);
  }

  let userMessage = `【最新評価】スコア: ${evalScore}/100\n弱点: ${weakDims.length > 0 ? weakDims.join(', ') : 'なし'}\nフィードバック: ${evalFeedback}`;
  if (currentRules) {
    userMessage = `【現在のノウハウ】\n${currentRules}\n\n${userMessage}`;
  } else {
    userMessage = `【現在のノウハウ】\n（初回 — ゼロから構築）\n\n${userMessage}`;
  }

  const result = await callLLM(apiKey, systemPrompt, userMessage, 1024);
  const costUsd = result.inputTokens * INPUT_COST_PER_TOKEN + result.outputTokens * OUTPUT_COST_PER_TOKEN;

  return {
    updatedRules: result.content.trim(),
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costUsd,
  };
}

/**
 * Evaluate a script with a harsh "辛口" critic.
 * Score 0-100, with breakdown across 5 dimensions.
 * Pass threshold: 90+
 *
 * @param apiKey - OpenRouter API key
 * @param script - Script text to evaluate
 */
export async function evaluateScript(
  apiKey: string,
  script: string,
): Promise<EvalResult> {
  const systemPrompt = `You are an extremely harsh (辛口) short-form video script evaluator.
You use platforms like OpenClaw and RentAHuman daily and have seen thousands of viral shorts.
You know exactly what makes a script go viral and you have ZERO tolerance for mediocrity.

Score the script 0-100 across these dimensions:
- Hook (30 points): Does the first line FORCE viewers to stop scrolling? Is it provocative, surprising, or emotionally charged?
- Pacing (20 points): Is every second earned? No filler, no wasted slides, relentless forward momentum?
- Clarity (20 points): Can a distracted viewer understand the message in one watch? Is the core idea crystal clear?
- CTA (15 points): Does the ending drive action? Will viewers follow, comment, or share?
- Emotion (15 points): Does it trigger curiosity, fear, excitement, or awe? Does it create an emotional arc?

Be BRUTALLY honest. Most scripts score 40-70. Only truly exceptional scripts score 90+.
Deduct points aggressively for:
- Boring hooks that don't create urgency
- Filler words or unnecessary slides
- Vague or generic CTAs
- Flat emotional tone
- Being too long or too short for the content

You MUST respond with ONLY valid JSON in this exact format:
{"score":NUMBER,"feedback":"SPECIFIC_FEEDBACK_STRING","breakdown":{"hook":NUMBER,"pacing":NUMBER,"clarity":NUMBER,"cta":NUMBER,"emotion":NUMBER}}

Do not include any text before or after the JSON.`;

  const userMessage = `Evaluate this short-form video script:\n\n${script}`;

  const result = await callLLM(apiKey, systemPrompt, userMessage, 1024);
  const costUsd = result.inputTokens * INPUT_COST_PER_TOKEN + result.outputTokens * OUTPUT_COST_PER_TOKEN;

  // Parse JSON response
  let parsed: any;
  try {
    // Try to extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in evaluator response');
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('[LLM] Failed to parse evaluator response:', result.content);
    // Return a failing score if parse fails
    return {
      score: 0,
      feedback: `Evaluator parse error: ${result.content.substring(0, 200)}`,
      breakdown: { hook: 0, pacing: 0, clarity: 0, cta: 0, emotion: 0 },
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd,
    };
  }

  return {
    score: typeof parsed.score === 'number' ? parsed.score : 0,
    feedback: parsed.feedback || '',
    breakdown: {
      hook: parsed.breakdown?.hook || 0,
      pacing: parsed.breakdown?.pacing || 0,
      clarity: parsed.breakdown?.clarity || 0,
      cta: parsed.breakdown?.cta || 0,
      emotion: parsed.breakdown?.emotion || 0,
    },
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costUsd,
  };
}
