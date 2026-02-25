import { z } from 'zod';

export const slideSchema = z.object({
  type: z.enum(['hook', 'body', 'chapter_title', 'emphasis', 'cta', 'summary']),
  text: z.string(),
  subtext: z.string().optional(),
  durationSec: z.number().default(3),
  bgPreset: z.string().optional(),
});

export const slideshowSchema = z.object({
  templateType: z.string(),
  title: z.string(),
  slides: z.array(slideSchema).min(1),
  caption: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  bgmPreset: z.string().default('none'),
  stylePreset: z.string().default('dark'),
  outroCta: z.object({
    text: z.string(),
    url: z.string(),
  }).optional(),
  metadata: z.object({
    totalDurationSec: z.number(),
    totalSlides: z.number(),
    fps: z.number().default(30),
    width: z.number().default(1080),
    height: z.number().default(1920),
    codec: z.string().default('h264'),
  }),
});

export type Slide = z.infer<typeof slideSchema>;
export type SlideshowProps = z.infer<typeof slideshowSchema>;
