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

export const ConceptExplainScene: React.FC<Props> = ({
  slide,
  startFrame,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const preset = getPreset(slide.bgPreset);

  const fadeInFrames = 15;
  const fadeOutFrames = 10;
  const opacity = interpolate(
    localFrame,
    [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const translateY = interpolate(
    localFrame,
    [0, fadeInFrames],
    [20, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Subtext appears slightly after main text
  const subtextOpacity = interpolate(
    localFrame,
    [fadeInFrames + 5, fadeInFrames + 15],
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
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          textAlign: 'center',
          maxWidth: '90%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            color: preset.textColor,
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.4,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.5)',
            whiteSpace: 'pre-line',
          }}
        >
          <EmphasisText
            text={slide.text}
            emphasisWords={slide.captionEmphasisWords}
            accentColor="#FF6B35"
          />
        </div>
        {slide.subtext && (
          <div
            style={{
              color: preset.textColor,
              fontSize: 28,
              fontWeight: 400,
              marginTop: 32,
              opacity: subtextOpacity * 0.75,
              lineHeight: 1.7,
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
