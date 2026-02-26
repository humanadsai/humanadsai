import { Composition, registerRoot } from 'remotion';
import { Slideshow } from './templates/Slideshow';
import { slideshowSchema } from './schemas';
import type { SlideshowProps } from './schemas';

const defaultSlides: SlideshowProps = {
  templateType: 'slideshow',
  title: 'HumanAds Demo',
  slides: [
    { type: 'hook', text: '年収の9割は嘘', durationSec: 3, bgPreset: 'gradient_blue', sceneType: 'hook_punch', motionPreset: 'zoom_in' },
    { type: 'body', text: 'AIが暴いた\n衝撃の真実', durationSec: 4, bgPreset: 'solid_dark', sceneType: 'standard', motionPreset: 'none' },
    { type: 'emphasis', text: '知らないと損する', durationSec: 3, bgPreset: 'gradient_purple', sceneType: 'standard', motionPreset: 'pulse' },
  ],
  caption: 'HumanAds - AI meets human promotion',
  hashtags: ['#HumanAds', '#AI'],
  bgmPreset: 'uptempo',
  stylePreset: 'dark',
  subtitleStyle: 'none' as const,
  metadata: { totalDurationSec: 10, totalSlides: 3, fps: 30, width: 1080, height: 1920, codec: 'h264' },
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Slideshow"
        component={Slideshow}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={10 * 30}
        schema={slideshowSchema}
        defaultProps={defaultSlides}
        calculateMetadata={({ props }) => {
          const totalFrames = props.slides.reduce(
            (sum, slide) => sum + (slide.durationSec ?? 3) * 30,
            0,
          );
          return { durationInFrames: totalFrames, props };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
