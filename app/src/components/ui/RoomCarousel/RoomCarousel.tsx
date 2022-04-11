import { playSound, SoundKey } from '@/sound/SoundManager';
import { launchFullscreen } from '@/utils/launchFullscreen';
import {
  Carousel,
  fullScreenSwipeableViewsStyles,
} from '@/components/ui/Carousel';
import FlexBox from '@/components/ui/FlexBox';
import { Link as RouterLink } from 'react-router-dom';

import Link from '@mui/material/Link';
import SvgIcon from '@mui/material/SvgIcon';
import { borderColor, borderRadiuses, boxShadows } from '@/theme/theme';
import React from 'react';
import { PlayButton } from '@/components/pages/HomePage/PlayButton';
import { Page } from '@/components/ui/Page';
import {
  RoomCarouselSlide,
  RoomCarouselSlideProps,
} from '@/components/ui/RoomCarousel/RoomCarouselSlide';
import Typography from '@mui/material/Typography/Typography';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';

type RoomCarouselProps = {
  onPlay(): void;
  slides: RoomCarouselSlideProps[];
  secondaryIcon: React.ReactNode;
  secondaryIconLink?: string;
  initialStep: number;
  onChangeSlide(step: number): void;
  title: React.ReactNode;
};

export function RoomCarousel({
  title,
  slides,
  secondaryIcon,
  secondaryIconLink,
  initialStep,
  onPlay,
  onChangeSlide,
}: RoomCarouselProps) {
  const isLandscape = useIsLandscape();
  const carouselSlides = React.useMemo(
    () =>
      slides.map((slide) => <RoomCarouselSlide {...slide} key={slide.key} />),
    [slides]
  );

  const onSubmit = () => {
    playSound(SoundKey.click);
    launchFullscreen();
    onPlay();
  };

  return (
    <Page
      style={{
        justifyContent: 'center',
      }}
      background={
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
            slides={carouselSlides}
            styles={fullScreenSwipeableViewsStyles}
            mobileStepperStyles={{
              position: 'absolute',
              bottom: '5%',
              width: '100vw',
            }}
            scaleTransform={false}
            innerArrows
            initialStep={initialStep}
            onChange={onChangeSlide}
          />
        </div>
      }
    >
      <PlayButton
        onClick={onSubmit}
        isLoaded={true}
        delayButtonVisibility={false}
      />
      {secondaryIconLink && secondaryIcon && (
        <Link
          component={RouterLink}
          underline="none"
          to={secondaryIconLink}
          style={{ position: 'absolute', bottom: '5%', right: '2%' }}
        >
          <SecondaryIconButton>{secondaryIcon}</SecondaryIconButton>
        </Link>
      )}
      <FlexBox
        position="absolute"
        sx={{ backgroundColor: '#0C0D0D44' }}
        borderRadius={borderRadiuses.full}
        py={1}
        px={2}
        top={isLandscape ? '7%' : '80px'}
        left="3%"
      >
        <Typography variant="h6">{title}</Typography>
      </FlexBox>
    </Page>
  );
}

function SecondaryIconButton({ children }: React.PropsWithChildren<{}>) {
  return (
    <FlexBox
      style={{
        background: borderColor,
        boxShadow: boxShadows.small,
        borderRadius: borderRadiuses.full,
        padding: '10px',
        color: '#143950',
      }}
    >
      <SvgIcon fontSize="large">{children}</SvgIcon>
    </FlexBox>
  );
}
