import FlexBox from '@/components/ui/FlexBox';
import { ReactComponent as StarIcon } from '@/icons/scoreboard_star.svg';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { colors } from '@/theme/theme';

// https://stackoverflow.com/a/39466341/4562693
const getOrdinalSuffix = (n: number) =>
  [, 'st', 'nd', 'rd'][(n / 10) % 10 ^ 1 && n % 10] || 'th';

const getScoreColor = (n?: number) =>
  !n
    ? '#333333'
    : n === 1
    ? '#FAA81A'
    : n === 2
    ? '#B4B4B4'
    : n === 3
    ? '#D28E57'
    : '#DE5E5E';

const getScoreSize = (n?: number) => (!n || n < 4 ? 100 : 80);
const getScoreFontSize = (n?: number, numberOnly = false) => {
  if (!n) n = 1;
  return (
    getScoreSize(n) *
    (numberOnly ? 0.3 : 0.23) *
    (1 / (1 + (n.toString().length - 1) * 0.15))
  );
};

type PlacingStarProps = {
  placing?: number;
  offset: number;
  scale?: number;
  absolute?: boolean;
  linkToScoreboard?: boolean;
  numberOnly?: boolean;
};

export function PlacingStar({
  placing,
  offset,
  scale = 1,
  absolute = true,
  linkToScoreboard,
  numberOnly,
}: PlacingStarProps) {
  return (
    <FlexBox
      style={{
        ...(absolute
          ? {
              position: 'absolute',
              top: offset + 'px',
              left: offset + 'px',
            }
          : {
              width: getScoreSize(placing) * 0.6 * scale + 'px',
              height: getScoreSize(placing) * scale + 'px',
            }),
        pointerEvents: 'none',
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
          fontSize: getScoreFontSize(placing, numberOnly) * scale + 'px',
          color: colors.white,
        }}
      >
        {placing || '?'}
        {placing && !numberOnly && <sup>{getOrdinalSuffix(placing)}</sup>}
      </Typography>
      {linkToScoreboard && (
        <FlexBox
          style={{
            position: 'absolute',
            width: getScoreSize(placing) * scale + 'px',
            height: getScoreSize(placing) * scale + 'px',
          }}
        >
          <Link
            component={RouterLink}
            underline="none"
            to={Routes.scoreboard}
            width="60%"
            height="60%"
            style={{
              pointerEvents: 'all',
            }}
          ></Link>
        </FlexBox>
      )}
    </FlexBox>
  );
}
