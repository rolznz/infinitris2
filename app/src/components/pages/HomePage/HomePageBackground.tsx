import React from 'react';
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
import FlexBox from '@/components/ui/FlexBox';
import useLoaderStore, { LoaderStepName } from '@/state/LoaderStore';
import useDarkMode from '@/components/hooks/useDarkMode';
import { firstTimeAnimationDelaySeconds } from './homePageConstants';
import { zIndexes } from '@/theme/theme';
import shallow from 'zustand/shallow';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';

export const homePageBackgroundTransitionSeconds = 5;

const _HomePageBackground = ({ children }: React.PropsWithChildren<{}>) => {
  const isDarkMode = useDarkMode();
  const windowSize = useWindowSize();
  const isLandscape = useIsLandscape();
  const isShortScreen = useMediaQuery(
    `(max-height:${isLandscape ? 400 : 600}px)`
  );

  const [isLoaded, delayButtonVisibility] = useLoaderStore(
    (store) => [store.hasFinished, store.delayButtonVisibility],
    shallow
  );

  return (
    <FlexBox
      flex={1}
      position="relative"
      bgcolor={'background.paper'}
      overflow="hidden"
      key={
        // orientation.type +
        // ' ' +
        windowSize.width +
        ' ' +
        windowSize.height /* force home page images re-render */
      }
    >
      <FlexBox
        position="absolute"
        top={0}
        left={0}
        width="100vw"
        height="100vh"
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
          width="100vw"
          height="100vh"
          objectFit="cover"
          bottom="0"
          left="0"
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
          height="100vh"
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
          height="100vh"
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
      <FlexBox
        position="absolute"
        top="calc(100vh - 112px)"
        left={0}
        width="100vw"
        height="214px"
        sx={{
          background: (theme) =>
            `linear-gradient(180deg, #00000000 0%, ${theme.palette.background.paper} 50%, #00000000 100%)`,
        }}
      />
      <FlexBox zIndex={zIndexes.above}>{children}</FlexBox>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: '#000000',
          opacity: isLoaded ? 0.5 : 0,
          width: '100%',
          height: '100%',
          transition: `opacity ${homePageBackgroundTransitionSeconds}s ${
            delayButtonVisibility ? firstTimeAnimationDelaySeconds : 0
          }s`,
        }}
        role="presentation"
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
    useWindowSize();
    useIsLandscape();

    return (
      <img
        ref={(imageRef) => {
          let image = backgroundImageMap[props.src];
          if (!image) {
            const stepKey = 'image-' + props.src;
            useLoaderStore
              .getState()
              .addStep(stepKey as unknown as LoaderStepName);
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
              useLoaderStore
                .getState()
                .completeStep(stepKey as unknown as LoaderStepName);
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
