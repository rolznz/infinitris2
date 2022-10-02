import React from 'react';
import FlexBox from './FlexBox';
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { openCoinInfoDialog } from '@/state/DialogStore';
import { useUser } from '@/components/hooks/useUser';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { dropShadows } from '@/theme/theme';

export default function CoinsDisplay() {
  const coins = useUser().readOnly?.coins || 0;

  return (
    <FlexBox
      style={{ pointerEvents: 'all', cursor: 'pointer' }}
      flexDirection="row"
      onClick={openCoinInfoDialog}
    >
      <IconButton size="large">
        <SvgIcon
          sx={{
            filter: dropShadows.small,
          }}
        >
          <CoinIcon />
        </SvgIcon>
      </IconButton>
      <Typography sx={{ filter: dropShadows.small }}>{coins}</Typography>
    </FlexBox>
  );
}
