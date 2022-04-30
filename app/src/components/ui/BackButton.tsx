import { Box, IconButton, SvgIcon } from '@mui/material';

import FlexBox from './FlexBox';
import { ReactComponent as LeftIcon } from '@/icons/left.svg';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { colors, dropShadows } from '@/theme/theme';
import { exitFullscreen } from '@/utils/launchFullscreen';
import { useIsBackButtonVisible } from '@/components/hooks/useIsBackButtonVisible';

export default function BackButton() {
  const isBackButtonVisible = useIsBackButtonVisible();
  if (!isBackButtonVisible) {
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
