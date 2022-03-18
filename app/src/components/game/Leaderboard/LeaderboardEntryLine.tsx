import FlexBox from '@/components/ui/FlexBox';
import { borderRadiuses, boxShadows, colors } from '@/theme/theme';
import { PlacingStar } from '@/components/pages/Characters/PlacingStar';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
import React from 'react';
import useIngameStore, { LeaderboardEntry } from '@/state/IngameStore';
import { ReactComponent as ConquestIcon } from '@/icons/conquest.svg';
import SvgIcon from '@mui/material/SvgIcon';

type LeaderboardEntryLineProps = {
  entry: LeaderboardEntry;
  isLeaderboardOpen: boolean;
};

export function LeaderboardEntryLine({
  entry,
  isLeaderboardOpen,
}: LeaderboardEntryLineProps) {
  const simulation = useIngameStore((store) => store.simulation);
  console.log('Re-render leaderboard entry line');
  const nameTypographySx: SxProps<Theme> = React.useMemo(
    () => ({ color: entry.color, textShadow: `0px 1px ${colors.black}` }),
    [entry.color]
  );
  const boxSx: SxProps<Theme> = React.useMemo(
    () => ({ opacity: entry.isSpectating ? 0.5 : undefined }),
    [entry.isSpectating]
  );
  return (
    <FlexBox
      boxShadow={
        isLeaderboardOpen && entry.isHuman ? boxShadows.small : undefined
      }
      border={
        isLeaderboardOpen && entry.isHuman
          ? `1px solid ${colors.black}`
          : undefined
      }
      pl={2}
      pr={1}
      py={0}
      borderRadius={borderRadiuses.base}
      position="relative"
      flexDirection="row"
      flex={1}
      width="100%"
      justifyContent="flex-start"
      sx={boxSx}
    >
      <FlexBox width={0.16}>
        <PlacingStar
          absolute={false}
          placing={entry.placing}
          offset={0}
          scale={0.7}
        />
      </FlexBox>
      <CharacterImage characterId={entry.characterId || '0'} width={64} />
      <Typography
        variant="body1"
        sx={nameTypographySx}
        maxWidth={0.4}
        textOverflow="ellipsis"
        overflow="hidden"
        whiteSpace="nowrap"
      >
        {entry.nickname}
      </Typography>
      <Box flex={1} />
      {!entry.isSpectating && (
        <FlexBox
          boxShadow={boxShadows.small}
          borderRadius={borderRadiuses.base}
          px={1}
          py={0.5}
          justifySelf="flex-end"
          width={0.2}
          gap={0.5}
          flexDirection="row"
          flexShrink={0}
        >
          <Typography variant="body1" color="secondary" lineHeight="1">
            {entry.score}
          </Typography>
          {simulation?.settings.gameModeType === 'conquest' && (
            <SvgIcon fontSize="small">
              <ConquestIcon />
            </SvgIcon>
          )}
        </FlexBox>
      )}
    </FlexBox>
  );
}
