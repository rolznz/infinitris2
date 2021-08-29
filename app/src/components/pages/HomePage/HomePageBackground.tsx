import React, { useState } from 'react';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import backgroundImage from './assets/background.png';
import backgroundPortraitImage from './assets/background_portrait.png';
import backgroundImageDark from './assets/background_dark.png';
import backgroundPortraitImageDark from './assets/background_portrait_dark.png';

import foregroundTopImage from './assets/foreground_top.png';
import foregroundBottomImage from './assets/foreground_bottom.png';
import foregroundLeftImage from './assets/foreground_left.png';
import foregroundRightImage from './assets/foreground_right.png';
import foregroundTopPortraitImage from './assets/foreground_portrait_top.png';
import foregroundBottomPortraitImage from './assets/foreground_portrait_bottom.png';
import foregroundLeftPortraitImage from './assets/foreground_portrait_left.png';
import foregroundRightPortraitImage from './assets/foreground_portrait_right.png';

import useWindowSize from 'react-use/lib/useWindowSize';
import useOrientation from 'react-use/lib/useOrientation';
import { useRef } from 'react';
import { useEffect } from 'react';
import FlexBox from '@/components/ui/FlexBox';
import LoadingSpinner from '@/components/LoadingSpinner';
import HomePage from './HomePage';
import useLoaderStore from '@/state/LoaderStore';
import Loadable from '@/components/ui/Loadable';
import useDarkMode from '@/components/hooks/useDarkMode';

export default function HomePageBackground() {
  const isDarkMode = useDarkMode();
  const windowSize = useWindowSize();
  useOrientation(); // force re-render on orientation change
  const isLandscape = windowSize.width >= windowSize.height;
  const bgRef = useRef<HTMLDivElement>(null);
  const shortScreen = useMediaQuery(
    `(max-height:${isLandscape ? 400 : 600}px)`
  );
  const loaderStore = useLoaderStore();
  const isLoaded = loaderStore.isLoaded();
  const increaseSteps = loaderStore.increaseSteps;
  const increaseStepsCompleted = loaderStore.increaseStepsCompleted;

  const useStyles = makeStyles({
    backgroundDarkening: {
      height: '100%',
      animation: isLoaded ? `$backgroundDarkening 5000ms forwards` : '',
      pointerEvents: isLoaded ? 'unset' : 'none',
      backgroundColor: '#00000000',
    },
    '@keyframes backgroundDarkening': {
      '0%': {
        backgroundColor: '#00000000',
      },
      '100%': {
        backgroundColor: '#00000088',
      },
    },
  });

  const classes = useStyles();

  useEffect(() => {
    var bgImg = new Image();
    increaseSteps();
    bgImg.onload = function () {
      if (bgRef.current) {
        bgRef.current.style.backgroundImage = 'url(' + bgImg.src + ')';
        setTimeout(() => increaseStepsCompleted(), 100);
      }
    };
    bgImg.src = isLandscape
      ? isDarkMode
        ? backgroundImageDark
        : backgroundImage
      : isDarkMode
      ? backgroundPortraitImageDark
      : backgroundPortraitImage;
  }, [isLandscape, increaseSteps, increaseStepsCompleted, isDarkMode]);

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.5s',
          overflow: 'hidden',
        }}
        ref={bgRef}
      >
        <div className={classes.backgroundDarkening} role="presentation">
          <Loadable
            child={(onLoad) => (
              <img
                src={
                  isLandscape
                    ? foregroundLeftImage
                    : foregroundLeftPortraitImage
                }
                alt=""
                style={{
                  width: 'auto',
                  height: '100vh',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                }}
                onLoad={onLoad}
              />
            )}
          />
          <Loadable
            child={(onLoad) => (
              <img
                src={
                  isLandscape
                    ? foregroundRightImage
                    : foregroundRightPortraitImage
                }
                alt=""
                style={{
                  width: 'auto',
                  height: '100vh',
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                }}
                onLoad={onLoad}
              />
            )}
          />
          <Loadable
            child={(onLoad) => (
              <img
                src={
                  isLandscape ? foregroundTopImage : foregroundTopPortraitImage
                }
                alt=""
                style={{
                  width: '100vw',
                  height: 'auto',
                  position: 'absolute',
                  top: 0,
                  marginTop: shortScreen ? '-50px' : 0,
                  left: 0,
                }}
                onLoad={onLoad}
              />
            )}
          />
          <Loadable
            child={(onLoad) => (
              <img
                src={
                  isLandscape
                    ? foregroundBottomImage
                    : foregroundBottomPortraitImage
                }
                alt=""
                style={{
                  width: '100vw',
                  height: 'auto',
                  position: 'absolute',
                  bottom: 0,
                  marginTop: shortScreen ? '-50px' : 0,
                  left: 0,
                }}
                onLoad={onLoad}
              />
            )}
          />
          <HomePage backgroundLoaded={isLoaded} />
        </div>
      </div>
    </>
  );
}
