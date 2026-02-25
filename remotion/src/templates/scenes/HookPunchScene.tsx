import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import type { Slide } from '../../schemas';
import { getPreset } from '../../styles/presets';
import { EmphasisText } from '../components/EmphasisText';

interface Props {
  slide: Slide;
  startFrame: number;
  durationFrames: number;
}

export const HookPunchScene: React.FC<Props> = ({
  slide,
  startFrame,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const preset = getPreset(slide.bgPreset);

  const fadeInFrames = 10;
  const fadeOutFrames = 10;
  const opacity = interpolate(
    localFrame,
    [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // zoom_in motion: scale from 1 to 1.05
  const scale = interpolate(
    localFrame,
    [0, durationFrames],
    [1, 1.05],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

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
          transform: `scale(${scale})`,
          textAlign: 'center',
          maxWidth: '90%',
        }}
      >
        <div
          style={{
            color: preset.textColor,
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.3,
            letterSpacing: '-0.03em',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
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
