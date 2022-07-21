import FlexBox from '@/components/ui/FlexBox';
import IconButton from '@mui/material/IconButton';
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
import { ReactComponent as PlayIcon } from '@/icons/play.svg';
import useAuthStore from '@/state/AuthStore';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';

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
  return (
    <FlexBox pt={4}>
      <Typography variant="h2" textAlign="center">
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
      <FlexBox pt={2}>
        {attemptDocs?.length ? (
          attemptDocs.map((attempt) => (
            <ChallengeTopAttempt
              key={attempt.id}
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

type ChallengeTopAttemptProps = {
  attempt: IChallengeAttempt;
} & Pick<ChallengeTopAttemptsProps, 'viewReplay'>;

function ChallengeTopAttempt({
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
    <FlexBox flexDirection="row" gap={1} bgcolor="background.paper">
      <CharacterImage
        characterId={scoreboardEntry?.data()?.characterId || '0'}
        width={32}
      />
      <Typography variant="body1">
        {scoreboardEntry?.data()?.nickname}
      </Typography>
      <Typography variant="body2">
        {(attempt.stats.timeTakenMs / 1000).toFixed(2)}s
      </Typography>
      <IconButton onClick={viewReplayForThisAttempt}>
        <SvgIcon color="primary">
          <PlayIcon />
        </SvgIcon>
      </IconButton>
    </FlexBox>
  );
}
