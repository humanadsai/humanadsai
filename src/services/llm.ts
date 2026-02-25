/**
 * LLM Service — OpenRouter API client for script rewriting and evaluation.
 *
 * Uses OpenRouter (OpenAI-compatible) API via fetch().
 * Two functions:
 *   1. rewriteScript()   — rewrites a script for viral short-form video
 *   2. evaluateScript()  — harsh "辛口" evaluator scores 0-100
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const LLM_MODEL = 'anthropic/claude-sonnet-4-20250514';

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
): Promise<RewriteResult> {
  // ~2-3 words/sec for Japanese, ~2.5 words/sec for English
  const minWords = Math.floor(targetDurationSec * 2);
  const maxWords = Math.ceil(targetDurationSec * 3);

  const systemPrompt = `You are a viral short-form video scriptwriter for HumanAds, an AI-powered ad platform.
Your job is to rewrite scripts into punchy 15-45 second TikTok/YouTube Shorts scripts.

Rules:
- Target duration: ${targetDurationSec} seconds (approximately ${minWords}-${maxWords} words)
- Structure: Hook (first 3 seconds) → Body (key points) → CTA (last 3-4 seconds)
- Hook MUST grab attention immediately — use a provocative question, surprising fact, or bold claim
- Each scene should be a short, punchy line (max 80 characters per slide)
- Use 「」 for emphasis words that should be highlighted visually
- Use short sentences. One idea per slide.
- CTA must drive action: follow, visit site, or engage
- Maintain the core message but make it scroll-stopping
- Write in the same language as the input script

Output format — write ONLY the rewritten script text:
- Separate paragraphs with blank lines (each paragraph = 1 slide)
- Use --- on its own line to separate chapters
- First paragraph is always the hook
- Last paragraph is always the CTA
- Do NOT include any metadata, labels, timing markers, or explanations`;

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
