import { Box, IconButton, SvgIcon } from '@mui/material';

import React from 'react';
import FlexBox from './FlexBox';
import { ReactComponent as LeftIcon } from '@/icons/left.svg';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { useLocation } from 'react-router-dom';
import { colors, dropShadows } from '@/theme/theme';
import { isPwa } from '@/utils/isMobile';
import { exitFullscreen } from '@/utils/launchFullscreen';
import { useIsFullscreen } from '@/components/hooks/useIsFullscreen';

export default function BackButton() {
  const isFullscreen = useIsFullscreen();
  const location = useLocation();
  if (location.pathname === '/' || (!isPwa() && !isFullscreen)) {
    return null;
  }
  return (
    <Box
      zIndex="hamburgerButton"
      sx={{
        opacity: 1,
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    >
      <FlexBox margin={2} style={{ pointerEvents: 'all' }}>
        <IconButton
          style={{}}
          onClick={() => {
            exitFullscreen();
            window.history.back();
            playSound(SoundKey.click);
          }}
          size="large"
        >
          <SvgIcon
            sx={{
              filter: dropShadows.small,
              color: colors.white,
            }}
          >
            <LeftIcon />
          </SvgIcon>
        </IconButton>
      </FlexBox>
    </Box>
  );
}
