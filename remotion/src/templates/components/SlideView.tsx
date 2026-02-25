import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import type { Slide } from '../../schemas';
import { getPreset } from '../../styles/presets';

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

  // Slide up animation
  const translateY = interpolate(
    localFrame,
    [0, fadeInFrames],
    [30, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const isHook = slide.type === 'hook';
  const isCta = slide.type === 'cta';
  const isChapterTitle = slide.type === 'chapter_title';
  const isEmphasis = slide.type === 'emphasis';

  const fontSize = isHook || isEmphasis ? 56 : (isChapterTitle ? 48 : 40);
  const fontWeight = isHook || isEmphasis || isChapterTitle ? 800 : 600;

  return (
    <AbsoluteFill
      style={{
        background: preset.background,
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        padding: '60px 48px',
      }}
    >
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          textAlign: 'center',
          maxWidth: '90%',
        }}
      >
        <div
          style={{
            color: preset.textColor,
            fontSize,
            fontWeight,
            lineHeight: 1.4,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}
        >
          {slide.text}
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
