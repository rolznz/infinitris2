import React from 'react';
import FlexBox from './FlexBox';
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { useLocation } from 'react-router-dom';
import Routes from '@/models/Routes';
import { openCoinInfoDialog } from '@/state/DialogStore';
import { useUser } from '@/components/hooks/useUser';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useIsBackButtonVisible } from '@/components/hooks/useIsBackButtonVisible';

export default function CoinsDisplay() {
  const location = useLocation();
  const coins = useUser().readOnly?.coins || 0;
  const isBackButtonVisible = useIsBackButtonVisible();

  if (location.pathname.indexOf(Routes.market) < 0) {
    return null;
  }
  return (
    <Box
      zIndex="hamburgerButton"
      sx={{
        opacity: 1,
        position: 'fixed',
        top: 0,
        left: isBackButtonVisible ? 40 : 0,
        pointerEvents: 'none',
      }}
    >
      <FlexBox margin={2} style={{ pointerEvents: 'all' }}>
        <IconButton onClick={openCoinInfoDialog} size="large">
          <FlexBox flexDirection="row" gap={1}>
            <SvgIcon>
              <CoinIcon />
            </SvgIcon>
            <Typography>{coins}</Typography>
          </FlexBox>
        </IconButton>
      </FlexBox>
    </Box>
  );
}
