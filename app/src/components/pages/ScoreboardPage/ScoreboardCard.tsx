import {
  Box,
  Card,
  SvgIcon,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { IScoreboardEntry } from 'infinitris2-models';
import React from 'react';
// TODO: load assets from firebase storage
import coneFace from './assets/faces/cone.png';

import { ReactComponent as StarIcon } from '@/icons/scoreboard_star.svg';
import FlexBox from '@/components/ui/FlexBox';
import { ReactComponent as ImpactIcon } from '@/icons/impact.svg';
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { ReactComponent as BadgeIcon } from '@/icons/badge.svg';

export type ScoreboardCardProps = {
  entry: IScoreboardEntry;
  placing: number;
};

// https://stackoverflow.com/a/39466341/4562693
const getOrdinalSuffix = (n: number) =>
  [, 'st', 'nd', 'rd'][(n / 10) % 10 ^ 1 && n % 10] || 'th';

const getScoreColor = (n: number) =>
  n === 1 ? '#FAA81A' : n === 2 ? '#CCCBCB' : n === 3 ? '#D28E57' : '#DE5E5E';

const getScoreSize = (n: number) => (n < 4 ? 120 : 80);
const getScoreFontSize = (n: number) =>
  getScoreSize(n) * 0.25 * (1 / (1 + (n.toString().length - 1) * 0.15));

export function ScoreboardCard({ entry, placing }: ScoreboardCardProps) {
  const isSmallScreen = useMediaQuery(`(max-width:600px)`);
  const width = isSmallScreen ? 150 : 200;

  return (
    <Card>
      <FlexBox p={1}>
        <Typography variant="h3" align="center">
          {entry.nickname}
        </Typography>
        <FlexBox position="relative">
          <FlexBox
            style={{
              position: 'absolute',
              top: '50px',
              left: '50px',
            }}
          >
            <StarIcon
              style={{
                position: 'absolute',
                width: getScoreSize(placing) + 'px',
                height: getScoreSize(placing) + 'px',
                color: getScoreColor(placing),
              }}
            />
            <Typography
              variant="body1"
              style={{
                position: 'absolute',
                fontSize: getScoreFontSize(placing) + 'px',
              }}
            >
              {placing}
              <sup>{getOrdinalSuffix(placing)}</sup>
            </Typography>
          </FlexBox>
          <img
            src={coneFace}
            alt="character"
            style={{
              height: 'auto',
              width: width + 'px',
            }}
          />
        </FlexBox>
        <FlexBox flexDirection="row" gridGap={10} mt={1}>
          <ScoreboardCardStatistic
            statistic={entry.networkImpact}
            icon={<ImpactIcon />}
          />
          <ScoreboardCardStatistic
            statistic={entry.coins}
            icon={<CoinIcon />}
          />
          <ScoreboardCardStatistic
            statistic={entry.numBadges}
            icon={<BadgeIcon />}
          />
        </FlexBox>
      </FlexBox>
    </Card>
  );
}
type ScoreboardCardStatisticProps = {
  statistic: number;
  icon: React.ReactNode;
};
function ScoreboardCardStatistic({
  icon,
  statistic,
}: ScoreboardCardStatisticProps) {
  return (
    <FlexBox flexDirection="row">
      <SvgIcon>{icon}</SvgIcon>
      <Typography variant="h6">{statistic || 0}</Typography>
    </FlexBox>
  );
}
