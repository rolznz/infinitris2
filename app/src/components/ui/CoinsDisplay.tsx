import React from 'react';
import FlexBox from './FlexBox';
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { openCoinInfoDialog } from '@/state/DialogStore';
import { useUser } from '@/components/hooks/useUser';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

export default function CoinsDisplay() {
  const coins = useUser().readOnly?.coins || 0;

  return (
    <FlexBox style={{ pointerEvents: 'all' }}>
      <IconButton onClick={openCoinInfoDialog} size="large">
        <FlexBox flexDirection="row" gap={1}>
          <SvgIcon>
            <CoinIcon />
          </SvgIcon>
          <Typography>{coins}</Typography>
        </FlexBox>
      </IconButton>
    </FlexBox>
  );
}
