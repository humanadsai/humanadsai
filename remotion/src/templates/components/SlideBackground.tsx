import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';

interface SlideBackgroundProps {
  imageUrl?: string;
  backgroundCss: string;
  startFrame: number;
  durationFrames: number;
}

/**
 * Renders either an AI-generated background image or a CSS gradient.
 * Images are darkened with an overlay for text readability.
 * Includes a slow ken-burns zoom effect on images.
 */
export const SlideBackground: React.FC<SlideBackgroundProps> = ({
  imageUrl,
  backgroundCss,
  startFrame,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (!imageUrl) {
    return null; // Parent AbsoluteFill handles CSS background
  }

  // Slow ken-burns zoom on background image
  const scale = interpolate(
    localFrame,
    [0, durationFrames],
    [1.0, 1.08],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <>
      <Img
        src={imageUrl}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      {/* Dark overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </>
  );
};
