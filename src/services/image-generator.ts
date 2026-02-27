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
  // Dark/gloomy ban
  'dark moody atmosphere, horror aesthetic, desaturated skin, dim lighting, gloomy,',
  'dark room, dark background, shadows dominating, low-light, underexposed,',
  'depressing atmosphere, cold harsh lighting, gray overcast, dreary, somber.',
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
    SCENE: 'Daytime at home in a bright typical Japanese apartment. Sofa or floor cushion by a window. The room feels real, clean, and well-lit',
    EMOTION: 'Quiet disbelief — eyes slightly narrowed, one eyebrow raised, maybe touching their chin or lower lip. Like someone who just saw an unexpected number on their phone. NOT shocked, more "wait… seriously?"',
    LIGHTING: 'Bright daylight from a window plus warm ceiling light. Face is well-lit. Warm and cheerful atmosphere',
    PROPS: 'A cushion, a shelf with small items, a mug, a green plant',
    CAMERA_FEEL: 'Clean phone camera quality, natural daylight sharpness, bright and clear',
    PALETTE: 'Warm bright indoor tones, natural skin color, daylight warmth, clean background',
  },
  danger: {
    SUBJECT: 'A Japanese person in their 20s-30s in a T-shirt, normal appearance. Their posture is slightly tense — leaning forward or holding their phone closer than usual',
    SCENE: 'A bright Japanese apartment room. The expression conveys tension, not the environment. Clean, normal room with door or wall visible',
    EMOTION: 'Subtle worry or unease — slight frown, pressed lips, maybe a tiny furrow between the eyebrows. A "this is bad" face. NOT wide-eyed panic — more like a quiet sinking feeling',
    LIGHTING: 'Well-lit room with ceiling light and some daylight. The face is clearly visible. The tension comes from expression, not dark lighting',
    PROPS: 'A bag on a chair, a closed laptop, a glass of water, a bookshelf',
    CAMERA_FEEL: 'Clean phone camera quality, natural indoor lighting, clear and sharp',
    PALETTE: 'Natural room tones, warm skin tones preserved, clean background. Tension from expression, not color grading',
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
    { SCENE_DESCRIPTION: 'A bright modern workspace — laptop open with charts on screen, documents and a notebook on a clean white desk, coffee mug nearby', SCENE_DETAILS: 'Items are slightly messy — papers not perfectly aligned, pen cap off, sticky notes with Japanese text. Clean white desk surface with light wood accents.', LIGHTING: 'Bright natural daylight from a large window plus soft overhead light. The room is well-lit and airy', PALETTE: 'Clean whites, light wood tones, fresh green plant accents, bright natural daylight colors', CAMERA_FEEL: 'Clean bright phone camera quality, natural daylight sharpness' },
    { SCENE_DESCRIPTION: 'A modern glass-walled meeting room with a whiteboard showing diagrams, colorful sticky notes, and a bright city view through windows', SCENE_DETAILS: 'Whiteboard has real marker notes. Table is clean light wood. Bright and professional atmosphere.', LIGHTING: 'Abundant natural light from floor-to-ceiling windows, bright and even', PALETTE: 'White board, colorful sticky notes, light wood, bright sky through windows, clean modern tones', CAMERA_FEEL: 'Clean bright indoor phone quality, crisp natural light' },
    { SCENE_DESCRIPTION: 'A stylish café workspace — MacBook on a marble table, a latte, a small succulent plant, with soft natural light', SCENE_DETAILS: 'Marble table has elegant veining. Latte has foam art. Plant is fresh and green. Sophisticated casual workspace.', LIGHTING: 'Soft bright daylight from a nearby window, warm and inviting', PALETTE: 'White marble, warm latte browns, fresh greens, bright airy atmosphere', CAMERA_FEEL: 'Clean bright café photo quality, warm natural tones' },
  ],
  technology: [
    { SCENE_DESCRIPTION: 'A clean white desk with a smartphone showing a sleek app interface, wireless earbuds in their case, and a small plant', SCENE_DETAILS: 'Phone screen is bright and clear. Earbuds case is clean white. Desk is minimal and organized. Modern and clean.', LIGHTING: 'Bright daylight from a window, clean and even. The scene feels fresh and modern', PALETTE: 'Clean whites, bright screen colors, fresh green plant accent, modern minimal tones', CAMERA_FEEL: 'Clean bright phone camera, natural daylight quality' },
    { SCENE_DESCRIPTION: 'A modern laptop on a light wood desk showing colorful data visualizations, with a wireless mouse and a coffee cup', SCENE_DETAILS: 'Screen shows vibrant graphs and charts. Desk is tidy with clean lines. Modern tech aesthetic.', LIGHTING: 'Bright overhead light combined with daylight from window. Well-lit and clear', PALETTE: 'Light wood, bright screen colors, white coffee cup, clean modern palette', CAMERA_FEEL: 'Clean indoor daylight phone quality, sharp and bright' },
    { SCENE_DESCRIPTION: 'A tablet displaying a futuristic-looking app on a clean white surface, next to a stylish notebook and pen', SCENE_DETAILS: 'Tablet screen is vibrant. Notebook has a premium feel. Pen is elegant. Clean, aspirational tech setup.', LIGHTING: 'Bright even daylight, clean and shadow-free', PALETTE: 'Bright screen blues and whites, clean white surface, premium material tones', CAMERA_FEEL: 'Bright clean phone photo, modern product-style but natural' },
  ],
  health: [
    { SCENE_DESCRIPTION: 'Fresh colorful vegetables and fruits beautifully arranged on a bright wooden cutting board — vivid bell peppers, leafy greens, ripe tomatoes, a glass of water with lemon', SCENE_DETAILS: 'Vegetables are vibrant and fresh. Water droplets on produce catch the light. Board has natural warmth. Healthy and appetizing.', LIGHTING: 'Bright morning sunlight streaming through a window, warm and cheerful', PALETTE: 'Vivid fresh greens, bright reds and oranges, warm golden sunlight, clean whites', CAMERA_FEEL: 'Bright daylight food photo quality, warm and inviting' },
    { SCENE_DESCRIPTION: 'A yoga mat on a bright clean wooden floor with a trendy water bottle, fresh towel, and wireless earbuds. Sunlight filling the room', SCENE_DETAILS: 'Mat is colorful and clean. Towel is fresh white. Floor is bright natural wood. Energizing morning fitness space.', LIGHTING: 'Bright warm morning sunlight flooding through a large window. Cheerful and energizing', PALETTE: 'Bright yoga mat colors, warm honey wood floor, fresh white towel, golden sunlight', CAMERA_FEEL: 'Bright clean daylight phone quality, warm golden tones' },
    { SCENE_DESCRIPTION: 'A bright kitchen counter with a colorful smoothie bowl, fresh fruits, supplements in elegant containers, and morning light', SCENE_DETAILS: 'Smoothie bowl has vibrant toppings — berries, granola, fresh mint. Counter is clean white marble. Fresh and healthy.', LIGHTING: 'Bright cheerful kitchen light, natural daylight dominant', PALETTE: 'Vibrant berry colors, fresh greens, clean white marble, bright and appetizing', CAMERA_FEEL: 'Bright clean kitchen phone photo, vivid natural colors' },
  ],
  money: [
    { SCENE_DESCRIPTION: 'Japanese yen bills and coins neatly arranged on a bright clean table, with a modern calculator, a receipt, and a stylish wallet', SCENE_DETAILS: 'Bills are crisp. Coins catch the light. Wallet is leather with elegant stitching. Calculator shows positive numbers. Clean and prosperous feel.', LIGHTING: 'Bright daylight from a window, clean and well-lit. Warm and positive atmosphere', PALETTE: 'Warm golden light on currency, clean white table, elegant leather browns, bright cheerful tones', CAMERA_FEEL: 'Clean bright indoor phone quality, sharp and clear' },
    { SCENE_DESCRIPTION: 'A phone showing a stock market app with an upward graph in green, on a bright marble table next to a premium notebook', SCENE_DETAILS: 'Phone screen shows positive gains. Notebook has clean pages. Table is bright and elegant. Aspirational and optimistic.', LIGHTING: 'Bright natural daylight, clean and even. The scene feels optimistic and fresh', PALETTE: 'Green gains on screen, bright white marble, warm notebook tones, optimistic colors', CAMERA_FEEL: 'Clean bright phone photo, sharp screen detail' },
    { SCENE_DESCRIPTION: 'An elegant savings setup — a stylish ceramic jar with coins, a modern planner with colorful tabs, on a bright clean desk', SCENE_DETAILS: 'Ceramic jar is modern and aesthetic. Planner has motivational stickers. Desk is white and organized. Feels intentional and positive.', LIGHTING: 'Bright warm daylight, cheerful and welcoming', PALETTE: 'Clean whites, warm ceramic, colorful planner tabs, golden coin shimmer, bright atmosphere', CAMERA_FEEL: 'Clean bright phone photo, warm natural tones' },
  ],
  danger: [
    { SCENE_DESCRIPTION: 'A phone screen showing a warning notification with a red alert icon, on a clean desk in a bright room', SCENE_DETAILS: 'Phone screen clearly shows the warning. Desk is clean and modern. The alert stands out against the bright surroundings — contrast makes it impactful.', LIGHTING: 'Bright room lighting with daylight from window. The warning is dramatic by contrast', PALETTE: 'Bright clean room, vivid red alert on screen, clean whites, the danger pops against brightness', CAMERA_FEEL: 'Clean bright phone camera quality, sharp and clear' },
    { SCENE_DESCRIPTION: 'A modern security padlock and a key on a clean white surface, with a red warning tag attached', SCENE_DETAILS: 'Padlock is brushed steel, elegant. Key is clean. Red warning tag provides color accent. Clean and serious.', LIGHTING: 'Bright even light from above, clean studio-natural feel. Well-lit and clear', PALETTE: 'Brushed steel silver, vivid red tag, clean white surface, modern and sharp', CAMERA_FEEL: 'Clean bright indoor phone photo, sharp detail on metal' },
    { SCENE_DESCRIPTION: 'A laptop showing a security dashboard with alerts, on a bright modern desk with a coffee and notepad', SCENE_DETAILS: 'Screen shows clear security warnings. Desk is clean and organized. Coffee is fresh. Professional and alert.', LIGHTING: 'Bright daylight and overhead light. Clean, well-lit professional setting', PALETTE: 'Bright screen with red/orange alerts, clean white desk, warm coffee, professional tones', CAMERA_FEEL: 'Clean bright office phone photo quality' },
  ],
  lifestyle: [
    { SCENE_DESCRIPTION: 'A beautiful latte with foam art on a bright café table by a sunlit window, an open notebook with a pen, a small fresh plant', SCENE_DETAILS: 'Latte has elegant foam art. Notebook has clean pages. Plant is fresh green. Table catches warm sunlight. Bright and uplifting.', LIGHTING: 'Warm bright sunlight through a café window, golden and cheerful', PALETTE: 'Warm latte browns, fresh greens, golden sunlight, bright whites, warm elegant tones', CAMERA_FEEL: 'Beautiful bright café phone photo, warm golden quality' },
    { SCENE_DESCRIPTION: 'A bright bedroom with crisp white bedding, a book on the pillow, warm morning sunlight through sheer curtains, fresh flowers on nightstand', SCENE_DETAILS: 'Bedding is fresh and inviting. Book has a colorful cover. Flowers are fresh. Curtains glow with morning light. Elegant and peaceful.', LIGHTING: 'Beautiful warm morning light through sheer white curtains, soft and luminous', PALETTE: 'Clean whites, warm golden light, fresh flower colors, soft cream tones, bright and airy', CAMERA_FEEL: 'Bright soft morning phone photo, warm and dreamy' },
    { SCENE_DESCRIPTION: 'A stylish outdoor café terrace — a colorful acai bowl, iced coffee, sunglasses on a white table with a city or garden view', SCENE_DETAILS: 'Acai bowl has vibrant toppings. Iced coffee sparkles in sunlight. View is green and pleasant. Aspirational lifestyle scene.', LIGHTING: 'Bright outdoor sunlight, warm and vivid. Clear blue sky atmosphere', PALETTE: 'Vivid acai purples and greens, warm golden light, bright sky blue, fresh and vibrant', CAMERA_FEEL: 'Bright outdoor phone photo, vivid natural colors, clean daylight' },
  ],
  general: [
    { SCENE_DESCRIPTION: 'A bright Japanese apartment scene — items on a clean table by a window with natural light and a view of blue sky', SCENE_DETAILS: 'Clean, well-organized with a few personal touches. Bright and airy atmosphere. Fresh and inviting.', LIGHTING: 'Bright natural daylight from window, warm and cheerful', PALETTE: 'Clean whites, warm wood, blue sky, fresh natural colors', CAMERA_FEEL: 'Clean bright phone photo, natural daylight quality' },
    { SCENE_DESCRIPTION: 'A bright Japanese convenience store shelf with colorful products, snacks, and drinks arranged neatly under bright lights', SCENE_DETAILS: 'Products have vivid Japanese labels. Shelf is clean and well-stocked. Bright and colorful konbini aesthetic.', LIGHTING: 'Bright clean fluorescent store lighting, vivid and even', PALETTE: 'Vivid colorful packaging, clean white shelves, bright and cheerful store tones', CAMERA_FEEL: 'Clean bright indoor phone photo, vivid store lighting' },
    { SCENE_DESCRIPTION: 'A sunny Japanese street with cherry blossom or green trees, a colorful vending machine, blue sky with white clouds', SCENE_DETAILS: 'Trees are fresh and vibrant. Vending machine has colorful products. Street is clean. Beautiful sunny day scene.', LIGHTING: 'Bright afternoon sunlight with blue sky, warm and pleasant', PALETTE: 'Fresh greens or pink blossoms, blue sky, colorful vending machine, warm sunlight', CAMERA_FEEL: 'Clean bright outdoor phone photo, vivid daylight colors' },
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
  'STYLE: The image should feel BRIGHT, CLEAN, and SOPHISTICATED.',
  'Think: well-lit Japanese lifestyle magazine aesthetic — elegant, airy, aspirational.',
  'The overall mood is POSITIVE and UPLIFTING. Avoid anything dark, gloomy, or depressing.',
  '',
  'The photo shows: {SCENE_DESCRIPTION}.',
  '{SCENE_DETAILS}',
  '',
  'This scene relates to the topic: "{TOPIC}".',
  '',
  'Lighting: {LIGHTING}.',
  'Light is bright and natural. The scene is WELL-LIT — avoid dim, dark, or moody lighting.',
  '',
  'Color palette: {PALETTE}.',
  'Colors are bright, clean, and natural. No cinematic LUT, no dark filters, no desaturation.',
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
  'TEXTURES: All surfaces have visible real-world texture — wood grain, fabric weave, paper fiber, metal surfaces. Natural material quality.',
  'OBJECTS: Items look real and authentic — natural wear and character. Not CGI-perfect showroom items.',
  'DEPTH: Background is slightly softer but objects are identifiable. Natural phone camera depth of field.',
  'CAMERA QUALITY: {CAMERA_FEEL}. The image has natural phone camera quality — clean, bright, detailed.',
  'BRIGHTNESS: The overall image should be BRIGHT and WELL-LIT. Avoid dark shadows, dim lighting, or gloomy atmosphere.',
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
  'dark moody atmosphere', 'moody lighting', 'dim lighting', 'gloomy', 'somber',
  'dark room', 'low-light', 'underexposed', 'dreary',
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
