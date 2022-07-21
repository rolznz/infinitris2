import FlexBox from '@/components/ui/FlexBox';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import Typography from '@mui/material/Typography';
import { limit, orderBy, where } from 'firebase/firestore';
import {
  challengeAttemptsPath,
  getScoreboardEntryPath,
  IChallengeAttempt,
  IScoreboardEntry,
} from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  useCollection,
  UseCollectionOptions,
  useDocument,
} from 'swr-firestore';
import { ReactComponent as StopwatchIcon } from '@/icons/stopwatch.svg';
import useAuthStore from '@/state/AuthStore';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import { SxProps } from '@mui/material';
import { borderRadiuses, boxShadows } from '@/theme/theme';
import { PlacingStar } from '@/components/pages/Characters/PlacingStar';

type ChallengeTopAttemptsProps = {
  challengeId: string;
  viewReplay(
    attempt: IChallengeAttempt,
    scoreboardEntry: IScoreboardEntry | undefined
  ): void;
};

export function ChallengeTopAttempts({
  challengeId,
  viewReplay,
}: ChallengeTopAttemptsProps) {
  const userId = useAuthStore((store) => store.user?.uid);
  const useCollectionOptions: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('challengeId', '==', challengeId),
        orderBy('stats.timeTakenMs', 'asc'),
        limit(5),
      ],
    }),
    [challengeId]
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
      <Typography variant="h4" textAlign="center">
        <FormattedMessage
          defaultMessage="Top Plays"
          description="Top challenge attempts"
        />
      </Typography>
      {!userId && (
        <Typography variant="caption" textAlign="center">
          <FormattedMessage
            defaultMessage="Get Infinitris Premium to appear here"
            description="Top challenge attempts"
          />
        </Typography>
      )}
      <FlexBox gap={1}>
        {attemptDocs?.length ? (
          attemptDocs.map((attempt, index) => (
            <ChallengeTopAttempt
              key={attempt.id}
              placing={index + 1}
              attempt={attempt.data()}
              viewReplay={viewReplay}
            />
          ))
        ) : (
          <Typography variant="body2" textAlign="center">
            <FormattedMessage
              defaultMessage="Noone has completed this challenge yet :-("
              description="Top Plays - no completions"
            />
          </Typography>
        )}
      </FlexBox>
    </FlexBox>
  );
}

const attemptSx: SxProps = {
  cursor: 'pointer',
  boxShadow: boxShadows.small,
  pl: 1,
  pr: 2,
  py: 0,
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
  // FIXME: this is very inefficient. Challenges should be updated to include creator nickname
  const { data: scoreboardEntry } = useDocument<IScoreboardEntry>(
    getScoreboardEntryPath(attempt.userId)
  );
  const viewReplayForThisAttempt = React.useCallback(
    () => viewReplay(attempt, scoreboardEntry?.data()),
    [viewReplay, attempt, scoreboardEntry]
  );
  return (
    <FlexBox
      flexDirection="row"
      gap={1}
      onClick={viewReplayForThisAttempt}
      sx={attemptSx}
    >
      <FlexBox
        flexDirection="row"
        position="relative"
        width={150}
        justifyContent="flex-start"
      >
        <CharacterImage
          characterId={scoreboardEntry?.data()?.characterId || '0'}
          width={64}
        />
        <PlacingStar placing={placing} offset={12} scale={0.5} />
        <Typography variant="body1">
          {scoreboardEntry?.data()?.nickname}
        </Typography>
      </FlexBox>
      <FlexBox flexDirection="row" width={70}>
        <SvgIcon color="primary" sx={{ mt: -0.5 }}>
          <StopwatchIcon />
        </SvgIcon>
        <Typography variant="body2">
          {(attempt.stats.timeTakenMs / 1000).toFixed(2)}s
        </Typography>
      </FlexBox>
    </FlexBox>
  );
}
