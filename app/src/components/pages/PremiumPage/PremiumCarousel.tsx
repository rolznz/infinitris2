import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import {
  Carousel,
  fullscreenMobileStepperStyles,
  fullscreenSwipeableViewsStyles,
} from '@/components/ui/Carousel';
import FlexBox from '@/components/ui/FlexBox';
import React from 'react';

import coinsImage from './assets/earn_coins.svg';
import coinsImageMobile from './assets/earn_coins_mobile.svg';
import comingSoonImage from './assets/coming_soon.svg';
import comingSoonImageMobile from './assets/coming_soon_mobile.svg';

export function PremiumCarousel() {
  const isLandscape = useIsLandscape();
  const images: string[] = React.useMemo(
    () =>
      isLandscape
        ? [coinsImage, comingSoonImage]
        : [coinsImageMobile, comingSoonImageMobile],
    [isLandscape]
  );

  const slideElements: React.ReactNode[] = React.useMemo(
    () =>
      images.map((image) => (
        <FlexBox
          key={image}
          width="100vw"
          height="100vh"
          sx={{
            background: `url(${image})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPositionY: '100%',
            backgroundPositionX: '22%',
          }}
          position="relative"
        />
      )),
    [images]
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      <Carousel
        slides={slideElements}
        styles={fullscreenSwipeableViewsStyles}
        mobileStepperStyles={fullscreenMobileStepperStyles}
        scaleTransform={false}
        innerArrows
        //initialStep={initialStep}
        //onChange={handleChangeSlide}
      />
    </div>
  );
}
