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

export const RevealListScene: React.FC<Props> = ({
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

  const items = slide.listItems && slide.listItems.length > 0
    ? slide.listItems
    : slide.text.split('\n').filter(Boolean);

  const staggerDelay = 15; // 0.5s at 30fps per item

  return (
    <AbsoluteFill
      style={{
        background: slide.imageUrl ? '#0a0a0a' : preset.background,
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        padding: '80px 48px',
        overflow: 'hidden',
      }}
    >
      <SlideBackground imageUrl={slide.imageUrl} backgroundCss={preset.background} startFrame={startFrame} durationFrames={durationFrames} />
      {slide.subtext && (
        <div
          style={{
            color: preset.textColor,
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 40,
            textAlign: 'center',
            textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.5)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {slide.subtext}
        </div>
      )}
      <div style={{ width: '85%', position: 'relative', zIndex: 1 }}>
        {items.map((item, i) => {
          const itemStart = fadeInFrames + i * staggerDelay;
          const itemOpacity = interpolate(
            localFrame,
            [itemStart, itemStart + 10],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );
          const itemTranslateX = interpolate(
            localFrame,
            [itemStart, itemStart + 10],
            [60, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                transform: `translateX(${itemTranslateX}px)`,
                display: 'flex',
                alignItems: 'center',
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#FF6B35',
                  marginRight: 20,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  color: preset.textColor,
                  fontSize: 36,
                  fontWeight: 600,
                  lineHeight: 1.5,
                  textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.5)',
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
