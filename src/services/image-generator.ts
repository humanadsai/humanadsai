/**
 * Image Generator Service — OpenAI gpt-image integration for slide images.
 *
 * Generates portrait images (1024x1536) for 9:16 video slides.
 * Returns base64 data URIs (JPEG) that Remotion can render.
 */

const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';
const IMAGE_MODEL = 'gpt-image-1';
// gpt-image-1 pricing: $0.011 per 1024x1024 low, $0.016 per 1024x1536 low
const COST_PER_IMAGE = 0.016;

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
  let totalCostUsd = 0;

  // Generate images in parallel (max 3 concurrent to avoid rate limits)
  const slidesToGenerate = slides
    .map((slide, i) => ({ slide, index: i }))
    .filter(({ slide }) => slide.type !== 'cta');

  const batchSize = 3;
  for (let batch = 0; batch < slidesToGenerate.length; batch += batchSize) {
    const chunk = slidesToGenerate.slice(batch, batch + batchSize);
    const results = await Promise.allSettled(
      chunk.map(async ({ slide, index }) => {
        const prompt = buildImagePrompt(slide.text, slide.type);
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
        console.error(`[ImageGen] Failed:`, result.reason);
      }
    }
  }

  return { images, costs, totalCostUsd };
}

/**
 * Build an image generation prompt from slide text.
 * Creates visually descriptive prompts suitable for background images.
 */
function buildImagePrompt(text: string, slideType: string): string {
  const cleanText = text.replace(/[「」\*#]/g, '').trim();

  let style = 'modern, cinematic, moody lighting, professional photography style';
  if (slideType === 'hook') {
    style = 'bold, dramatic, eye-catching, vivid colors, cinematic wide shot';
  } else if (slideType === 'emphasis') {
    style = 'high contrast, impactful, neon accents, dark moody atmosphere';
  } else if (slideType === 'chapter_title') {
    style = 'minimal, elegant, soft gradient light, abstract geometric';
  }

  return `Cinematic background image for a vertical video slide about: "${cleanText}". Style: ${style}. No text, no letters, no words, no watermarks. Dark enough that white text overlaid will be readable. Vertical portrait orientation.`;
}

/**
 * Call OpenAI Images API to generate a single image.
 * Returns a data URI (base64 JPEG) or temporary URL.
 */
async function generateSingleImage(apiKey: string, prompt: string): Promise<string> {
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
}
