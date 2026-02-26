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
// (A-3) Slide Type Variants — Person slides
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
  emphasis: {
    composition: 'Medium close-up, subject fills lower 60%. Upper 40% has real blurred background for text overlay. Eye line is natural — looking slightly off-camera at a phone or screen, NOT staring dead-center into camera. The emphasis is on the subject\'s face and reaction',
    intensityNote: 'This is the EMPHASIS frame — the emotion is clear but not extreme. The expression reinforces whatever the narration is saying at this point.',
  },
  chapter_title: {
    composition: 'Wider shot showing more environment (60% background, 40% subject). Subject is visible but not dominating. Multiple background elements identifiable. Good space for text in upper 50%. Feels like a scene-setting shot from a vlog',
    intensityNote: 'This is a CONTEXT frame — the emotion is neutral or mildly curious. The setting matters as much as the person here.',
  },
  body: {
    composition: 'Medium shot showing subject and surroundings. Natural phone-camera framing — slightly off-center, not perfectly composed. One side has more background space. Candid, unposed feel',
    intensityNote: 'Natural, neutral expression. This frame supports the narration without competing for attention.',
  },
};

// =============================================
// (A-4) Content Scene Variants — Object/scene images (no people)
// Each category has multiple variants for visual diversity across slides.
// =============================================

interface ContentSceneVars {
  SCENE_DESCRIPTION: string;
  SCENE_DETAILS: string;
  LIGHTING: string;
  PALETTE: string;
  CAMERA_FEEL: string;
}

const CONTENT_SCENE_VARIANTS: Record<string, ContentSceneVars[]> = {
  business: [
    { SCENE_DESCRIPTION: 'A workspace — laptop open with charts/data on screen, documents and a notebook with handwritten notes on a real wooden desk, coffee mug nearby', SCENE_DETAILS: 'Items are slightly messy — papers not perfectly aligned, pen cap off, sticky notes with Japanese text. Real office texture: wood grain desk.', LIGHTING: 'Mixed office light — overhead fluorescent plus window daylight from one side. Screen glow adding blue tint to nearby objects', PALETTE: 'Warm wood tones, white papers, blue-gray screen glow, natural indoor colors', CAMERA_FEEL: 'Subtle sensor noise in shadow areas, faint JPEG compression, typical phone camera indoor quality' },
    { SCENE_DESCRIPTION: 'A conference table with a whiteboard showing handwritten diagrams and sticky notes, markers scattered, empty coffee cups', SCENE_DETAILS: 'Whiteboard has real marker smudges and partially erased old notes. Table has water rings from cups. Professional but lived-in.', LIGHTING: 'Bright overhead office lighting with natural window light from the side', PALETTE: 'White board, colorful markers, warm wood table, neutral office tones', CAMERA_FEEL: 'Clean indoor phone camera quality, slight fluorescent texture, natural sharpness' },
    { SCENE_DESCRIPTION: 'Close-up of a printed spreadsheet with highlighted rows and handwritten margin notes, a calculator and pen on a desk', SCENE_DETAILS: 'Paper has fold creases, highlighter marks slightly uneven. Real ballpoint pen with cap off. Natural desk clutter around edges.', LIGHTING: 'Desk lamp casting warm directional light with overhead ambient', PALETTE: 'White paper, yellow highlights, blue pen ink, warm desk lamp glow', CAMERA_FEEL: 'Macro-ish phone camera focus on papers, background slightly soft' },
  ],
  technology: [
    { SCENE_DESCRIPTION: 'Close-up of a smartphone screen showing an app interface, with earbuds and a charging cable on a desk', SCENE_DETAILS: 'Phone screen has fingerprints visible. Earbuds case slightly scratched. Cable loosely coiled. Functional, not aesthetic.', LIGHTING: 'Screen glow as primary light source, warm room ambient from the side', PALETTE: 'Cool screen blues, warm ambient highlights, matte black device surfaces', CAMERA_FEEL: 'Subtle sensor noise, slight screen glow flare, natural phone camera quality' },
    { SCENE_DESCRIPTION: 'A laptop keyboard and trackpad in close-up, with code visible on screen edge, a mouse and USB hub nearby', SCENE_DETAILS: 'Keys show slight wear and finger oils. Desk has a mousepad with curled edges. Real developer workspace feel.', LIGHTING: 'Cool monitor light illuminating keyboard from above, warm room light from behind', PALETTE: 'Dark keyboard grays, cool screen light, warm ambient accents', CAMERA_FEEL: 'Slight motion blur on screen content, natural indoor tech lighting' },
    { SCENE_DESCRIPTION: 'Multiple screens showing data dashboards and graphs, mechanical keyboard, coffee mug on a standing desk', SCENE_DETAILS: 'Screens show real-looking UI. Desk has cable management clips. Mug has a tech company logo. Authentic workspace.', LIGHTING: 'Multi-monitor glow creating blue-white ambient. Overhead warm room light balancing', PALETTE: 'Cool monitor blues and greens, warm wood desk, black peripherals', CAMERA_FEEL: 'Slight screen moire pattern, natural office tech environment' },
  ],
  health: [
    { SCENE_DESCRIPTION: 'Fresh vegetables and fruits on a wooden cutting board — colorful bell peppers, leafy greens, tomatoes. A knife and glass of water nearby', SCENE_DETAILS: 'Slightly bruised tomato, water droplets on veggies. Cutting board has knife marks. Natural, not food-styled.', LIGHTING: 'Warm morning sunlight through a window, soft and directional', PALETTE: 'Fresh greens, warm reds and oranges, natural wood tones, morning golden light', CAMERA_FEEL: 'Warm light slight overexposure near window, natural food photo quality' },
    { SCENE_DESCRIPTION: 'A yoga mat on a wooden floor with a water bottle, a towel, and wireless earbuds. Morning light casting long shadows', SCENE_DETAILS: 'Mat has subtle use marks. Towel slightly rumpled. Floor shows natural wood grain. Lived-in fitness space.', LIGHTING: 'Strong morning sidelight from a large window. Long shadows across the floor', PALETTE: 'Yoga mat purple/blue, warm wood floor, white towel, morning golden highlights', CAMERA_FEEL: 'Clean daylight phone quality, slight lens flare from window' },
    { SCENE_DESCRIPTION: 'A bathroom counter with supplements, vitamins, a glass of water, and a small towel. Mirror edge visible', SCENE_DETAILS: 'Supplement bottles with labels partially visible. Water glass has condensation. Counter has minor water splashes.', LIGHTING: 'Bright bathroom vanity light from above, slightly cool. Mirror reflection adds depth', PALETTE: 'Clean whites, clear glass, colorful supplement labels, chrome fixtures', CAMERA_FEEL: 'Bright indoor phone camera, slight mirror reflection' },
  ],
  money: [
    { SCENE_DESCRIPTION: 'Japanese yen bills and coins spread on a table, with a calculator showing numbers, a receipt, and a wallet', SCENE_DETAILS: 'Bills slightly crumpled, coins stacked unevenly. Wallet has wear marks. Calculator shows realistic numbers.', LIGHTING: 'Warm evening room light from above, slightly dim and intimate', PALETTE: 'Warm browns, currency greens and silvers, calculator gray, muted wood', CAMERA_FEEL: 'Subtle sensor noise in dim areas, evening indoor phone quality' },
    { SCENE_DESCRIPTION: 'A phone screen showing a banking or investment app with a graph, placed on a table next to a notebook with calculations', SCENE_DETAILS: 'Phone screen shows realistic app UI. Notebook has handwritten numbers and arrows. Pen beside it.', LIGHTING: 'Phone screen glow as accent light, warm overhead room light', PALETTE: 'Cool screen blues and greens, warm paper tones, dark table', CAMERA_FEEL: 'Screen glow creating slight flare, indoor evening quality' },
    { SCENE_DESCRIPTION: 'A piggy bank or savings jar with coins, next to a calendar and some bills on a kitchen counter', SCENE_DETAILS: 'Jar has accumulated coins visibly. Calendar has dates circled. Bills are folded. Kitchen counter texture visible.', LIGHTING: 'Kitchen ceiling light, warm and slightly yellow', PALETTE: 'Warm kitchen tones, metallic coin shimmer, white calendar', CAMERA_FEEL: 'Typical kitchen phone photo, subtle noise, natural sharpness' },
  ],
  danger: [
    { SCENE_DESCRIPTION: 'A phone screen showing a suspicious phishing email with a red warning icon, in a dim room', SCENE_DETAILS: 'Phone screen is the brightest element. The email looks realistic but suspicious. Surrounding darkness creates tension.', LIGHTING: 'Low room lighting, phone screen as primary light', PALETTE: 'Cool blues from screen, dim warm ambient, red warning accent', CAMERA_FEEL: 'More visible sensor noise (low-light), natural low-light quality' },
    { SCENE_DESCRIPTION: 'A padlock and chain on a dark surface, with a key nearby and scratches on the lock. Dim red light in background', SCENE_DETAILS: 'Padlock shows wear — scratched metal, slightly rusted chain links. Key has worn edge. Surface has real texture.', LIGHTING: 'Dim ambient with slight red cast. Low-key dramatic shadows', PALETTE: 'Dark grays, metallic silver, slight red accent, muted warm background', CAMERA_FEEL: 'Low-light sensor noise, slight grain in shadows' },
    { SCENE_DESCRIPTION: 'A laptop screen showing a security alert notification, with cold half-empty coffee and crumpled paper nearby', SCENE_DETAILS: 'Screen shows realistic-looking alert. Coffee is cold with skin on top. Paper crumpled as if frustrated. Late-night desk.', LIGHTING: 'Laptop screen as main light in dark room. Cool glow on all objects', PALETTE: 'Cool blue-white screen, dark room, muted objects, slight red from alerts', CAMERA_FEEL: 'Night-time phone quality, visible noise, screen glow dominating' },
  ],
  lifestyle: [
    { SCENE_DESCRIPTION: 'A coffee mug with steam on a table by a window, an open notebook with a pen, a small plant nearby', SCENE_DETAILS: 'Mug has a small chip. Notebook has dog-eared pages. Plant has some yellowing leaves. Lived-in comfort.', LIGHTING: 'Soft window light, warm and gentle. Natural, not styled', PALETTE: 'Warm creams, coffee browns, soft greens, morning golden tones', CAMERA_FEEL: 'Warm light quality, slight overexposure near window, cozy phone feel' },
    { SCENE_DESCRIPTION: 'A neatly made bed with a book face-down on pillow, morning light through curtains, bedside table with clock and water', SCENE_DETAILS: 'Sheets wrinkled from sleep. Book has bookmark. Curtains filter soft light. Personal and restful room.', LIGHTING: 'Diffused morning light through curtains, soft warm glow', PALETTE: 'Soft whites and creams, warm wood bedside table, golden morning light', CAMERA_FEEL: 'Soft morning phone photo, gentle warmth, slightly dreamy' },
    { SCENE_DESCRIPTION: 'A cafe table from above — a latte with foam art, a croissant on a plate, a magazine, and sunglasses', SCENE_DETAILS: 'Latte foam slightly asymmetric. Croissant has flaky crumbs. Magazine open to random page. Table has natural cafe wear.', LIGHTING: 'Bright outdoor/window light, sharp but pleasant shadows', PALETTE: 'Coffee browns, golden croissant, white plate, warm wood, bright daylight', CAMERA_FEEL: 'Clean daylight phone photo, slight harsh shadows, natural outdoor quality' },
  ],
  general: [
    { SCENE_DESCRIPTION: 'An everyday Japanese scene — items on a table in a normal apartment with a window view', SCENE_DETAILS: 'Mundane but authentic — real textures, slight wear, normal Japanese daily life.', LIGHTING: 'Mixed ceiling and window light for indoor', PALETTE: 'Natural unstyled colors, muted Japanese apartment tones', CAMERA_FEEL: 'Subtle sensor noise, typical phone auto-mode quality' },
    { SCENE_DESCRIPTION: 'A Japanese convenience store shelf with colorful products, snacks, and drinks arranged neatly', SCENE_DETAILS: 'Products have real Japanese labels. Some items slightly askew. Shelf has price tags. Fluorescent-lit konbini beauty.', LIGHTING: 'Bright fluorescent store lighting from above, slightly cool', PALETTE: 'Colorful product packaging, white shelf, cool fluorescent tones', CAMERA_FEEL: 'Clean indoor phone photo, fluorescent light quality' },
    { SCENE_DESCRIPTION: 'A quiet Japanese neighborhood street with power lines, a vending machine, and a bicycle parked against a wall', SCENE_DETAILS: 'Vending machine glows in afternoon light. Bicycle slightly rusty. Wall has natural weathering. Quintessential daily scene.', LIGHTING: 'Afternoon outdoor light, warm and slightly golden', PALETTE: 'Warm afternoon tones, blue sky, gray concrete, red vending machine accent', CAMERA_FEEL: 'Natural outdoor phone photo, slight distance haze, warm afternoon quality' },
  ],
};

/** Pick a scene variant by slide index for visual diversity */
function getContentScene(category: string, slideIndex: number): ContentSceneVars {
  const variants = CONTENT_SCENE_VARIANTS[category] || CONTENT_SCENE_VARIANTS.general;
  return variants[slideIndex % variants.length];
}

// ── Content Scene Master Template (no people) ──
const CONTENT_TEMPLATE = [
  'A single photorealistic smartphone photo (iPhone 15 / Pixel 8 rear camera, auto mode).',
  'Photorealistic. 9:16 vertical portrait, 1080x1920.',
  'This is NOT a professional photo, NOT an ad, NOT a stock image.',
  'It looks like a real photo someone casually took on their phone.',
  '',
  'The photo shows: {SCENE_DESCRIPTION}.',
  '{SCENE_DETAILS}',
  '',
  'This scene relates to the topic: "{TOPIC}".',
  '',
  'Lighting: {LIGHTING}.',
  'Light is natural and slightly uneven. No studio lighting.',
  '',
  'Color palette: {PALETTE}.',
  'Colors are natural and ungraded. No cinematic LUT, no filters.',
  '',
  '{COMPOSITION}.',
  '',
  'IMPORTANT: There are NO people, NO human figures, NO hands, NO faces in this image.',
  'The focus is entirely on objects, the scene, and the environment.',
  'No text, no letters, no words, no logos, no watermarks, no UI elements anywhere in the image.',
  '',
].join('\n');

// ── Content Realism Block (for object/scene images) ──
const CONTENT_REALISM_BLOCK = [
  '=== CRITICAL: ANTI-AI REALISM (must follow ALL) ===',
  'TEXTURES: All surfaces have visible real-world texture — wood grain, fabric weave, paper fiber, metal scratches, glass fingerprints. Nothing is perfectly smooth or CGI-clean.',
  'OBJECTS: Items show signs of real use — minor scuffs, dust, fingerprints, slight discoloration. Not brand-new showroom items.',
  'DEPTH: Background is slightly softer but objects are identifiable. No fake bokeh — natural phone camera depth of field.',
  'CAMERA TEXTURE: {CAMERA_FEEL}. The image has typical phone camera quality — detailed but not over-sharpened.',
  'Apply very subtle sensor noise across the image, especially in shadow areas. This is the "phone camera" signature.',
  'No text, no letters, no words, no logos, no watermarks, no UI elements.',
].join('\n');

// ── Content Slide Variants (composition for scene/object images) ──
const CONTENT_SLIDE_VARIANTS: Record<string, SlideVariant> = {
  hook: {
    composition: 'Tight close-up of the most eye-catching element in the scene, filling 70% of the frame. The most interesting object or detail is front and center. Upper 30% has real background for text overlay',
    intensityNote: 'This is the HOOK frame — the visual should be immediately attention-grabbing. Show the most striking, curious, or dramatic element of the topic.',
  },
  emphasis: {
    composition: 'Medium close-up of key scene elements. Main objects fill the lower 60%. Upper 40% has real background for text overlay. Strong visual focus on what matters most',
    intensityNote: 'This is the EMPHASIS frame — the visual reinforces the key message. The object/scene should feel significant and noteworthy.',
  },
  body: {
    composition: 'Medium shot showing the scene with context. Natural phone camera framing — slightly off-center, not perfectly composed. Candid, natural feel. Good space for text overlay in upper portion',
    intensityNote: 'Natural scene shot. The image supports the narration with relevant visual context.',
  },
  chapter_title: {
    composition: 'Wider establishing shot of the environment. Multiple objects visible. Good space for text in upper 50%. Scene-setting feel that gives context to the topic',
    intensityNote: 'Context frame — the environment and setting matter here. Show the bigger picture.',
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
 * Generate images for slides. Picks up to 6 evenly spaced slides.
 * Priority: hook first, then evenly distributed across remaining slides.
 */
export async function generateSlideImages(
  apiKey: string,
  slides: Array<{ type: string; text: string; subtext?: string }>,
  maxImages: number = 6,
): Promise<ImageGenResult> {
  const images: GeneratedImage[] = [];
  const costs: ImageGenCost[] = [];
  const genErrors: string[] = [];
  let totalCostUsd = 0;

  // Gather full script for category inference (more context = better category)
  const fullScript = slides.map(s => s.text).join(' ');
  const globalCategory = inferCategory(fullScript);

  // Select slides for image generation: hook + evenly spaced body slides
  const selectedIndices: number[] = [];
  // Always include hook (first slide)
  const hookIdx = slides.findIndex(s => s.type === 'hook');
  if (hookIdx >= 0) selectedIndices.push(hookIdx);
  // Fill remaining slots with evenly distributed slides (skip CTA)
  const contentSlides = slides
    .map((s, i) => ({ index: i, type: s.type }))
    .filter(s => s.type !== 'cta' && !selectedIndices.includes(s.index));
  const remaining = maxImages - selectedIndices.length;
  if (remaining > 0 && contentSlides.length > 0) {
    const step = Math.max(1, Math.floor(contentSlides.length / remaining));
    for (let i = 0; i < contentSlides.length && selectedIndices.length < maxImages; i += step) {
      if (!selectedIndices.includes(contentSlides[i].index)) {
        selectedIndices.push(contentSlides[i].index);
      }
    }
  }
  const slidesToGenerate = selectedIndices.map(i => ({ slide: slides[i], index: i }));

  const results = await Promise.allSettled(
    slidesToGenerate.map(async ({ slide, index }) => {
      const prompt = buildImagePrompt(slide.text, slide.type, globalCategory, index);
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
 * Hook slides use person-based templates (face grabs attention).
 * All other slides use content-scene templates (objects, scenes — no people).
 *
 * Flow:
 *   1. Resolve category from text (or use provided override)
 *   2. Choose person vs content template based on slide type
 *   3. Load appropriate defaults and fill template
 *   4. Append realism block and negative prompt
 *   5. Sanitize to strip any AI-smell words
 */
export function buildImagePrompt(
  text: string,
  slideType: string,
  categoryOverride?: string,
  slideIndex: number = 0,
): string {
  const cleanText = text.replace(/[「」\*#\n]/g, ' ').replace(/\s+/g, ' ').trim();
  const category = categoryOverride || inferCategory(cleanText);
  const topic = cleanText.substring(0, 100);

  // Hook slides: person-based (face draws clicks on social media)
  // All other slides: content/scene-based (match the actual topic)
  const usePerson = slideType === 'hook';

  if (usePerson) {
    return buildPersonPrompt(topic, slideType, category);
  }
  return buildContentPrompt(topic, slideType, category, slideIndex);
}

/** Person-based prompt (for hook slides) */
function buildPersonPrompt(topic: string, slideType: string, category: string): string {
  const defaults = CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.general;
  const variant = SLIDE_VARIANTS[slideType] || SLIDE_VARIANTS.body;

  const vars: PromptVars = {
    TOPIC: topic,
    SUBJECT: defaults.SUBJECT,
    SCENE: defaults.SCENE,
    EMOTION: defaults.EMOTION,
    LIGHTING: defaults.LIGHTING,
    PROPS: defaults.PROPS,
    CAMERA_FEEL: defaults.CAMERA_FEEL,
    PALETTE: defaults.PALETTE,
    COMPOSITION: variant.composition,
  };

  let prompt = MASTER_TEMPLATE;
  for (const [key, value] of Object.entries(vars)) {
    prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  const realismWithCamera = REALISM_BLOCK.replace('{CAMERA_FEEL}', vars.CAMERA_FEEL);

  const fullPrompt = [
    prompt.trim(),
    variant.intensityNote,
    realismWithCamera,
    NEGATIVE_PROMPT,
  ].join('\n\n');

  return sanitizePrompt(fullPrompt);
}

/** Content/scene-based prompt (for body/emphasis/chapter slides) */
function buildContentPrompt(topic: string, slideType: string, category: string, slideIndex: number = 0): string {
  const sceneDefaults = getContentScene(category, slideIndex);
  const variant = CONTENT_SLIDE_VARIANTS[slideType] || CONTENT_SLIDE_VARIANTS.body;

  let prompt = CONTENT_TEMPLATE;
  prompt = prompt.replace(/\{SCENE_DESCRIPTION\}/g, sceneDefaults.SCENE_DESCRIPTION);
  prompt = prompt.replace(/\{SCENE_DETAILS\}/g, sceneDefaults.SCENE_DETAILS);
  prompt = prompt.replace(/\{LIGHTING\}/g, sceneDefaults.LIGHTING);
  prompt = prompt.replace(/\{PALETTE\}/g, sceneDefaults.PALETTE);
  prompt = prompt.replace(/\{TOPIC\}/g, topic);
  prompt = prompt.replace(/\{COMPOSITION\}/g, variant.composition);

  const realismWithCamera = CONTENT_REALISM_BLOCK.replace('{CAMERA_FEEL}', sceneDefaults.CAMERA_FEEL);

  const fullPrompt = [
    prompt.trim(),
    variant.intensityNote,
    realismWithCamera,
    NEGATIVE_PROMPT,
  ].join('\n\n');

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
