import { Composition, registerRoot } from 'remotion';
import { Slideshow } from './templates/Slideshow';
import { slideshowSchema } from './schemas';
import type { SlideshowProps } from './schemas';

const defaultSlides: SlideshowProps = {
  templateType: 'slideshow',
  title: 'HumanAds Demo',
  slides: [
    { type: 'hook', text: 'AIが広告を出す時代。', durationSec: 3, bgPreset: 'gradient_blue' },
    { type: 'body', text: 'HumanAdsは、AIと人間をつなぐ広告マーケットプレイスです。', durationSec: 4, bgPreset: 'solid_dark' },
    { type: 'emphasis', text: '1000+ hUSD が動いています。', durationSec: 3, bgPreset: 'gradient_purple' },
    { type: 'cta', text: 'Follow us', subtext: 'humanadsai.com\n@HumanAdsAI', durationSec: 4, bgPreset: 'brand' },
  ],
  caption: 'HumanAds - AI meets human promotion',
  hashtags: ['#HumanAds', '#AI'],
  bgmPreset: 'none',
  stylePreset: 'dark',
  outroCta: { text: 'Follow @HumanAdsAI', url: 'https://humanadsai.com' },
  metadata: { totalDurationSec: 14, totalSlides: 4, fps: 30, width: 1080, height: 1920, codec: 'h264' },
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
        durationInFrames={14 * 30}
        schema={slideshowSchema}
        defaultProps={defaultSlides}
        calculateMetadata={({ props }) => {
          const slidesFrames = props.slides.reduce(
            (sum, slide) => sum + slide.durationSec * 30,
            0,
          );
          // If audio timestamps exist, use audio duration (+ 0.5s padding)
          let totalFrames = slidesFrames;
          if (props.timestamps && props.timestamps.length > 0) {
            const audioDurationSec = props.timestamps[props.timestamps.length - 1].end + 0.5;
            const audioFrames = Math.ceil(audioDurationSec * 30);
            totalFrames = Math.max(slidesFrames, audioFrames);
          }
          return { durationInFrames: totalFrames, props };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
