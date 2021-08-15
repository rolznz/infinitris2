import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core';
import foregroundTopImage from './assets/foreground_top.png';
import backgroundImage from './assets/background.png';
import foregroundBottomImage from './assets/foreground_bottom.png';
import foregroundLeftImage from './assets/foreground_left.png';
import foregroundRightImage from './assets/foreground_right.png';
import foregroundTopPortraitImage from './assets/foreground_top_portrait.png';
import backgroundPortraitImage from './assets/background_portrait.png';
import foregroundBottomPortraitImage from './assets/foreground_bottom_portrait.png';
import foregroundLeftPortraitImage from './assets/foreground_left_portrait.png';
import foregroundRightPortraitImage from './assets/foreground_right_portrait.png';

import useWindowSize from 'react-use/lib/useWindowSize';
import { useRef } from 'react';
import { useEffect } from 'react';
import FlexBox from '@/components/ui/FlexBox';
import LoadingSpinner from '@/components/LoadingSpinner';
import HomePage from './HomePage';

let alreadyLoaded = false;

export default function HomePageBackground() {
  const windowSize = useWindowSize();
  const isLandscape = windowSize.width >= windowSize.height;
  const [loadCount, setLoadCount] = useState(0);
  const updateLoadCount = () => setLoadCount((prev) => prev + 1);
  const bgRef = useRef<HTMLDivElement>(null);

  const isLoaded = alreadyLoaded || loadCount >= 5; // bg, fg top, fg left, fg right, fg bottom
  alreadyLoaded = alreadyLoaded || isLoaded;

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
    bgImg.onload = function () {
      if (bgRef.current) {
        bgRef.current.style.backgroundImage = 'url(' + bgImg.src + ')';
        setTimeout(updateLoadCount, 100);
      }
    };
    bgImg.src = isLandscape ? backgroundImage : backgroundPortraitImage;
  }, [isLandscape]);

  console.log('Background re-render');

  return (
    <>
      <FlexBox
        height="100%"
        width="100%"
        style={{ position: 'absolute', zIndex: -1 }}
      >
        <LoadingSpinner type="BallTriangle" />
      </FlexBox>
      <div
        style={{
          height: '100%',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.5s',
        }}
        ref={bgRef}
      >
        <div className={classes.backgroundDarkening}>
          <img
            src={
              isLandscape ? foregroundLeftImage : foregroundLeftPortraitImage
            }
            style={{
              width: 'auto',
              height: '100vh',
              position: 'absolute',
              bottom: 0,
              left: 0,
            }}
            onLoad={updateLoadCount}
          />
          <img
            src={
              isLandscape ? foregroundRightImage : foregroundRightPortraitImage
            }
            style={{
              width: 'auto',
              height: '100vh',
              position: 'absolute',
              bottom: 0,
              right: 0,
            }}
            onLoad={updateLoadCount}
          />
          <img
            src={isLandscape ? foregroundTopImage : foregroundTopPortraitImage}
            style={{
              width: '100vw',
              height: 'auto',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            onLoad={updateLoadCount}
          />
          <img
            src={
              isLandscape
                ? foregroundBottomImage
                : foregroundBottomPortraitImage
            }
            style={{
              width: '100vw',
              height: 'auto',
              position: 'absolute',
              bottom: 0,
              left: 0,
            }}
            onLoad={updateLoadCount}
          />
          <HomePage backgroundLoaded={isLoaded} />
        </div>
      </div>
    </>
  );
}
