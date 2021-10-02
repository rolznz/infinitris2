import { Box, IconButton, makeStyles, SvgIcon } from '@material-ui/core';
import React from 'react';
import FlexBox from '../FlexBox';
import { ReactComponent as HamburgerIcon } from '@/icons/hamburger.svg';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';
import { playSound, SoundKey } from '@/components/sound/MusicPlayer';
import { useEffect } from 'react';
import usePrevious from 'react-use/lib/usePrevious';
import { homePageBackgroundTransitionSeconds } from '@/components/pages/HomePage/HomePageBackground';
import useLoaderStore from '@/state/LoaderStore';
import { firstTimeAnimationDelaySeconds } from '@/components/pages/HomePage/HomePage';

const useStyles = makeStyles({
  button: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default function HamburgerMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const wasOpen = usePrevious(isOpen);
  const [hasAnimated, setHasAnimated] = useState(
    window.location.pathname !== '/'
  );
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
        () => setHasAnimated(true),
        firstTimeAnimationDelaySeconds * 1.1 * 1000
      );
    }
  }, [isLoading, setHasAnimated]);

  if (isLoading) {
    return null;
  }

  return (
    <Box
      className={classes.button}
      zIndex="hamburgerButton"
      style={{
        opacity: hasAnimated ? 1 : 0,
        transition: `opacity ${firstTimeAnimationDelaySeconds}s`,
      }}
    >
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
