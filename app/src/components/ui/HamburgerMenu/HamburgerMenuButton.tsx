import { Box, IconButton, makeStyles, SvgIcon } from '@material-ui/core';
import React from 'react';
import FlexBox from '../FlexBox';
import { ReactComponent as HamburgerIcon } from '@/icons/hamburger.svg';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';
import { playSound, SoundKey } from '@/components/sound/MusicPlayer';
import { useEffect } from 'react';
import usePrevious from 'react-use/lib/usePrevious';
import { homePageBackgroundDelaySeconds } from '@/components/pages/HomePage/HomePageBackground';
import useLoaderStore from '@/state/LoaderStore';
import { firstTimeAnimationDelaySeconds } from '@/components/pages/HomePage/HomePage';

let hasAnimated = window.location.pathname !== '/';
const useStyles = makeStyles({
  button: {
    position: 'absolute',
    top: 0,
    right: 0,
    opacity: hasAnimated ? 1 : 0,
    ...(hasAnimated
      ? {}
      : {
          animation: `$button ${homePageBackgroundDelaySeconds}s ${firstTimeAnimationDelaySeconds}s forwards`,
        }),
  },
  '@keyframes button': {
    '0%': {
      opacity: 0,
    },
    '100%': {
      opacity: 1,
    },
  },
});

export default function HamburgerMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const wasOpen = usePrevious(isOpen);
  useEffect(() => {
    if (isOpen || wasOpen) {
      playSound(SoundKey.click);
    }
  }, [isOpen, wasOpen]);
  const classes = useStyles();

  const isLoading = useLoaderStore((store) => !store.hasFinished);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(
        () => (hasAnimated = true),
        (homePageBackgroundDelaySeconds + firstTimeAnimationDelaySeconds) * 1000
      );
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Box className={classes.button} zIndex="hamburgerButton">
      <FlexBox padding={2}>
        <IconButton style={{}} onClick={() => setIsOpen(true)}>
          <SvgIcon
            color="secondary"
            fontSize="large"
            style={{
              filter: 'drop-shadow(0 0 0.75rem white)',
            }}
          >
            <HamburgerIcon />
          </SvgIcon>
        </IconButton>
      </FlexBox>
      <HamburgerMenu isOpen={isOpen} close={() => setIsOpen(false)} />
    </Box>
  );
}
