import { Box, Card, SvgIcon, Typography } from '@material-ui/core';
import { IScoreboardEntry } from 'infinitris2-models';
import React from 'react';
// TODO: load assets from firebase storage
import coneFace from './assets/faces/cone.png';

import { ReactComponent as StarIcon } from '@/icons/scoreboard_star.svg';
import FlexBox from '@/components/ui/FlexBox';

export type ScoreboardCardProps = {
  entry: IScoreboardEntry;
};

export function ScoreboardCard({ entry }: ScoreboardCardProps) {
  return (
    <Card style={{ position: 'relative' }}>
      <FlexBox style={{ position: 'absolute', top: 0, left: 0 }}>
        <StarIcon style={{ width: '40px' }} />
      </FlexBox>
      <Typography variant="body1">{entry.nickname}</Typography>
      <img
        src={coneFace}
        alt="character"
        style={{
          height: 'auto',
          width: '200px',
        }}
      />
    </Card>
  );
}
