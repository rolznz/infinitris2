import { Box, IconButton, SvgIcon } from '@mui/material';

import FlexBox from './FlexBox';
import { ReactComponent as HomeIcon } from '@/icons/home.svg';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { colors, dropShadows } from '@/theme/theme';
import { exitFullscreen } from '@/utils/launchFullscreen';
import { useIsBackButtonVisible } from '@/components/hooks/useIsBackButtonVisible';
import { Link } from 'react-router-dom';
import Routes from '@/models/Routes';

export default function HomeButton() {
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
        <Link to={Routes.home}>
          <IconButton
            style={{}}
            onClick={() => {
              exitFullscreen();
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
              <HomeIcon />
            </SvgIcon>
          </IconButton>
        </Link>
      </FlexBox>
    </Box>
  );
}
