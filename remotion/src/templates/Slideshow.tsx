import React from 'react';
import { AbsoluteFill, Audio, Sequence } from 'remotion';
import { loadFont } from '@remotion/google-fonts/NotoSansJP';
import type { SlideshowProps } from '../schemas';
import { SlideView } from './components/SlideView';
import { ProgressBar } from './components/ProgressBar';
import { SubtitleLayer } from './components/SubtitleLayer';

const { fontFamily } = loadFont();

export const Slideshow: React.FC<SlideshowProps> = ({
  slides,
  audioSrc,
  timestamps,
  subtitleStyle = 'karaoke',
}) => {
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: '#0a0a0a' }}>
      {slides.map((slide, i) => {
        const durationFrames = slide.durationSec * 30;
        const startFrame = currentFrame;
        currentFrame += durationFrames;

        return (
          <Sequence key={i} from={startFrame} durationInFrames={durationFrames}>
            <SlideView
              slide={slide}
              startFrame={0}
              durationFrames={durationFrames}
            />
          </Sequence>
        );
      })}
      {audioSrc && <Audio src={audioSrc} />}
      {timestamps && timestamps.length > 0 && (
        <SubtitleLayer timestamps={timestamps} style={subtitleStyle} />
      )}
      <ProgressBar />
    </AbsoluteFill>
  );
};
