import { Box, IconButton, SvgIcon } from '@mui/material';

import React from 'react';
import FlexBox from './FlexBox';
import LeftIcon from '@mui/icons-material/ChevronLeft';
import { playSound, SoundKey } from '@/components/sound/MusicPlayer';
import { useLocation } from 'react-router-dom';
import { colors } from '@/theme/theme';

export default function HamburgerMenuButton() {
  const location = useLocation();
  if (location.pathname === '/') {
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
            window.history.back();
            playSound(SoundKey.click);
          }}
          size="large"
        >
          <SvgIcon
            fontSize="large"
            sx={{
              filter: 'drop-shadow(0 0 0.75rem white)',
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
