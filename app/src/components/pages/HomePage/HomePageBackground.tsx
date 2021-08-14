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

export default function HomePageBackground({
  children,
}: React.PropsWithChildren<{}>) {
  const windowSize = useWindowSize();
  const isLandscape = windowSize.width >= windowSize.height;
  const [loadCount, setLoadCount] = useState(0);
  const updateLoadCount = () => setLoadCount((prev) => prev + 1);

  const isLoaded = loadCount >= 4;

  const useStyles = makeStyles({
    backgroundDarkening: {
      height: '100%',
      animation: isLoaded ? `$backgroundDarkening 5000ms forwards` : '',
      backgroundColor: '#00000000',
    },
    '@keyframes backgroundDarkening': {
      '0%': {
        backgroundColor: '#00000000',
      },
      '100%': {
        backgroundColor: '#000000aa',
      },
    },
  });

  const classes = useStyles();

  console.log('Background re-render');

  return (
    <div
      style={{
        height: '100%',
        backgroundImage:
          'url(' +
          (isLandscape ? backgroundImage : backgroundPortraitImage) +
          ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: isLoaded ? 1 : 0,
      }}
    >
      <div className={classes.backgroundDarkening}>
        <img
          src={isLandscape ? foregroundLeftImage : foregroundLeftPortraitImage}
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
            isLandscape ? foregroundBottomImage : foregroundBottomPortraitImage
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
        {children}
      </div>
    </div>
  );
}
