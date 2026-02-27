import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import type { Slide } from '../../schemas';
import { getPreset } from '../../styles/presets';
import { EmphasisText } from './EmphasisText';
import { SlideBackground } from './SlideBackground';
import { HookPunchScene } from '../scenes/HookPunchScene';
import { RevealListScene } from '../scenes/RevealListScene';
import { ConceptExplainScene } from '../scenes/ConceptExplainScene';
import { DangerShiftScene } from '../scenes/DangerShiftScene';
import { CtaTeaseScene } from '../scenes/CtaTeaseScene';

interface SlideViewProps {
  slide: Slide;
  startFrame: number;
  durationFrames: number;
}

export const SlideView: React.FC<SlideViewProps> = ({
  slide,
  startFrame,
  durationFrames,
}) => {
  const sceneType = slide.sceneType || 'standard';

  // Dispatch to specialized scene components
  switch (sceneType) {
    case 'hook_punch':
      return <HookPunchScene slide={slide} startFrame={startFrame} durationFrames={durationFrames} />;
    case 'reveal_list':
      return <RevealListScene slide={slide} startFrame={startFrame} durationFrames={durationFrames} />;
    case 'concept_explain':
      return <ConceptExplainScene slide={slide} startFrame={startFrame} durationFrames={durationFrames} />;
    case 'danger_shift':
      return <DangerShiftScene slide={slide} startFrame={startFrame} durationFrames={durationFrames} />;
    case 'cta_tease':
      return <CtaTeaseScene slide={slide} startFrame={startFrame} durationFrames={durationFrames} />;
    default:
      return <StandardSlide slide={slide} startFrame={startFrame} durationFrames={durationFrames} />;
  }
};

/**
 * Standard slide — original layout with added motion presets and emphasis text support.
 */
const StandardSlide: React.FC<SlideViewProps> = ({
  slide,
  startFrame,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const preset = getPreset(slide.bgPreset);

  // Fade in / fade out
  const fadeInFrames = 15; // 0.5s at 30fps
  const fadeOutFrames = 10;
  const opacity = interpolate(
    localFrame,
    [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Motion presets
  const motionPreset = slide.motionPreset || 'none';
  let transform = '';

  if (motionPreset === 'zoom_in') {
    const scale = interpolate(
      localFrame,
      [0, durationFrames],
      [1, 1.05],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
    transform = `scale(${scale})`;
  } else if (motionPreset === 'pulse') {
    const pulseScale = interpolate(
      localFrame % 30,
      [0, 15, 30],
      [1, 1.03, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
    transform = `scale(${pulseScale})`;
  } else if (motionPreset === 'slide_left') {
    const translateX = interpolate(
      localFrame,
      [0, fadeInFrames],
      [30, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
    transform = `translateX(${translateX}px)`;
  } else {
    // Default: slide up animation
    const translateY = interpolate(
      localFrame,
      [0, fadeInFrames],
      [30, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
    transform = `translateY(${translateY}px)`;
  }

  const isHook = slide.type === 'hook';
  const isCta = slide.type === 'cta';
  const isChapterTitle = slide.type === 'chapter_title';
  const isEmphasis = slide.type === 'emphasis';

  const fontSize = isHook || isEmphasis ? 56 : (isChapterTitle ? 48 : 40);
  const fontWeight = isHook || isEmphasis || isChapterTitle ? 800 : 600;

  const hasEmphasis = slide.captionEmphasisWords && slide.captionEmphasisWords.length > 0;

  return (
    <AbsoluteFill
      style={{
        background: slide.imageUrl ? '#0a0a0a' : preset.background,
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        padding: '60px 48px',
        overflow: 'hidden',
      }}
    >
      <SlideBackground
        imageUrl={slide.imageUrl}
        backgroundCss={preset.background}
        startFrame={startFrame}
        durationFrames={durationFrames}
      />
      <div
        style={{
          transform,
          textAlign: 'center',
          maxWidth: '90%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            color: preset.textColor,
            fontSize,
            fontWeight,
            lineHeight: 1.4,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.5)',
            whiteSpace: 'pre-line',
          }}
        >
          {hasEmphasis ? (
            <EmphasisText
              text={slide.text}
              emphasisWords={slide.captionEmphasisWords}
              accentColor="#FF6B35"
            />
          ) : (
            slide.text
          )}
        </div>
        {slide.subtext && (
          <div
            style={{
              color: preset.textColor,
              fontSize: isCta ? 28 : 24,
              fontWeight: 400,
              marginTop: 24,
              opacity: 0.8,
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
            }}
          >
            {slide.subtext}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
