/**
 * Image Generator Service — Stability AI integration for slide images.
 *
 * Generates portrait images (1024x1792) for 9:16 video slides.
 * Returns base64 data URIs that Remotion can render inline.
 */

const STABILITY_API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/core';
const STABILITY_MODEL = 'stable-image-core';
const COST_PER_IMAGE = 0.04; // ~$0.03-0.04 per image

export interface GeneratedImage {
  slideIndex: number;
  imageDataUri: string;
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
 * @param apiKey - Stability AI API key
 * @param slides - Array of slides with text and type
 */
export async function generateSlideImages(
  apiKey: string,
  slides: Array<{ type: string; text: string; subtext?: string }>,
): Promise<ImageGenResult> {
  const images: GeneratedImage[] = [];
  const costs: ImageGenCost[] = [];
  let totalCostUsd = 0;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];

    // Skip CTA slides — they use brand template
    if (slide.type === 'cta') continue;

    // Build a prompt from slide text
    const prompt = buildImagePrompt(slide.text, slide.type);

    try {
      const imageDataUri = await generateSingleImage(apiKey, prompt);
      images.push({ slideIndex: i, imageDataUri });
      costs.push({ slideIndex: i, amountUsd: COST_PER_IMAGE, model: STABILITY_MODEL });
      totalCostUsd += COST_PER_IMAGE;
    } catch (err) {
      console.error(`[ImageGen] Failed to generate image for slide ${i}:`, err);
      // Continue with other slides — don't fail the whole batch
    }
  }

  return { images, costs, totalCostUsd };
}

/**
 * Build an image generation prompt from slide text.
 * Creates visually descriptive prompts suitable for background images.
 */
function buildImagePrompt(text: string, slideType: string): string {
  // Clean text of formatting markers
  const cleanText = text.replace(/[「」\*#]/g, '').trim();

  let style = 'modern, clean, professional, digital illustration, gradient background';
  if (slideType === 'hook') {
    style = 'bold, eye-catching, dramatic lighting, vibrant colors, digital art';
  } else if (slideType === 'emphasis') {
    style = 'impactful, high contrast, bold colors, abstract shapes, modern design';
  } else if (slideType === 'chapter_title') {
    style = 'minimal, elegant, clean typography background, subtle gradient';
  }

  // Create an abstract visual description — avoid rendering text in the image
  return `Abstract background illustration representing the concept: "${cleanText}". Style: ${style}. No text, no letters, no words in the image. Vertical 9:16 aspect ratio, suitable as a video slide background.`;
}

/**
 * Call Stability AI API to generate a single image.
 * Returns base64 data URI.
 */
async function generateSingleImage(apiKey: string, prompt: string): Promise<string> {
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('output_format', 'webp');
  formData.append('aspect_ratio', '9:16');

  const res = await fetch(STABILITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Stability AI error (${res.status}): ${errBody}`);
  }

  const data = await res.json() as any;
  const base64 = data.image;

  if (!base64) {
    throw new Error('No image data in Stability AI response');
  }

  return `data:image/webp;base64,${base64}`;
}
