import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import type { Slide } from '../../schemas';
import { getPreset } from '../../styles/presets';
import { SlideBackground } from '../components/SlideBackground';

interface Props {
  slide: Slide;
  startFrame: number;
  durationFrames: number;
}

export const CtaTeaseScene: React.FC<Props> = ({
  slide,
  startFrame,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const preset = getPreset('brand');

  const fadeInFrames = 12;
  const fadeOutFrames = 10;
  const opacity = interpolate(
    localFrame,
    [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Pulse effect on CTA text
  const pulseScale = interpolate(
    localFrame % 30,
    [0, 15, 30],
    [1, 1.04, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Label fade in
  const labelOpacity = interpolate(
    localFrame,
    [fadeInFrames, fadeInFrames + 10],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Main text appears after label
  const mainTextOpacity = interpolate(
    localFrame,
    [fadeInFrames + 8, fadeInFrames + 18],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

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
      <SlideBackground imageUrl={slide.imageUrl} backgroundCss={preset.background} startFrame={startFrame} durationFrames={durationFrames} />
      <div style={{ textAlign: 'center', maxWidth: '90%', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            color: '#FF6B35',
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 20,
            opacity: labelOpacity,
          }}
        >
          次回
        </div>
        <div
          style={{
            color: preset.textColor,
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 12px rgba(0,0,0,0.3)',
            whiteSpace: 'pre-line',
            transform: `scale(${pulseScale})`,
            opacity: mainTextOpacity,
          }}
        >
          {slide.text}
        </div>
        {slide.subtext && (
          <div
            style={{
              color: preset.textColor,
              fontSize: 28,
              fontWeight: 400,
              marginTop: 28,
              opacity: mainTextOpacity * 0.8,
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
