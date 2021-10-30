import FlexBox from '@/components/ui/FlexBox';
import { Typography } from '@material-ui/core';
import { ReactComponent as StarIcon } from '@/icons/scoreboard_star.svg';
import React from 'react';
import { white } from '@/theme';

// https://stackoverflow.com/a/39466341/4562693
const getOrdinalSuffix = (n: number) =>
  [, 'st', 'nd', 'rd'][(n / 10) % 10 ^ 1 && n % 10] || 'th';

const getScoreColor = (n?: number) =>
  !n
    ? '#333333'
    : n === 1
    ? '#FAA81A'
    : n === 2
    ? '#CCCBCB'
    : n === 3
    ? '#D28E57'
    : '#DE5E5E';

const getScoreSize = (n?: number) => (!n || n < 4 ? 100 : 80);
const getScoreFontSize = (n?: number) => {
  if (!n) n = 1;
  return getScoreSize(n) * 0.23 * (1 / (1 + (n.toString().length - 1) * 0.15));
};

type PlacingStarProps = {
  placing?: number;
  offset: number;
  scale?: number;
};

export function PlacingStar({ placing, offset, scale = 1 }: PlacingStarProps) {
  return (
    <FlexBox
      style={{
        position: 'absolute',
        top: offset + 'px',
        left: offset + 'px',
      }}
    >
      <StarIcon
        style={{
          position: 'absolute',
          width: getScoreSize(placing) * scale + 'px',
          height: getScoreSize(placing) * scale + 'px',
          color: getScoreColor(placing),
          filter: 'drop-shadow( 0px 7px 14px rgba(0, 0, 0, .3))',
        }}
      />
      <Typography
        variant="body1"
        style={{
          position: 'absolute',
          fontSize: getScoreFontSize(placing) * scale + 'px',
          color: white,
        }}
      >
        {placing || '?'}
        {placing && <sup>{getOrdinalSuffix(placing)}</sup>}
      </Typography>
    </FlexBox>
  );
}
