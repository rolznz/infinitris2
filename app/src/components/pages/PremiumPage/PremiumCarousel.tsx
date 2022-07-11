import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import {
  Carousel,
  fullscreenMobileStepperStyles,
  fullscreenSwipeableViewsStyles,
} from '@/components/ui/Carousel';
import React from 'react';

import coinsImage from './assets/earn_coins.svg';
import coinsImageMobile from './assets/earn_coins_mobile.svg';
import comingSoonImage from './assets/coming_soon.svg';
import comingSoonImageMobile from './assets/coming_soon_mobile.svg';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { colors } from '@/theme/theme';
import FlexBox from '@/components/ui/FlexBox';

const titles = [
  <FormattedMessage
    defaultMessage="Earn Coins!"
    description="Account benefits text - earn coins"
  />,
  <FormattedMessage
    defaultMessage="Coming Soon!"
    description="Account benefits text - coming soon"
  />,
];
const subtitles = [
  <FormattedMessage
    defaultMessage="Purchase Unique Characters"
    description="Account benefits subtext - earn coins"
  />,
  <FormattedMessage
    defaultMessage="New Features Coming Soon. Stay tuned!"
    description="Account benefits subtext - coming soon"
  />,
];

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
      images.map((image, i) => (
        <FlexBox
          key={image}
          width="100vw"
          height="100vh"
          sx={{
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%), url(${image})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPositionY: '0%',
            backgroundPositionX: 'center',
          }}
          position="relative"
        >
          <FlexBox
            position="absolute"
            bottom={170}
            left={isLandscape ? 100 : 20}
            maxWidth="70%"
            alignItems="flex-start"
          >
            <Typography variant="h1" color={colors.premium}>
              {titles[i]}
            </Typography>
            <Typography variant="h6" color={colors.white}>
              {subtitles[i]}
            </Typography>
          </FlexBox>
        </FlexBox>
      )),
    [images, isLandscape]
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

/*
Original benefits
- Save your progress
 <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Earn coins"
        description="Account benefits text - earn coins"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Access premium characters"
        description="Account benefits text - premium characters"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Earn impact points"
        description="Account benefits text - earn impact points"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Appear on the scoreboard"
        description="Account benefits text - impact & scoreboard"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Publish challenges"
        description="Account benefits text - publish challenges"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Rate challenges"
        description="Account benefits text - rate challenges"
      />
    }
  />,

  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Secure your nickname (tick)"
        description="Account benefits text - nickname"
      />
    }
  />,
  */
