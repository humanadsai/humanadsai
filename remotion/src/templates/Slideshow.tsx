import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { loadFont } from '@remotion/google-fonts/NotoSansJP';
import type { SlideshowProps } from '../schemas';
import { SlideView } from './components/SlideView';
import { ProgressBar } from './components/ProgressBar';

const { fontFamily } = loadFont();

// BGM preset → audio file mapping
const BGM_FILES: Record<string, string> = {
  uptempo: staticFile('audio/uptempo.wav'),
  calm: staticFile('audio/calm.wav'),
  corporate: staticFile('audio/corporate.wav'),
};

// BGM volume: quiet enough to not overpower TTS narration
const BGM_VOLUME = 0.12;

export const Slideshow: React.FC<SlideshowProps> = ({
  slides,
  audioSrc,
  bgmPreset,
}) => {
  let currentFrame = 0;
  const bgmSrc = bgmPreset && bgmPreset !== 'none' ? BGM_FILES[bgmPreset] : undefined;

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
      {bgmSrc && <Audio src={bgmSrc} volume={BGM_VOLUME} />}
      <ProgressBar />
    </AbsoluteFill>
  );
};
