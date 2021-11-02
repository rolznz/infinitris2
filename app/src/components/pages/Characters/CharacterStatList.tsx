import FlexBox from '@/components/ui/FlexBox';
import React from 'react';
import {
  CharacterImpactStatChip,
  CharacterCoinStatChip,
} from './CharacterStatChip';

type CharacterStatListProps = {
  networkImpact: number;
  coins: number;
};

export function CharacterStatList({
  coins,
  networkImpact,
}: CharacterStatListProps) {
  return (
    <FlexBox flexDirection="row" gridGap={10}>
      <CharacterImpactStatChip value={networkImpact} />
      <CharacterCoinStatChip value={coins} />
    </FlexBox>
  );
}