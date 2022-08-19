import FlexBox from '@/components/ui/FlexBox';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import Typography from '@mui/material/Typography';
import { IChallenge, IChallengeAttempt, WithId } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ReactComponent as StopwatchIcon } from '@/icons/stopwatch.svg';
import { ReactComponent as PlayIcon } from '@/icons/play.svg';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import { SxProps } from '@mui/material/styles';
import {
  borderRadiuses,
  boxShadows,
  dropShadows,
  textShadows,
  zIndexes,
} from '@/theme/theme';
import { PlacingStar } from '@/components/pages/Characters/PlacingStar';
import isMobile from '@/utils/isMobile';
import { DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';
import Routes, { RouteSubPaths } from '@/models/Routes';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import { challengeLaunchReplaySearchParam } from '@/components/pages/ChallengePage/ChallengePage';

type ChallengeTopAttemptsProps = {
  challengeId: string;
  challenge: IChallenge;
  viewReplay?(attempt: IChallengeAttempt): void;
};

export function ChallengeTopAttempts(props: ChallengeTopAttemptsProps) {
  if (
    props.challengeId &&
    props.challenge &&
    !props.challenge.isTemplate &&
    props.challenge.isPublished
  ) {
    return <ChallengeTopAttemptsInternal {...props} />;
  }
  return null;
}
function ChallengeTopAttemptsInternal({
  challengeId,
  challenge,
  viewReplay,
}: ChallengeTopAttemptsProps) {
  const topAttempts = challenge.readOnly?.topAttempts;

  return (
    <FlexBox>
      {/*<Typography variant="h4" textAlign="center">
        <FormattedMessage
          defaultMessage="Top Plays"
          description="Top challenge attempts"
        />
  </Typography>*/}
      <FlexBox flexDirection="row" gap={2} maxWidth={500} flexWrap="nowrap">
        {topAttempts?.length ? (
          <>
            {topAttempts.map((attempt, index) => (
              <ChallengeTopAttempt
                key={attempt.id}
                placing={index + 1}
                challengeId={challengeId}
                attempt={attempt}
                viewReplay={viewReplay}
              />
            ))}
            {!!challenge.readOnly?.numAttempts &&
              challenge.readOnly.numAttempts > 3 && (
                <Link
                  component={RouterLink}
                  to={`${Routes.challenges}/${challengeId}/${RouteSubPaths.challengesPageAttempts}`}
                  underline="none"
                >
                  <FlexBox sx={attemptSx}>
                    <FlexBox p={2}>
                      <Typography
                        variant="h6"
                        textAlign="center"
                        sx={{ textShadow: textShadows.base }}
                      >
                        {'+'}
                        {challenge.readOnly.numAttempts - 3}
                      </Typography>
                    </FlexBox>
                  </FlexBox>
                </Link>
              )}
          </>
        ) : (
          <Typography variant="body2" textAlign="center">
            <FormattedMessage
              defaultMessage="Noone has completed this challenge yet :-("
              description="Top Plays - no completions"
            />
          </Typography>
        )}
      </FlexBox>

      {/*!userId && (
        <Typography variant="caption" textAlign="center" mt={1} mb={-3}>
          <FormattedMessage
            defaultMessage="Get Infinitris Premium to appear here"
            description="Top challenge attempts"
          />
        </Typography>
      )*/}
    </FlexBox>
  );
}

const attemptSx: SxProps = {
  cursor: 'pointer',
  boxShadow: boxShadows.small,
  p: 0.5,
  borderRadius: borderRadiuses.base,
  backgroundColor: 'background.paper',
};

type ChallengeTopAttemptProps = {
  challengeId: string;
  attempt: WithId<IChallengeAttempt>;
  placing: number;
  showPlayerName?: boolean;
} & Pick<ChallengeTopAttemptsProps, 'viewReplay'>;

export function ChallengeTopAttempt({
  placing,
  attempt,
  challengeId,
  showPlayerName,
  viewReplay,
}: ChallengeTopAttemptProps) {
  const viewReplayForThisAttempt = React.useCallback(
    () => viewReplay?.(attempt),
    [viewReplay, attempt]
  );

  const component = (
    <FlexBox
      position="relative"
      onClick={viewReplayForThisAttempt}
      sx={attemptSx}
    >
      <FlexBox
        position="absolute"
        top={0}
        right={0}
        pt={0.75}
        pr={0.5}
        zIndex={zIndexes.above}
      >
        <SvgIcon color="primary" filter={dropShadows.xs}>
          <PlayIcon />
        </SvgIcon>
      </FlexBox>
      <FlexBox position="relative" justifyContent="flex-start" mb={-1}>
        <CharacterImage
          characterId={
            attempt?.readOnly?.user?.selectedCharacterId || DEFAULT_CHARACTER_ID
          }
          width={isMobile() ? 64 : 96}
        />
        <PlacingStar
          placing={placing}
          offset={isMobile() ? 12 : 16}
          scale={isMobile() ? 0.5 : 0.75}
        />
      </FlexBox>
      {showPlayerName && (
        <Typography variant="body1">
          {attempt.readOnly?.user?.nickname || 'Unknown Player'}
        </Typography>
      )}
      <FlexBox width={70} justifyContent="flex-start">
        <FlexBox flexDirection="row">
          <SvgIcon color="primary" sx={{ mt: -0.5 }}>
            <StopwatchIcon />
          </SvgIcon>
          <Typography variant="body2">
            {(attempt.stats.timeTakenMs / 1000).toFixed(2)}s
          </Typography>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  );

  return viewReplay ? (
    component
  ) : (
    <Link
      component={RouterLink}
      to={`${Routes.challenges}/${challengeId}?${challengeLaunchReplaySearchParam}=${attempt.id}`}
    >
      {component}
    </Link>
  );
}
