import React, { useRef, useState } from 'react';
import { useMediaQuery } from '@mui/material';

import backgroundImage from './assets/background.png';
import backgroundPortraitImage from './assets/background_portrait.png';
import backgroundImageDark from './assets/background_dark.png';
import backgroundPortraitImageDark from './assets/background_portrait_dark.png';

import foregroundTopImage from './assets/foreground_top_light.png';
import foregroundTopImageDark from './assets/foreground_top.png';
import foregroundBottomImage from './assets/foreground_bottom_light.png';
import foregroundBottomImageDark from './assets/foreground_bottom.png';
import foregroundLeftImage from './assets/foreground_left_light.png';
import foregroundLeftImageDark from './assets/foreground_left.png';
import foregroundRightImage from './assets/foreground_right_light.png';
import foregroundRightImageDark from './assets/foreground_right.png';
import foregroundTopPortraitImage from './assets/foreground_portrait_top_light.png';
import foregroundTopPortraitImageDark from './assets/foreground_portrait_top.png';
import foregroundBottomPortraitImage from './assets/foreground_portrait_bottom_light.png';
import foregroundBottomPortraitImageDark from './assets/foreground_portrait_bottom.png';
import foregroundLeftPortraitImage from './assets/foreground_portrait_left_light.png';
import foregroundLeftPortraitImageDark from './assets/foreground_portrait_left.png';
import foregroundRightPortraitImage from './assets/foreground_portrait_right_light.png';
import foregroundRightPortraitImageDark from './assets/foreground_portrait_right.png';

import useWindowSize from 'react-use/lib/useWindowSize';
import useOrientation from 'react-use/lib/useOrientation';
import FlexBox from '@/components/ui/FlexBox';
import {
  HomePage,
  firstTimeAnimationDelaySeconds as homePageFirstTimeAnimationDelaySeconds,
} from './HomePage';
import useLoaderStore from '@/state/LoaderStore';
import Loadable from '@/components/ui/Loadable';
import useDarkMode from '@/components/hooks/useDarkMode';
import { zIndexes } from '@/theme/theme';

export const homePageBackgroundTransitionSeconds = 5;

const _HomePageBackground = () => {
  const isDarkMode = useDarkMode();
  const windowSize = useWindowSize();
  useOrientation(); // force re-render on orientation change
  const isLandscape = windowSize.width >= windowSize.height;
  const isShortScreen = useMediaQuery(
    `(max-height:${isLandscape ? 400 : 600}px)`
  );
  const isLoaded = useLoaderStore((loaderStore) => loaderStore.hasFinished);

  return (
    <FlexBox
      flex={1}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <HomePageBackgroundImage
        src={
          isLandscape
            ? isDarkMode
              ? backgroundImageDark
              : backgroundImage
            : isDarkMode
            ? backgroundPortraitImageDark
            : backgroundPortraitImage
        }
        width="100%"
        height="100%"
        objectFit="cover"
        bottom="0"
        left="0"
      />
      <HomePage />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: '#000000',
          opacity: isLoaded ? 0.5 : 0,
          width: '100%',
          height: '100%',
          transition: `opacity ${homePageBackgroundTransitionSeconds}s ${homePageFirstTimeAnimationDelaySeconds}s`,
        }}
        role="presentation"
      />
      <HomePageBackgroundImage
        src={
          isLandscape
            ? isDarkMode
              ? foregroundLeftImageDark
              : foregroundLeftImage
            : isDarkMode
            ? foregroundLeftPortraitImageDark
            : foregroundLeftPortraitImage
        }
        width="auto"
        height="100%"
        bottom="0"
        left="0"
      />
      <HomePageBackgroundImage
        src={
          isLandscape
            ? isDarkMode
              ? foregroundRightImageDark
              : foregroundRightImage
            : isDarkMode
            ? foregroundRightPortraitImageDark
            : foregroundRightPortraitImage
        }
        width="auto"
        height="100%"
        bottom="0"
        right="0"
      />
      <HomePageBackgroundImage
        src={
          isLandscape
            ? isDarkMode
              ? foregroundTopImageDark
              : foregroundTopImage
            : isDarkMode
            ? foregroundTopPortraitImageDark
            : foregroundTopPortraitImage
        }
        width="100vw"
        height="auto"
        top={isShortScreen || !isLandscape ? '-50px' : '0'}
        left="0"
      />
      <HomePageBackgroundImage
        src={
          isLandscape
            ? isDarkMode
              ? foregroundBottomImageDark
              : foregroundBottomImage
            : isDarkMode
            ? foregroundBottomPortraitImageDark
            : foregroundBottomPortraitImage
        }
        width="100vw"
        height="auto"
        bottom={isShortScreen || !isLandscape ? '-50px' : '0'}
        left="0"
      />
    </FlexBox>
  );
};

export const HomePageBackground = React.memo(_HomePageBackground);

type HomePageBackgroundImageProps = {
  src: string;
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  width: string;
  height: string;
  objectFit?: string;
};

let backgroundImageMap: { [key: string]: HTMLImageElement } = {};
let backgroundImageLoadedMap: { [key: string]: boolean } = {};
const HomePageBackgroundImage = React.memo(
  (props: HomePageBackgroundImageProps) => {
    return (
      <img
        ref={(imageRef) => {
          let image = backgroundImageMap[props.src];
          if (!image) {
            useLoaderStore.getState().increaseSteps();
            image = new Image();

            image.style.position = 'absolute';
            image.style.left = props.left?.toString() || '';
            image.style.right = props.right?.toString() || '';
            image.style.top = props.top?.toString() || '';
            image.style.bottom = props.bottom?.toString() || '';
            image.style.width = props.width?.toString() || '';
            image.style.height = props.height?.toString() || '';
            image.style.objectFit = props.objectFit?.toString() || '';

            image.addEventListener('load', function () {
              imageRef?.replaceWith(image);
              useLoaderStore.getState().increaseStepsCompleted();
              backgroundImageMap[props.src] = image;
              backgroundImageLoadedMap[props.src] = true;
            });
            image.src = props.src;
          } else if (backgroundImageLoadedMap[props.src]) {
            imageRef?.replaceWith(image);
          }
        }}
        alt=""
      />
    );
  },
  (prev, next) => prev.src === next.src
);
