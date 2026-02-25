import { Composition } from 'remotion';
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
          const totalFrames = props.slides.reduce(
            (sum, slide) => sum + slide.durationSec * 30,
            0,
          );
          return { durationInFrames: totalFrames, props };
        }}
      />
    </>
  );
};
