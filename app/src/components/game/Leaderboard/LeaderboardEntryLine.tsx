import FlexBox from '@/components/ui/FlexBox';
import { borderRadiuses, boxShadows, colors, textShadows } from '@/theme/theme';
import { PlacingStar } from '@/components/pages/Characters/PlacingStar';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';
import React from 'react';
import useIngameStore from '@/state/IngameStore';
import { ReactComponent as ConquestIcon } from '@/icons/conquest.svg';
import { ReactComponent as ScoreIcon } from '@/icons/score.svg';
import { ReactComponent as BotIcon } from '@/icons/bot.svg';
import { ReactComponent as VerifiedIcon } from '@/icons/verified.svg';
import SvgIcon from '@mui/material/SvgIcon';
import { PlayerStatus } from 'infinitris2-models';
import { FormattedMessage } from 'react-intl';
import { DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';

type LeaderboardEntryLineProps = {
  playerId: number;
  isLeaderboardOpen: boolean;
};

export const LeaderboardEntryLine = React.memo(
  _LeaderboardEntryLine,
  (prevProps, nextProps) =>
    nextProps.playerId === prevProps.playerId &&
    nextProps.isLeaderboardOpen === prevProps.isLeaderboardOpen
);

function _LeaderboardEntryLine({
  playerId,
  isLeaderboardOpen,
}: LeaderboardEntryLineProps) {
  //console.log('Re-render leaderboard entry line');

  return (
    <LeaderboardEntryLineInternal
      playerId={playerId}
      isLeaderboardOpen={isLeaderboardOpen}
    >
      <LeaderboardEntryScore playerId={playerId} />
    </LeaderboardEntryLineInternal>
  );
}

type LeaderboardEntryScoreProps = {
  playerId: number;
};

function LeaderboardEntryScore({ playerId }: LeaderboardEntryScoreProps) {
  const simulation = useIngameStore((store) => store.simulation);
  const score = useIngameStore(
    (store) =>
      store.leaderboardEntries.find((entry) => entry.playerId === playerId)
        ?.score
  );
  const hasPercent = simulation?.settings.gameModeType === 'conquest';
  // console.log('Re-render leaderboard entry score');
  return (
    <>
      {score || 0}
      {hasPercent ? '%' : ''}
    </>
  );
}

type LeaderboardEntryLineInternalProps = {
  playerId: number;
  isLeaderboardOpen: boolean;
};

function LeaderboardEntryLineInternal({
  playerId,
  isLeaderboardOpen,
  children,
}: React.PropsWithChildren<LeaderboardEntryLineInternalProps>) {
  // only re-render if the player's placing or status changes
  const entry = useIngameStore(
    (store) =>
      store.leaderboardEntries.find((entry) => entry.playerId === playerId),
    (prevState, newState) =>
      prevState?.placing === newState?.placing &&
      prevState?.status === newState?.status
  );

  const simulation = useIngameStore((store) => store.simulation);
  // console.log(
  //   'Re-render leaderboard entry line internal ' +
  //     entry.playerId +
  //     ' ' +
  //     entry.placing
  // );
  const nameTypographySx: SxProps<Theme> = React.useMemo(
    () => ({ color: entry?.color, textShadow: textShadows.small }),
    [entry?.color]
  );
  const statusTypographySx: SxProps<Theme> = React.useMemo(
    () => ({
      color: entry?.color,
      textShadow: textShadows.small,
      fontSize: 12,
    }),
    [entry?.color]
  );
  const boxSx: SxProps<Theme> = React.useMemo(
    () => ({
      opacity: entry?.status !== PlayerStatus.ingame ? 0.5 : undefined,
    }),
    [entry?.status]
  );
  if (!entry) {
    return null;
  }
  return (
    <FlexBox
      boxShadow={
        isLeaderboardOpen && entry.isControllable ? boxShadows.small : undefined
      }
      border={
        isLeaderboardOpen && entry.isControllable
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
      <CharacterImage
        characterId={entry.characterId || DEFAULT_CHARACTER_ID}
        width={64}
      />
      <FlexBox flex={1} alignItems="flex-start">
        <FlexBox flexDirection="row" gap={0.5}>
          <Typography
            flex={1}
            variant="body1"
            sx={nameTypographySx}
            maxWidth={0.9}
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap"
          >
            {entry.nickname}
          </Typography>
          {entry.isBot && (
            <SvgIcon fontSize="small" color="secondary">
              <BotIcon />
            </SvgIcon>
          )}
          {entry.isNicknameVerified && (
            <SvgIcon fontSize="small" color="secondary">
              <VerifiedIcon />
            </SvgIcon>
          )}
        </FlexBox>
        {entry.status !== PlayerStatus.ingame && (
          <Typography variant="body1" sx={statusTypographySx}>
            {entry.playerId === simulation?.round?.winner?.id ? (
              <FormattedMessage
                defaultMessage="Winner"
                description="leaderboard entry winner status"
              />
            ) : entry.status === PlayerStatus.knockedOut ? (
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
          //width={0.2}
          gap={0.5}
          flexDirection="row"
          flexShrink={0}
        >
          <Typography variant="body1" color="secondary" lineHeight="1">
            {children}
          </Typography>
          <SvgIcon fontSize="small" sx={{ color: entry.color }}>
            {simulation?.settings.gameModeType === 'conquest' ||
            simulation?.settings.gameModeType === 'column-conquest' ? (
              <ConquestIcon />
            ) : (
              <ScoreIcon />
            )}
          </SvgIcon>
        </FlexBox>
      )}
    </FlexBox>
  );
}
