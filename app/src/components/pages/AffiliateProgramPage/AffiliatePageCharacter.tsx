import FlexBox from '@/components/ui/FlexBox';
import { Typography } from '@mui/material';
import React from 'react';
import {
  CharacterCoinStatChip,
  CharacterImpactStatChip,
} from '../Characters/CharacterStatChip';

type AffiliatePageCharacterProps = {
  title: React.ReactNode;
  characterImage: React.ReactNode;
  coins: number;
  impact?: number;
  plus?: boolean;
};

export function AffiliatePageCharacter({
  title,
  characterImage,
  coins,
  impact,
  plus,
}: AffiliatePageCharacterProps) {
  return (
    <FlexBox>
      <Typography align="center" variant="h4">
        {title}
      </Typography>
      {characterImage}
      <FlexBox flexDirection="row" gap={1} mt={-2}>
        {impact && <CharacterImpactStatChip value={impact} plus={plus} />}
        <CharacterCoinStatChip value={coins} plus={plus} />
      </FlexBox>
    </FlexBox>
  );
}
