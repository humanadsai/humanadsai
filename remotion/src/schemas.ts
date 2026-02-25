import { z } from 'zod';

export const sceneTypeEnum = z.enum([
  'standard',
  'hook_punch',
  'reveal_list',
  'concept_explain',
  'danger_shift',
  'cta_tease',
]);

export const motionPresetEnum = z.enum([
  'none',
  'zoom_in',
  'pulse',
  'slide_left',
]);

export const slideSchema = z.object({
  type: z.enum(['hook', 'body', 'chapter_title', 'emphasis', 'cta', 'summary']),
  text: z.string(),
  subtext: z.string().optional(),
  durationSec: z.number().default(3),
  bgPreset: z.string().optional(),
  // Enhanced fields for variant system
  sceneType: sceneTypeEnum.default('standard'),
  listItems: z.array(z.string()).optional(),
  captionEmphasisWords: z.array(z.string()).optional(),
  motionPreset: motionPresetEnum.default('none'),
  visualNotes: z.string().optional(),
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

export type SceneType = z.infer<typeof sceneTypeEnum>;
export type MotionPreset = z.infer<typeof motionPresetEnum>;
export type Slide = z.infer<typeof slideSchema>;
export type SlideshowProps = z.infer<typeof slideshowSchema>;
