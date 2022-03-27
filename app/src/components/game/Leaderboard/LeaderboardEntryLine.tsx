import FlexBox from '@/components/ui/FlexBox';
import { borderRadiuses, boxShadows, colors, textShadows } from '@/theme/theme';
import { PlacingStar } from '@/components/pages/Characters/PlacingStar';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
import React from 'react';
import useIngameStore, { LeaderboardEntry } from '@/state/IngameStore';
import { ReactComponent as ConquestIcon } from '@/icons/conquest.svg';
import { ReactComponent as BotIcon } from '@/icons/bot.svg';
import SvgIcon from '@mui/material/SvgIcon';
import { PlayerStatus } from 'infinitris2-models';
import { FormattedMessage } from 'react-intl';

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
    () => ({ color: entry.color, textShadow: textShadows.small }),
    [entry.color]
  );
  const statusTypographySx: SxProps<Theme> = React.useMemo(
    () => ({
      color: entry.color,
      textShadow: textShadows.small,
      fontSize: 12,
    }),
    [entry.color]
  );
  const boxSx: SxProps<Theme> = React.useMemo(
    () => ({ opacity: entry.status !== PlayerStatus.ingame ? 0.5 : undefined }),
    [entry.status]
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
      <FlexBox flex={1} alignItems="flex-start">
        <Typography
          flex={1}
          variant="body1"
          sx={nameTypographySx}
          maxWidth={0.9}
          textOverflow="ellipsis"
          overflow="hidden"
          whiteSpace="nowrap"
        >
          {entry.isBot && (
            <SvgIcon fontSize="small" color="secondary">
              <BotIcon />
            </SvgIcon>
          )}
          {entry.nickname}
        </Typography>
        {entry.status !== PlayerStatus.ingame && (
          <Typography variant="body1" sx={statusTypographySx}>
            {entry.status === PlayerStatus.knockedOut ? (
              <FormattedMessage
                defaultMessage="Knocked out"
                description="leaderboard entry knocked out status"
              />
            ) : (
              <FormattedMessage
                defaultMessage="Spectating"
                description="leaderboard entry spectating status"
              />
            )}
          </Typography>
        )}
      </FlexBox>
      {entry.status !== PlayerStatus.spectating && (
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
