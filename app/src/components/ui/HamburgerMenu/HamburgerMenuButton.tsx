import { Box, IconButton, SvgIcon } from '@mui/material';

import React from 'react';
import FlexBox from '../FlexBox';
import { ReactComponent as HamburgerIcon } from '@/icons/hamburger.svg';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { useEffect } from 'react';
import usePrevious from 'react-use/lib/usePrevious';
import useLoaderStore from '@/state/LoaderStore';
import { firstTimeAnimationDelaySeconds } from '@/components/pages/HomePage/homePageConstants';
import shallow from 'zustand/shallow';

export default function HamburgerMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const wasOpen = usePrevious(isOpen);
  const [isLoading, delayButtonVisibility] = useLoaderStore(
    (store) => [!store.hasFinished, store.delayButtonVisibility],
    shallow
  );
  const [hasAnimated, setHasAnimated] = useState(
    window.location.pathname !== '/' || !delayButtonVisibility
  );
  useEffect(() => {
    if (isOpen || wasOpen) {
      playSound(SoundKey.click);
    }
  }, [isOpen, wasOpen]);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(
        () => setHasAnimated(true),
        delayButtonVisibility ? firstTimeAnimationDelaySeconds * 1.1 * 1000 : 0
      );
    }
  }, [isLoading, delayButtonVisibility, setHasAnimated]);

  if (isLoading) {
    return null;
  }

  return (
    <Box
      zIndex="hamburgerButton"
      sx={{
        opacity: hasAnimated ? 1 : 0,
        transition: `opacity ${firstTimeAnimationDelaySeconds}s`,
        position: 'fixed',
        top: 0,
        right: 0,
        pointerEvents: 'none',
      }}
    >
      <FlexBox margin={2} style={{ pointerEvents: 'all' }}>
        <IconButton style={{}} onClick={() => setIsOpen(true)} size="large">
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
