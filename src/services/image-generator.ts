/**
 * Image Generator Service — OpenAI gpt-image integration for slide images.
 *
 * Generates portrait images (1024x1536) for 9:16 video slides.
 * Uses editorial photography style to avoid AI-generated aesthetics.
 * Returns base64 data URIs (JPEG) that Remotion can render.
 */

const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';
const IMAGE_MODEL = 'gpt-image-1';
// gpt-image-1 pricing: $0.011 per 1024x1024 low, $0.016 per 1024x1536 low
const COST_PER_IMAGE = 0.016;

// ── Blacklist: words that produce AI-generated aesthetics ──
const AI_SMELL_BLACKLIST = [
  'cinematic', 'epic', 'dramatic lighting', 'hyper-realistic', 'ultra-detailed',
  '8k', 'unreal engine', 'octane render', 'volumetric lighting', 'god rays',
  'glowing eyes', 'neon', 'cyberpunk', 'futuristic', 'holographic',
  'particle effects', 'lens flare', 'bokeh explosion', 'dark moody atmosphere',
  'concept art', 'digital art', 'fantasy art', 'sci-fi art',
  'ray tracing', 'subsurface scattering', 'chromatic aberration',
  'tilt-shift', 'vaporwave', 'ethereal', 'surreal', 'dreamlike',
  'otherworldly', 'magical', 'cosmic', 'light beams', 'anamorphic',
  '3d render', 'cgi', 'perfect skin', 'flawless', 'porcelain',
  'gradient background', 'abstract geometric', 'minimalist pattern',
  'vivid colors', 'moody lighting', 'neon accents', 'high contrast',
];

// ── Negative prompt (appended to every generation) ──
const NEGATIVE_PROMPT = [
  'Do NOT include any of the following:',
  'neon lighting, teal-and-orange color grading, glossy or plastic skin,',
  'particle effects, lens flares, volumetric god-rays, cyberpunk aesthetic,',
  'gradient backgrounds, abstract shapes, geometric patterns,',
  'robots, cyborgs, AI-generated watermarks, perfect bilateral symmetry,',
  'overly saturated colors, HDR look, digital art style,',
  'fire, smoke, dramatic clouds, glowing elements, stock photo smile.',
].join(' ');

// ── Subject category keywords for auto-inference ──
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  business: ['revenue', 'profit', 'company', 'startup', 'market', 'invest', 'economy', 'CEO', 'billion', 'growth', '企業', '売上', '利益', '経済', 'ビジネス', '投資'],
  technology: ['AI', 'algorithm', 'data', 'software', 'app', 'machine learning', 'automation', 'code', 'API', 'テクノロジー', '技術', 'アルゴリズム', '自動化', 'プログラム'],
  health: ['health', 'medicine', 'doctor', 'hospital', 'disease', 'treatment', 'diet', 'exercise', 'mental', '健康', '医療', '病院', '治療', '運動'],
  environment: ['climate', 'carbon', 'ocean', 'forest', 'pollution', 'renewable', 'sustainability', '環境', '気候', '汚染', 'エネルギー'],
  social: ['community', 'culture', 'education', 'family', 'relationship', 'social media', 'コミュニティ', '教育', '文化', 'SNS'],
  danger: ['risk', 'threat', 'crisis', 'warning', 'danger', 'collapse', 'fraud', 'scam', 'hack', '危険', '詐欺', 'リスク', '崩壊', '警告', '脅威', 'ハッキング'],
};

// ── Camera + lens combinations for editorial feel ──
const CAMERA_OPTIONS = [
  'Shot on Canon EOS R5 with 35mm f/1.4 lens',
  'Shot on Sony A7IV with 50mm f/1.8 lens',
  'Shot on Nikon Z9 with 24-70mm f/2.8 lens',
  'Shot on Fujifilm X-T5 with 23mm f/2 lens',
];

// ── Per-category visual direction ──
const CATEGORY_VISUALS: Record<string, { subject: string; environment: string; mood: string }> = {
  business: {
    subject: 'A real office worker in their 30s, wearing a plain collared shirt, sitting at a cluttered desk. Natural posture, not posed. Subtle micro-expression of concentration',
    environment: 'A real corporate office — fluorescent overhead lights, beige walls, whiteboard with writing, stacked papers. Nothing futuristic. Practical lighting only',
    mood: 'Professional unease — conveyed through posture and expression, not through color grading',
  },
  technology: {
    subject: 'Close-up of real hands on a laptop keyboard, screen casting a soft blue-white glow on the face. The person wears a plain t-shirt. Visible veins on hands, natural nail texture',
    environment: 'A real home office or coworking space at night. Warm desk lamp, coffee mug with stain ring, tangled charging cables. Window shows dark sky',
    mood: 'Quiet focus — conveyed through stillness and screen glow, not through neon or effects',
  },
  health: {
    subject: 'A real person outdoors, wearing everyday athletic clothes. Natural body proportions, visible pores, slightly windswept hair',
    environment: 'A public park at golden hour. Dappled sunlight through actual trees, visible grass texture, park bench in background. Real weather',
    mood: 'Calm determination — conveyed through relaxed posture and warm natural light',
  },
  environment: {
    subject: 'Wide landscape with tiny human figure for scale. Real terrain textures — cracked earth, wild grass, weathered rocks',
    environment: 'Raw outdoor location under overcast sky. Muted natural colors, no filters. Visible cloud texture, wind in vegetation',
    mood: 'Vast unease — conveyed through scale and emptiness, not color grading',
  },
  social: {
    subject: 'Candid shot of 2-3 real people in conversation. Mixed ages, natural clothing, unposed body language. One person mid-gesture',
    environment: 'A real cafe or urban sidewalk. Visible menu boards, scratched table surface, mismatched chairs. Background pedestrians',
    mood: 'Authentic warmth — conveyed through genuine micro-expressions and proximity',
  },
  danger: {
    subject: 'Tight close-up of a person with furrowed brow, looking at something off-camera. Visible stubble or tired eyes, slightly disheveled. Not a model',
    environment: 'A dim room lit by a single overhead fluorescent tube. Stark shadows on one side of face. Plain wall, maybe peeling paint. Sparse furniture',
    mood: 'Quiet dread — conveyed through tense stillness and sparse lighting, NOT through red filters or fire',
  },
  general: {
    subject: 'A real person in everyday clothes, in a natural unposed moment. Visible skin texture, natural hair with flyaways, slightly wrinkled clothing',
    environment: 'An ordinary real-world location — street, office, apartment. Practical mixed lighting. Visible wear-and-tear on surfaces',
    mood: 'Understated tension — conveyed through environment and expression, not effects',
  },
};

// ── Per-slide-type composition ──
const COMPOSITION_BY_TYPE: Record<string, string> = {
  hook: 'Wide establishing shot. Subject in lower-center, leaving generous clear space in upper 40% for text overlay. Shallow depth of field f/1.4. Rule of thirds',
  chapter_title: 'Extreme wide or overhead angle. Subject small in frame. At least 60% of frame is clean negative space for title text. Deep focus f/8',
  emphasis: 'Tight crop, slightly low angle. Subject fills lower third intensely. Upper two-thirds has soft out-of-focus background for text overlay',
  body: 'Medium shot, eye-level. Subject at right-third of frame. Left side has negative space for text. Natural depth of field',
  cta: 'Clean wide shot with subject distant. Large centered negative space. Minimal visual complexity',
};

export interface GeneratedImage {
  slideIndex: number;
  imageUrl: string;
}

export interface ImageGenCost {
  slideIndex: number;
  amountUsd: number;
  model: string;
}

export interface ImageGenResult {
  images: GeneratedImage[];
  costs: ImageGenCost[];
  totalCostUsd: number;
  errors: string[];
}

/**
 * Generate images for each non-CTA slide.
 *
 * @param apiKey - OpenAI API key
 * @param slides - Array of slides with text and type
 */
export async function generateSlideImages(
  apiKey: string,
  slides: Array<{ type: string; text: string; subtext?: string }>,
): Promise<ImageGenResult> {
  const images: GeneratedImage[] = [];
  const costs: ImageGenCost[] = [];
  const genErrors: string[] = [];
  let totalCostUsd = 0;

  // Generate images only for key slides (hook, chapter_title, emphasis)
  // Max 3 to keep total API time within Worker limits (~60s)
  const KEY_TYPES = ['hook', 'chapter_title', 'emphasis'];
  const slidesToGenerate = slides
    .map((slide, i) => ({ slide, index: i }))
    .filter(({ slide }) => KEY_TYPES.includes(slide.type))
    .slice(0, 3);

  const batchSize = 3;
  for (let batch = 0; batch < slidesToGenerate.length; batch += batchSize) {
    const chunk = slidesToGenerate.slice(batch, batch + batchSize);
    const results = await Promise.allSettled(
      chunk.map(async ({ slide, index }) => {
        const prompt = buildImagePrompt(slide.text, slide.type);
        console.log(`[ImageGen] Slide ${index} (${slide.type}): prompt length=${prompt.length}`);
        const imageUrl = await generateSingleImage(apiKey, prompt);
        return { slideIndex: index, imageUrl };
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        images.push(result.value);
        costs.push({ slideIndex: result.value.slideIndex, amountUsd: COST_PER_IMAGE, model: IMAGE_MODEL });
        totalCostUsd += COST_PER_IMAGE;
      } else {
        const errMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
        genErrors.push(errMsg);
        console.error(`[ImageGen] Failed:`, errMsg);
      }
    }
  }

  return { images, costs, totalCostUsd, errors: genErrors };
}

// ============================================
// Prompt Building — Editorial Photography Style
// ============================================

/**
 * Infer the content category from slide text using keyword matching.
 */
export function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return category;
    }
  }
  return 'general';
}

/**
 * Remove AI-smell blacklisted words from a prompt string.
 */
export function sanitizePrompt(prompt: string): string {
  let cleaned = prompt;
  for (const phrase of AI_SMELL_BLACKLIST) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    cleaned = cleaned.replace(regex, '');
  }
  // Clean up artifacts: double commas, double spaces, leading/trailing commas
  return cleaned
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*\./g, '.')
    .trim();
}

/**
 * Simple deterministic hash for consistent camera selection per slide text.
 */
function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Build an editorial-photography-style image prompt from slide text.
 *
 * Uses a slot-based template system:
 * [STYLE] Editorial photograph with specific camera/lens
 * [SUBJECT] Category-specific real person/scene
 * [CONTEXT] Derived from actual slide text
 * [ENVIRONMENT] Real-world location with practical lighting
 * [COMPOSITION] Text-overlay-friendly framing per slide type
 * [ANTI-AI] Imperfect real-world details
 * [MOOD] Conveyed through environment/expression, not effects
 * [NEGATIVE] Full anti-AI-smell negative prompt
 */
export function buildImagePrompt(text: string, slideType: string): string {
  const cleanText = text.replace(/[「」\*#\n]/g, ' ').replace(/\s+/g, ' ').trim();
  const category = inferCategory(cleanText);
  const visuals = CATEGORY_VISUALS[category] || CATEGORY_VISUALS.general;
  const camera = CAMERA_OPTIONS[hashCode(cleanText) % CAMERA_OPTIONS.length];
  const composition = COMPOSITION_BY_TYPE[slideType] || COMPOSITION_BY_TYPE.body;

  // Build prompt body (sanitized to remove any accidental blacklisted words)
  const body = sanitizePrompt([
    // STYLE
    `Editorial photograph. ${camera}. Natural available light, slightly underexposed. Subtle film grain, muted color palette, no post-processing filters.`,
    // SUBJECT
    `Subject: ${visuals.subject}.`,
    // CONTEXT
    `The image relates to: "${cleanText.substring(0, 100)}".`,
    // ENVIRONMENT
    `Setting: ${visuals.environment}.`,
    // COMPOSITION
    composition + '.',
    // ANTI-AI imperfections
    'Include subtle real-world imperfections: visible skin pores, natural hair flyaways, slightly uneven lighting, cloth wrinkles, matte surfaces not glossy, one element slightly soft-focus. No perfect symmetry.',
    // MOOD
    visuals.mood + '.',
    // Technical constraints for video overlay
    'No text, no letters, no words, no logos, no watermarks. Dark enough that white text overlaid will be clearly readable. Vertical portrait orientation (9:16 aspect ratio). Maximum 3 dominant colors.',
  ].join(' '));

  // Append negative prompt verbatim (it intentionally names blacklisted words)
  return body + ' ' + NEGATIVE_PROMPT;
}

// ============================================
// OpenAI API Caller
// ============================================

/**
 * Call OpenAI Images API to generate a single image.
 * Returns a data URI (base64 JPEG) or temporary URL.
 */
async function generateSingleImage(apiKey: string, prompt: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000); // 20s per image

  try {
    const res = await fetch(OPENAI_IMAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt,
        n: 1,
        size: '1024x1536',
        quality: 'low',
        output_format: 'jpeg',
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`OpenAI Images API error (${res.status}): ${errBody}`);
    }

    const data = await res.json() as any;

    // Handle both URL and b64_json response formats
    if (data.data?.[0]?.url) {
      return data.data[0].url;
    }
    if (data.data?.[0]?.b64_json) {
      return `data:image/jpeg;base64,${data.data[0].b64_json}`;
    }

    throw new Error('No image data in OpenAI response');
  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw new Error('OpenAI Images API timeout (20s)');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
