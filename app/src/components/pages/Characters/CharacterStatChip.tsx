import FlexBox from '@/components/ui/FlexBox';
import { boxShadows, colors, zIndexes } from '@/theme/theme';
import { SvgIcon, Typography } from '@mui/material';
import React from 'react';

import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { ReactComponent as ImpactIcon } from '@/icons/impact.svg';
import { openCoinInfoDialog, openImpactInfoDialog } from '@/state/DialogStore';
//import { ReactComponent as BadgeIcon } from '@/icons/badge.svg';

type CharacterStatProps = {
  value: number;
  plus?: boolean;
};

type CharacterStatInternalProps = CharacterStatProps & {
  icon: React.ReactNode;
  onClick(): void;
};

function CharacterStatChip({
  icon,
  value,
  plus,
  onClick,
}: CharacterStatInternalProps) {
  return (
    <FlexBox
      borderRadius={20}
      paddingX={1}
      paddingY={0.5}
      gridGap={5}
      flexDirection="row"
      style={{
        backgroundColor: 'borderColor',
        boxShadow: boxShadows.small,
        cursor: 'pointer',
        zIndex: zIndexes.above,
      }}
      onClick={onClick}
    >
      <SvgIcon>{icon}</SvgIcon>
      <Typography
        variant="h5"
        style={{ color: colors.white, fontWeight: 700, marginTop: '3px' }}
      >
        {value || 0}
        {plus && '+'}
      </Typography>
    </FlexBox>
  );
}

export function CharacterCoinStatChip(props: CharacterStatProps) {
  return (
    <CharacterStatChip
      icon={<CoinIcon />}
      {...props}
      onClick={openCoinInfoDialog}
    />
  );
}

export function CharacterImpactStatChip(props: CharacterStatProps) {
  return (
    <CharacterStatChip
      icon={<ImpactIcon />}
      {...props}
      onClick={openImpactInfoDialog}
    />
  );
}
