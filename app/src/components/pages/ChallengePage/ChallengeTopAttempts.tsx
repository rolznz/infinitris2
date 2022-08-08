import FlexBox from '@/components/ui/FlexBox';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import Typography from '@mui/material/Typography';
import { limit, orderBy, where } from 'firebase/firestore';
import {
  challengeAttemptsPath,
  IChallenge,
  IChallengeAttempt,
} from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { ReactComponent as StopwatchIcon } from '@/icons/stopwatch.svg';
import { ReactComponent as PlayIcon } from '@/icons/play.svg';
import useAuthStore from '@/state/AuthStore';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import { SxProps } from '@mui/material';
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

type ChallengeTopAttemptsProps = {
  challengeId: string;
  challenge: IChallenge;
  viewReplay(attempt: IChallengeAttempt): void;
};

const noLimitSx: SxProps = {
  overflowX: 'auto',
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
  const userId = useAuthStore((store) => store.user?.uid);
  const [hasLimit, setHasLimit] = React.useState(true);
  const toggleLimit = React.useCallback(
    () => setHasLimit((hasLimit) => !hasLimit),
    []
  );
  const useCollectionOptions: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('challengeId', '==', challengeId),
        orderBy('stats.timeTakenMs', 'asc'),
        ...(hasLimit ? [limit(3)] : []),
      ],
    }),
    [challengeId, hasLimit]
  );

  const { data: attemptDocs } = useCollection<IChallengeAttempt>(
    challengeAttemptsPath,
    useCollectionOptions
  );
  if (!attemptDocs) {
    return null;
  }
  return (
    <FlexBox pt={4}>
      {/*<Typography variant="h4" textAlign="center">
        <FormattedMessage
          defaultMessage="Top Plays"
          description="Top challenge attempts"
        />
  </Typography>*/}
      <FlexBox
        flexDirection="row"
        gap={2}
        p={2}
        maxWidth={500}
        flexWrap="nowrap"
        justifyContent={hasLimit ? undefined : 'flex-start'}
        sx={hasLimit ? undefined : noLimitSx}
      >
        {attemptDocs?.length ? (
          <>
            {attemptDocs.map((attempt, index) => (
              <ChallengeTopAttempt
                key={attempt.id}
                placing={index + 1}
                attempt={attempt.data()}
                viewReplay={viewReplay}
              />
            ))}
            {hasLimit &&
              challenge.readOnly?.numAttempts &&
              challenge.readOnly.numAttempts > 3 && (
                <FlexBox sx={attemptSx} onClick={toggleLimit}>
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
      {!userId && (
        <Typography variant="caption" textAlign="center" mt={1} mb={-3}>
          <FormattedMessage
            defaultMessage="Get Infinitris Premium to appear here"
            description="Top challenge attempts"
          />
        </Typography>
      )}
    </FlexBox>
  );
}

const attemptSx: SxProps = {
  cursor: 'pointer',
  boxShadow: boxShadows.small,
  p: 0.5,
  borderRadius: borderRadiuses.base,
};

type ChallengeTopAttemptProps = {
  attempt: IChallengeAttempt;
  placing: number;
} & Pick<ChallengeTopAttemptsProps, 'viewReplay'>;

function ChallengeTopAttempt({
  placing,
  attempt,
  viewReplay,
}: ChallengeTopAttemptProps) {
  const viewReplayForThisAttempt = React.useCallback(
    () => viewReplay(attempt),
    [viewReplay, attempt]
  );
  return (
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
      <FlexBox width={70} justifyContent="flex-start">
        <FlexBox flexDirection="row">
          <SvgIcon color="primary" sx={{ mt: -0.5 }}>
            <StopwatchIcon />
          </SvgIcon>
          <Typography variant="body2">
            {(attempt.stats.timeTakenMs / 1000).toFixed(2)}s
          </Typography>
        </FlexBox>
        {/*<Typography variant="body1">
          {scoreboardEntry?.data()?.nickname}
  </Typography>*/}
      </FlexBox>
    </FlexBox>
  );
}
