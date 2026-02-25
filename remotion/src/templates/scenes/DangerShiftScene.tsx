import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import type { Slide } from '../../schemas';
import { getPreset } from '../../styles/presets';
import { EmphasisText } from '../components/EmphasisText';
import { SlideBackground } from '../components/SlideBackground';

interface Props {
  slide: Slide;
  startFrame: number;
  durationFrames: number;
}

export const DangerShiftScene: React.FC<Props> = ({
  slide,
  startFrame,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const dangerPreset = getPreset('danger_red');
  const normalPreset = getPreset(slide.bgPreset);

  const fadeInFrames = 12;
  const fadeOutFrames = 10;
  const opacity = interpolate(
    localFrame,
    [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Transition to danger: bg shifts to red over first 1s
  const dangerProgress = interpolate(
    localFrame,
    [fadeInFrames, fadeInFrames + 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Subtle shake effect at transition point
  const shakeX = localFrame > fadeInFrames && localFrame < fadeInFrames + 20
    ? Math.sin(localFrame * 2.5) * interpolate(
        localFrame,
        [fadeInFrames, fadeInFrames + 10, fadeInFrames + 20],
        [0, 4, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      )
    : 0;

  // Interpolate text color from normal to danger red
  const textColor = dangerProgress > 0.5 ? dangerPreset.textColor : normalPreset.textColor;

  return (
    <AbsoluteFill
      style={{
        background: slide.imageUrl ? '#0a0a0a' : (dangerProgress > 0.5 ? dangerPreset.background : normalPreset.background),
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        padding: '60px 48px',
        transition: 'background 0.3s ease',
        overflow: 'hidden',
      }}
    >
      <SlideBackground imageUrl={slide.imageUrl} backgroundCss={normalPreset.background} startFrame={startFrame} durationFrames={durationFrames} />
      <div
        style={{
          transform: `translateX(${shakeX}px)`,
          textAlign: 'center',
          maxWidth: '90%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            color: textColor,
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            textShadow: dangerProgress > 0.5
              ? '0 0 20px rgba(255,68,68,0.4)'
              : '0 2px 12px rgba(0,0,0,0.3)',
          }}
        >
          <EmphasisText
            text={slide.text}
            emphasisWords={slide.captionEmphasisWords}
            accentColor="#ff4444"
          />
        </div>
        {slide.subtext && (
          <div
            style={{
              color: textColor,
              fontSize: 26,
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
