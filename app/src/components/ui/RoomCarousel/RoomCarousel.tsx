import { playSound, SoundKey } from '@/sound/SoundManager';
import { launchFullscreen } from '@/utils/launchFullscreen';
import {
  Carousel,
  fullscreenMobileStepperStyles,
  fullscreenSwipeableViewsStyles,
} from '@/components/ui/Carousel';
import FlexBox from '@/components/ui/FlexBox';
import { Link as RouterLink } from 'react-router-dom';
//app/src/components/ui/Locks/padlock_locked.svg
import padlockLockedImage from './assets/padlock_locked.png';

import Link from '@mui/material/Link';
import SvgIcon from '@mui/material/SvgIcon';
import {
  borderColor,
  borderRadiuses,
  boxShadows,
  lockFilter,
} from '@/theme/theme';
import React from 'react';
import { PlayButton } from '@/components/pages/HomePage/PlayButton';
import { Page } from '@/components/ui/Page';
import {
  RoomCarouselSlide,
  RoomCarouselSlideProps,
} from '@/components/ui/RoomCarousel/RoomCarouselSlide';
import { FullPageCarouselTitle } from '@/components/ui/FullPageCarouselTitle';

type RoomCarouselProps = {
  onPlay(slideIndex: number): void;
  slides: RoomCarouselSlideProps[];
  secondaryIcon?: React.ReactNode;
  secondaryIconLink?: string;
  initialStep: number;
  onChangeSlide?(step: number): void;
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
  const [selectedSlide, setSelectedSlide] = React.useState(initialStep);
  const slideElements = React.useMemo(
    () =>
      slides.map((slide) => <RoomCarouselSlide {...slide} key={slide.key} />),
    [slides]
  );

  const handleChangeSlide = React.useCallback(
    (slideIndex) => {
      setSelectedSlide(slideIndex);
      onChangeSlide?.(slideIndex);
    },
    [onChangeSlide, setSelectedSlide]
  );

  const onSubmit = () => {
    playSound(SoundKey.click);
    launchFullscreen();
    onPlay(selectedSlide);
  };

  const isLocked = slides[selectedSlide]?.isLocked;

  return (
    <Page
      style={{
        justifyContent: 'center',
        filter: isLocked ? lockFilter : undefined,
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
            slides={slideElements}
            styles={fullscreenSwipeableViewsStyles}
            mobileStepperStyles={fullscreenMobileStepperStyles}
            scaleTransform={false}
            innerArrows
            initialStep={initialStep}
            onChange={handleChangeSlide}
          />
        </div>
      }
    >
      {!isLocked ? (
        slides.length ? (
          <PlayButton
            onClick={onSubmit}
            //isLoaded={true}
            delayButtonVisibility={false}
          />
        ) : null
      ) : (
        <img
          alt="locked"
          src={padlockLockedImage}
          width={'100px'}
          style={{ zIndex: 1 }}
        />
      )}
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
      <FullPageCarouselTitle>{title}</FullPageCarouselTitle>
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
