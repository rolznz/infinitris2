import { Typography, useMediaQuery } from '@material-ui/core';
import { IScoreboardEntry } from 'infinitris2-models';
import React from 'react';
import FlexBox from '@/components/ui/FlexBox';
import { CharacterImage } from '../Characters/CharacterImage';
import { PlacingStar } from '../Characters/PlacingStar';
import { CharacterStatList } from '../Characters/CharacterStatList';

export type ScoreboardCardProps = {
  entry: IScoreboardEntry;
  placing: number;
};

export function ScoreboardCard({ entry, placing }: ScoreboardCardProps) {
  const isSmallScreen = useMediaQuery(`(max-width:600px)`);
  const width = isSmallScreen ? 220 : 250;
  const starOffset = isSmallScreen ? 50 : 60;

  return (
    <FlexBox mb={8} mx={-2.5}>
      <Typography variant="h4" align="center">
        {entry.nickname}
      </Typography>
      <FlexBox position="relative" mt={-1}>
        <PlacingStar placing={placing} offset={starOffset} />
        <CharacterImage characterId={placing.toString()} width={width} />
      </FlexBox>
      <FlexBox mt={-3}>
        <CharacterStatList
          networkImpact={entry.networkImpact}
          coins={entry.coins}
        />
      </FlexBox>
    </FlexBox>
  );
}
