/**
 * Image Generator Service — gpt-image-1 variable-template system.
 *
 * Architecture:
 *   1. MASTER_TEMPLATE — variable-substitution prompt ({SUBJECT}, {SCENE}, …)
 *   2. CATEGORY_DEFAULTS — auto-resolves variables from content keywords
 *   3. SLIDE_VARIANTS — adjusts composition/intensity per slide type (hook/emphasis/body)
 *   4. REALISM_BLOCK — anti-AI directives injected into every prompt
 *   5. NEGATIVE_PROMPT — comprehensive ban list
 *   6. DEBUG_FIXES — single-line patches for common failures
 *
 * Goal: Japanese TikTok/Shorts "1枚目" that looks like a smartphone video
 * screenshot, NOT AI-generated, NOT a stock photo, NOT an ad template.
 */

const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';
const IMAGE_MODEL = 'gpt-image-1';
const COST_PER_IMAGE = 0.016;

// =============================================
// (C) Variable Definitions
// =============================================

export interface PromptVars {
  TOPIC: string;        // Theme/subject of the video (from slide text)
  SUBJECT: string;      // Person description (age, gender, appearance, clothes)
  SCENE: string;        // Setting (room, time of day, environment)
  EMOTION: string;      // Facial expression / reaction type
  LIGHTING: string;     // Light sources and color temperature
  PROPS: string;        // 2-4 background objects for lived-in feel
  CAMERA_FEEL: string;  // Noise / compression / blur level
  PALETTE: string;      // Color palette description
  COMPOSITION: string;  // Framing and text-overlay space
}

// =============================================
// (A) Master Prompt Template
// =============================================

/**
 * Variable-substitution master template.
 * Every {VAR} is replaced at runtime from PromptVars.
 */
const MASTER_TEMPLATE = [
  // ── 1. CAMERA / STYLE (the "what camera took this") ──
  'A single freeze-frame from a casual smartphone video (iPhone 15 / Pixel 8 rear camera, auto mode).',
  'Photorealistic. 9:16 vertical portrait, 1080x1920.',
  'This is NOT a professional photo, NOT an ad, NOT a stock image.',
  'It looks like a real moment someone captured on their phone.',
  '',
  // ── 2. SUBJECT ──
  '{SUBJECT}.',
  '',
  // ── 3. EXPRESSION (Japanese SNS calibration) ──
  'Expression: {EMOTION}.',
  'The reaction is UNDERSTATED — Japanese SNS style, not Western commercial overacting.',
  'Mouth is slightly open at most (no wide jaw-drop). Eyes are NOT unnaturally wide.',
  'Subtle left-right asymmetry in the face (one eye slightly narrower, one brow marginally higher).',
  'If teeth are visible, they are natural — slightly uneven, not Hollywood-white.',
  '',
  // ── 4. SCENE / BACKGROUND ──
  '{SCENE}.',
  'Background objects (2-4 items for lived-in feel): {PROPS}.',
  'Background has real texture (wall grain, fabric, wood). NOT abstract, NOT solid color, NOT gradient.',
  'Depth of field: background is slightly soft but objects are still identifiable. Do NOT over-blur — no fake bokeh.',
  '',
  // ── 5. LIGHTING ──
  'Lighting: {LIGHTING}.',
  'Light is MIXED and slightly UNEVEN — one side of the face has a subtle shadow.',
  'Absolutely no studio lighting, ring light, or beauty dish. The imperfection IS the realism.',
  '',
  // ── 6. COLOR PALETTE ──
  'Color palette: {PALETTE}.',
  'Colors are natural and ungraded. No cinematic LUT, no teal-orange, no desaturation.',
  'Skin tones are warm and natural with slight variation (pink nose/cheeks, natural unevenness).',
  '',
  // ── 7. COMPOSITION ──
  '{COMPOSITION}.',
  '',
  // ── 8. TOPIC CONTEXT ──
  'The video topic is: "{TOPIC}".',
  '',
].join('\n');

// ── Anti-AI Realism Block (always appended) ──
const REALISM_BLOCK = [
  '=== CRITICAL: ANTI-AI REALISM (must follow ALL) ===',
  // Skin
  'SKIN: Visible pores on nose/cheeks/forehead. Fine peach fuzz catching side light. Subtle redness on nose tip and cheek edges. Faint under-eye circles. Minor blemish or two. Skin tone is NOT uniform — slight warmth/coolness variation across the face. ABSOLUTELY NO smooth, airbrushed, poreless, plastic, or CGI skin.',
  // Hands/Fingers
  'HANDS: If holding a phone, the grip is natural and relaxed. All 5 fingers are anatomically correct with visible knuckles, natural nail shape, and slightly different finger lengths. Joints bend naturally. This is the most important detail — broken fingers instantly reveal AI.',
  // Hair
  'HAIR: Natural imperfection — a few flyaway strands, slight messiness at the crown or temple. Hair is NOT perfectly styled or salon-fresh. Individual strands catch light differently.',
  // Camera texture
  'CAMERA TEXTURE: {CAMERA_FEEL}. The overall image has the quality of a phone camera frame — detailed but not over-sharpened, with a lived-in digital texture. NOT film-like, NOT DSLR-like.',
  // Final grain
  'Apply very subtle sensor noise (NOT film grain) across the entire image, especially visible in shadow areas and the background. This is the final "phone camera" signature.',
  'No text, no letters, no words, no logos, no watermarks, no UI elements anywhere in the image.',
].join('\n');

// ── Negative Prompt (comprehensive ban list) ──
const NEGATIVE_PROMPT = [
  'NEGATIVE — Do NOT include ANY of the following:',
  // AI tells — skin/face
  'CGI skin, 3D-rendered appearance, plastic skin, poreless skin, perfectly smooth skin,',
  'airbrushed texture, uniform skin tone, unnaturally white teeth, perfect teeth alignment,',
  'perfectly symmetrical face, doll-like eyes, unnaturally large eyes, anime eyes,',
  // AI tells — lighting/camera
  'studio lighting, ring light catchlights, beauty lighting, perfectly even illumination,',
  'HDR tonemapping, over-sharpened, neon lighting, teal-orange grading, god-rays,',
  'lens flare, bokeh explosion, anamorphic artifacts,',
  // AI tells — expression/pose
  'exaggerated surprise, wide-open mouth shock, Western-commercial reaction,',
  'stock-photo smile, over-the-top acting, model pose, fashion pose,',
  // AI tells — background/composition
  'abstract background, solid color background, gradient background,',
  'geometric patterns, floating elements, empty void,',
  // AI tells — general
  'digital art, concept art, illustration, 3D render, CGI, fantasy,',
  'watermarks, text, logos, UI overlay,',
  'robots, cyborgs, fire, smoke, particle effects, glowing elements,',
  'dark moody atmosphere, horror aesthetic, desaturated skin.',
].join(' ');

// =============================================
// Category → Default Variable Sets
// =============================================

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  business: ['revenue', 'profit', 'company', 'startup', 'market', 'invest', 'economy', 'CEO', 'billion', 'growth', '企業', '売上', '利益', '経済', 'ビジネス', '投資', '億', '万円', '稼'],
  technology: ['AI', 'algorithm', 'data', 'software', 'app', 'machine learning', 'automation', 'code', 'API', 'テクノロジー', '技術', 'アルゴリズム', '自動化', 'プログラム', 'ChatGPT', 'ロボット'],
  health: ['health', 'medicine', 'doctor', 'hospital', 'disease', 'treatment', 'diet', 'exercise', 'mental', '健康', '医療', '病院', '治療', '運動', 'ダイエット', '筋トレ', '睡眠'],
  money: ['money', 'rich', 'wealthy', 'income', 'salary', 'save', 'debt', 'loan', 'tax', 'お金', '貯金', '節約', '年収', '副業', '借金', '税金', '資産', '不動産'],
  danger: ['risk', 'threat', 'crisis', 'warning', 'danger', 'collapse', 'fraud', 'scam', 'hack', '危険', '詐欺', 'リスク', '崩壊', '警告', '脅威', 'ハッキング', 'やばい', '注意'],
  lifestyle: ['life', 'habit', 'morning', 'routine', 'productivity', 'success', '習慣', '朝活', '生活', 'ルーティン', '成功', '人生', '時間'],
};

type CategoryDefaults = Omit<PromptVars, 'TOPIC' | 'COMPOSITION'>;

const CATEGORY_DEFAULTS: Record<string, CategoryDefaults> = {
  business: {
    SUBJECT: 'A Japanese person in their late 20s to early 30s, wearing a neat but casual button-up shirt (not a suit), normal build, not model-like — an ordinary office worker you might see on the Yamanote line',
    SCENE: 'Sitting at a desk in a home office or small co-working space. The room has visible wall texture (white or light gray), a small shelf with a few books and a plant',
    EMOTION: 'A quiet "I just realized something important" face — eyebrows slightly raised, lips pressed together, eyes focused on the screen. Not smiling, not shocked',
    LIGHTING: 'Warm ceiling light from above-right plus cool laptop screen glow on the face from below-left. Mixed color temperature. One side of the face is slightly in shadow',
    PROPS: 'Coffee mug, a few papers, a pen, the edge of a laptop',
    CAMERA_FEEL: 'Subtle sensor noise in shadow areas, faint JPEG compression, very slight motion softness on one hand',
    PALETTE: 'Warm whites, wood tones, cool blue screen reflection on skin, natural indoor lighting colors',
  },
  technology: {
    SUBJECT: 'A Japanese person in their 20s-30s wearing a plain T-shirt or hoodie, holding a smartphone with both hands. Normal appearance — not a tech influencer, just someone scrolling at home',
    SCENE: 'Sitting on a sofa or at a low table in a typical Japanese apartment living room. The room feels lived-in — not minimalist, not cluttered',
    EMOTION: 'Subtle fascination mixed with disbelief — eyebrows slightly raised, mouth barely open, leaning slightly forward toward the screen. A "wait, is this real?" moment',
    LIGHTING: 'Room lighting from above plus smartphone screen glow illuminating the face from below. Warm room light and cool phone light create mixed color temperature on the face',
    PROPS: 'Remote control on the table, a drink (can or mug), a charging cable, a cushion',
    CAMERA_FEEL: 'Subtle sensor noise, faint compression, very slight motion blur on the phone-holding hands',
    PALETTE: 'Warm room tones, cool phone-screen blue reflecting on face, natural skin tones with slight redness on nose',
  },
  health: {
    SUBJECT: 'A Japanese person in their 20s-30s wearing activewear (T-shirt and shorts/leggings), slightly sweaty, normal athletic build — not a fitness model, a regular gym-goer',
    SCENE: 'A park with grass and trees, OR a home workout space with a yoga mat on the floor. Natural, functional setting',
    EMOTION: 'A genuine "huh, I didn\'t know that" expression — slight head tilt, eyes slightly narrowed in thought, a hint of a curious half-smile',
    LIGHTING: 'Natural daylight (slightly overcast, not golden hour perfection) OR gym/room fluorescent. Functional light, not styled',
    PROPS: 'Water bottle, yoga mat or resistance band, a towel, earbuds case',
    CAMERA_FEEL: 'Subtle sensor noise, slight motion softness on hair or the person\'s moving arm, natural outdoor/indoor light quality',
    PALETTE: 'Natural greens and earth tones outdoors, gym grays and whites indoors, warm natural skin tones',
  },
  money: {
    SUBJECT: 'A Japanese person in their late 20s to early 30s in casual home clothes (T-shirt, sweatpants), sitting cross-legged or leaning back. Not wealthy-looking — a normal person checking their phone at home',
    SCENE: 'Evening at home in a typical Japanese apartment. Sofa or floor cushion. The room feels real and lived-in',
    EMOTION: 'Quiet disbelief — eyes slightly narrowed, one eyebrow raised, maybe touching their chin or lower lip. Like someone who just saw an unexpected number on their phone. NOT shocked, more "wait… seriously?"',
    LIGHTING: 'Typical Japanese room: warm ceiling light plus cool smartphone screen glow on the face. One side slightly in shadow. Warm overall with blue screen accent',
    PROPS: 'Tissue box, a cushion, a shelf with small items, a half-empty mug',
    CAMERA_FEEL: 'Subtle sensor noise, faint JPEG compression on background details, very slight motion softness on hands',
    PALETTE: 'Warm indoor tones, natural skin color, cool screen-blue accent on face, muted background',
  },
  danger: {
    SUBJECT: 'A Japanese person in their 20s-30s in a T-shirt, normal appearance. Their posture is slightly tense — leaning forward or holding their phone closer than usual',
    SCENE: 'Night-time in a Japanese apartment room. Slightly dimmer than usual — evening lighting. Door, curtain, or wall visible in the background',
    EMOTION: 'Subtle worry or unease — slight frown, pressed lips, maybe a tiny furrow between the eyebrows. A "this is bad" face. NOT wide-eyed panic — more like a quiet sinking feeling',
    LIGHTING: 'Slightly dim room lighting plus cool phone screen glow. The dimness conveys mood but the face is still clearly visible. Not dramatically dark — just "late evening at home" level',
    PROPS: 'A bag on a chair, a closed laptop, a glass of water, the edge of a curtain',
    CAMERA_FEEL: 'Slightly more visible sensor noise (low-light phone camera), faint compression, natural low-light quality',
    PALETTE: 'Slightly cooler tones overall, warm skin tones preserved, muted background. Not desaturated — just naturally cooler evening light',
  },
  lifestyle: {
    SUBJECT: 'A Japanese person in their 20s-30s in casual comfortable clothes (oversized T-shirt, cardigan), relaxed posture. Approachable, not styled — like someone you\'d see at a neighborhood cafe',
    SCENE: 'A cozy setting — cafe table by a window, home sofa with cushions, or a bedroom desk. The space feels personal and warm',
    EMOTION: 'Calm curiosity — a relaxed interested expression, like scrolling TikTok and finding something unexpectedly cool. Slight smile or raised eyebrow, no intensity',
    LIGHTING: 'Warm ambient light from a table lamp, window, or cafe pendant light. Gentle and slightly uneven with natural soft shadows. Not flat or diffused — directional but soft',
    PROPS: 'A warm drink in a ceramic mug, a small plant, a book or magazine, a soft throw blanket',
    CAMERA_FEEL: 'Subtle sensor noise, very faint compression, slight warmth from the ambient light giving a cozy phone-camera quality',
    PALETTE: 'Warm earth tones — cream, brown, forest green. Touches of gold from warm light. Natural skin tones',
  },
  general: {
    SUBJECT: 'A Japanese person in their 20s-30s in casual everyday clothes, normal appearance. Someone you might see on a Tokyo train — unremarkable in the best way',
    SCENE: 'A realistic everyday Japanese indoor setting — apartment, cafe, or office break room. Background has lived-in details: some furniture, items on a shelf, a bag',
    EMOTION: 'A natural, unforced reaction — curiosity, mild surprise, or quiet intrigue. The kind of face you\'d make looking at something interesting on your phone',
    LIGHTING: 'Mixed ambient light: overhead room light plus a secondary source (window, screen, lamp). Slightly uneven — one side of the face has a natural shadow',
    PROPS: 'A bag or backpack, a drink, a shelf with small items, a charger or cable',
    CAMERA_FEEL: 'Subtle sensor noise, faint JPEG compression, very slight motion softness on one element (hand or hair)',
    PALETTE: 'Natural unstyled colors matching the environment. Warm skin tones with realistic variation (pink nose/cheeks, natural unevenness)',
  },
};

// =============================================
// (A-3) Slide Type Variants (A/B/C)
// =============================================

interface SlideVariant {
  composition: string;
  intensityNote: string; // extra instruction to tune emotion/framing
}

const SLIDE_VARIANTS: Record<string, SlideVariant> = {
  // A) Hook — strongest attention grab, tightest framing
  hook: {
    composition: 'Subject centered in the lower 55-60% of the frame, chest-up framing. Upper 40% has REAL blurred background content (wall, shelf, ceiling) — NOT an empty void. This space will receive text overlay. The subject is the single undeniable focal point. Framing feels like someone across the table pointed their phone camera at this person',
    intensityNote: 'This is the HOOK frame — the expression should be at the stronger end of the emotion range (but still Japanese-understated). The viewer should feel "I need to know what they just saw."',
  },
  // B) Emphasis — strong subject presence, medium framing
  emphasis: {
    composition: 'Medium close-up, subject fills lower 60%. Upper 40% has real blurred background for text overlay. Eye line is natural — looking slightly off-camera at a phone or screen, NOT staring dead-center into camera. The emphasis is on the subject\'s face and reaction',
    intensityNote: 'This is the EMPHASIS frame — the emotion is clear but not extreme. The expression reinforces whatever the narration is saying at this point.',
  },
  // C) Chapter Title — wider context, more environment
  chapter_title: {
    composition: 'Wider shot showing more environment (60% background, 40% subject). Subject is visible but not dominating. Multiple background elements identifiable. Good space for text in upper 50%. Feels like a scene-setting shot from a vlog',
    intensityNote: 'This is a CONTEXT frame — the emotion is neutral or mildly curious. The setting matters as much as the person here.',
  },
  // Defaults for body/cta
  body: {
    composition: 'Medium shot showing subject and surroundings. Natural phone-camera framing — slightly off-center, not perfectly composed. One side has more background space. Candid, unposed feel',
    intensityNote: 'Natural, neutral expression. This frame supports the narration without competing for attention.',
  },
  cta: {
    composition: 'Slightly wider shot with subject centered, more background visible. The composition feels like a paused video — natural and unstaged. Space for text overlay in both upper and lower areas',
    intensityNote: 'Calm, approachable expression. A slight smile or neutral face. Inviting, not intense.',
  },
};

// =============================================
// (B) Debug Fixes — single-line patches
// =============================================

/**
 * Common failure → 1-2 line prompt additions that fix the issue.
 * Apply these by appending to the generated prompt when a specific
 * problem is detected in the output image.
 */
export const DEBUG_FIXES: Record<string, string> = {
  // Fingers broken / unnatural grip
  fingers: 'OVERRIDE — HANDS: Show exactly 5 fingers per hand with correct anatomy. The phone grip is relaxed: thumb on front screen edge, 4 fingers wrapped behind. Each finger has 3 visible segments with natural knuckle creases. Nails are short and natural.',

  // Skin too smooth / plastic
  skin_plastic: 'OVERRIDE — SKIN: Increase skin texture dramatically. Every square centimeter of facial skin must have visible pores. Add 2-3 tiny blemishes (not acne — just normal skin variation). Under-eye area has fine lines and slight darkness. Forehead has faint horizontal lines. The skin looks lived-in, not fresh-out-of-photoshop.',

  // Expression too exaggerated / Western
  expression_overacted: 'OVERRIDE — EXPRESSION: Reduce all facial movement by 50%. The mouth is barely open (1cm gap at most). The eyes are NOT wide — if anything, they are slightly narrowed in concentration. Think of a Japanese person who just read something surprising on their phone but is too reserved to react dramatically. Zero performance, zero acting.',

  // Looks like an ad / stock photo
  too_commercial: 'OVERRIDE — CAMERA: This must look like an accidental freeze-frame from a phone video, NOT a photograph. Increase sensor noise visibility. Add noticeable JPEG compression artifacts on background edges. The person is NOT posing — they are caught mid-moment. Lighting is uneven and imperfect. Nothing in this image should look intentionally composed.',

  // Background too abstract / empty
  background_empty: 'OVERRIDE — BACKGROUND: The background MUST contain identifiable real-world objects. I should be able to point at the background and say "that\'s a shelf, that\'s a plant, that\'s a tissue box." Do NOT use abstract colors, gradients, or empty space. The background is a real Japanese room with real things in it.',

  // Lighting too perfect / studio
  lighting_studio: 'OVERRIDE — LIGHTING: Remove all even illumination. The light comes from 2 sources at different angles and different color temperatures (warm room light + cool screen light). One side of the face is visibly darker than the other. There are no catch-light rings in the eyes. The lighting is messy and real.',

  // Eyes too symmetrical / too large
  eyes_unnatural: 'OVERRIDE — EYES: Make the eyes normal human size (not anime-large). The left eye should be very slightly narrower than the right. The irises are NOT perfectly centered — one looks very slightly more to the side. The white of the eyes has faint blood vessels. Eye shape follows natural Japanese East Asian features.',

  // Teeth too perfect / too white
  teeth_perfect: 'OVERRIDE — TEETH: If teeth are visible, they must be natural. Slight yellowish tint (not white), minor unevenness in alignment, natural gaps. Japanese dental aesthetics — not American cosmetic dentistry.',

  // Hair too perfect / uniform
  hair_uniform: 'OVERRIDE — HAIR: Add 3-5 visible flyaway strands at the crown and temples. The part line is slightly imprecise. Some strands are lighter where light hits them, others are in shadow. The hair looks like it was last washed this morning, not styled for a photoshoot.',

  // Overall too sharp / HDR
  oversharpened: 'OVERRIDE — SHARPNESS: Reduce overall sharpness. Skin texture is visible but not razor-sharp. Background details are slightly soft. The image has the quality of a phone camera auto-mode shot — detailed but not over-processed. No HDR, no clarity slider abuse.',
};

// =============================================
// AI-Smell Blacklist
// =============================================

const AI_SMELL_BLACKLIST = [
  'cinematic', 'epic', 'hyper-realistic', 'ultra-detailed', 'ultra-high-definition',
  '8k', '4k', 'unreal engine', 'octane render', 'volumetric lighting', 'god rays',
  'glowing eyes', 'neon', 'cyberpunk', 'futuristic', 'holographic',
  'particle effects', 'lens flare', 'bokeh explosion',
  'concept art', 'digital art', 'fantasy art', 'sci-fi art',
  'ray tracing', 'subsurface scattering', 'chromatic aberration',
  'vaporwave', 'ethereal', 'surreal', 'dreamlike',
  'otherworldly', 'magical', 'cosmic', 'light beams', 'anamorphic',
  '3d render', 'cgi', 'perfect skin', 'flawless', 'porcelain',
  'gradient background', 'abstract geometric',
  'dark moody atmosphere', 'moody lighting',
  'professional lighting', 'studio lighting', 'beauty lighting',
  'magazine', 'editorial', 'commercial photography',
  'stock photo', 'advertising', 'glamour',
  'perfect symmetry', 'symmetrical face',
  'airbrushed', 'retouched', 'smooth skin',
];

// =============================================
// Public API
// =============================================

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
 * Generate images for key slides (hook, chapter_title, emphasis).
 * Max 3 images per video to stay within Worker time limits.
 */
export async function generateSlideImages(
  apiKey: string,
  slides: Array<{ type: string; text: string; subtext?: string }>,
): Promise<ImageGenResult> {
  const images: GeneratedImage[] = [];
  const costs: ImageGenCost[] = [];
  const genErrors: string[] = [];
  let totalCostUsd = 0;

  // Gather full script for category inference (more context = better category)
  const fullScript = slides.map(s => s.text).join(' ');
  const globalCategory = inferCategory(fullScript);

  const KEY_TYPES = ['hook', 'chapter_title', 'emphasis'];
  const slidesToGenerate = slides
    .map((slide, i) => ({ slide, index: i }))
    .filter(({ slide }) => KEY_TYPES.includes(slide.type))
    .slice(0, 3);

  const results = await Promise.allSettled(
    slidesToGenerate.map(async ({ slide, index }) => {
      const prompt = buildImagePrompt(slide.text, slide.type, globalCategory);
      console.log(`[ImageGen] Slide ${index} (${slide.type}): prompt length=${prompt.length}, category=${globalCategory}`);
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

  return { images, costs, totalCostUsd, errors: genErrors };
}

// =============================================
// Prompt Building
// =============================================

/**
 * Infer the content category from text using keyword matching.
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
    cleaned = cleaned.replace(new RegExp(escaped, 'gi'), '');
  }
  return cleaned
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*\./g, '.')
    .trim();
}

/**
 * Build a complete image prompt using the variable-template system.
 *
 * Flow:
 *   1. Resolve category from text (or use provided override)
 *   2. Load category defaults for all variables
 *   3. Override COMPOSITION from slide type variant
 *   4. Fill MASTER_TEMPLATE with resolved variables
 *   5. Append REALISM_BLOCK and NEGATIVE_PROMPT
 *   6. Sanitize to strip any AI-smell words
 */
export function buildImagePrompt(
  text: string,
  slideType: string,
  categoryOverride?: string,
): string {
  const cleanText = text.replace(/[「」\*#\n]/g, ' ').replace(/\s+/g, ' ').trim();
  const category = categoryOverride || inferCategory(cleanText);

  // 1. Load category defaults
  const defaults = CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.general;

  // 2. Load slide type variant
  const variant = SLIDE_VARIANTS[slideType] || SLIDE_VARIANTS.body;

  // 3. Build final variable set
  const vars: PromptVars = {
    TOPIC: cleanText.substring(0, 100),
    SUBJECT: defaults.SUBJECT,
    SCENE: defaults.SCENE,
    EMOTION: defaults.EMOTION,
    LIGHTING: defaults.LIGHTING,
    PROPS: defaults.PROPS,
    CAMERA_FEEL: defaults.CAMERA_FEEL,
    PALETTE: defaults.PALETTE,
    COMPOSITION: variant.composition,
  };

  // 4. Fill template
  let prompt = MASTER_TEMPLATE;
  for (const [key, value] of Object.entries(vars)) {
    prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  // 5. Append variant intensity note + realism block + negative
  // Replace {CAMERA_FEEL} in REALISM_BLOCK too
  const realismWithCamera = REALISM_BLOCK.replace('{CAMERA_FEEL}', vars.CAMERA_FEEL);

  const fullPrompt = [
    prompt.trim(),
    variant.intensityNote,
    realismWithCamera,
    NEGATIVE_PROMPT,
  ].join('\n\n');

  // 6. Sanitize and return
  return sanitizePrompt(fullPrompt);
}

// =============================================
// OpenAI API Caller
// =============================================

async function generateSingleImage(apiKey: string, prompt: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

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

    if (data.data?.[0]?.url) {
      return data.data[0].url;
    }
    if (data.data?.[0]?.b64_json) {
      return `data:image/jpeg;base64,${data.data[0].b64_json}`;
    }

    throw new Error('No image data in OpenAI response');
  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw new Error('OpenAI Images API timeout (25s)');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
