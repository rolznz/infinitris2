import FlexBox from '@/components/ui/FlexBox';
import { borderColor, boxShadows, white } from '@/theme';
import { SvgIcon, Typography } from '@material-ui/core';
import React from 'react';

import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { ReactComponent as ImpactIcon } from '@/icons/impact.svg';
//import { ReactComponent as BadgeIcon } from '@/icons/badge.svg';

type CharacterStatProps = {
  value: number;
  plus?: boolean;
};

type CharacterStatWithIconProps = CharacterStatProps & {
  icon: React.ReactNode;
};

function CharacterStatChip({ icon, value, plus }: CharacterStatWithIconProps) {
  return (
    <FlexBox
      borderRadius={20}
      paddingX={1}
      paddingY={0.5}
      gridGap={5}
      flexDirection="row"
      style={{ backgroundColor: borderColor, boxShadow: boxShadows.small }}
    >
      <SvgIcon>{icon}</SvgIcon>
      <Typography
        variant="h5"
        style={{ color: white, fontWeight: 700, marginTop: '3px' }}
      >
        {value || 0}
        {plus && '+'}
      </Typography>
    </FlexBox>
  );
}

export function CharacterCoinStatChip(props: CharacterStatProps) {
  return <CharacterStatChip icon={<CoinIcon />} {...props} />;
}

export function CharacterImpactStatChip(props: CharacterStatProps) {
  return <CharacterStatChip icon={<ImpactIcon />} {...props} />;
}
