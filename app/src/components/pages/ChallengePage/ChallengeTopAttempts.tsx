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

type ChallengeTopAttemptsProps = {
  challengeId: string;
  viewReplay(attempt: IChallengeAttempt): void;
};

export function ChallengeTopAttempts({
  challengeId,
  viewReplay,
}: ChallengeTopAttemptsProps) {
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
  if (!attemptDocs?.length) {
    return null;
  }
  return (
    <FlexBox pt={2}>
      <Typography variant="h2" textAlign="center">
        <FormattedMessage
          defaultMessage="Top Plays"
          description="Top challenge attempts"
        />
      </Typography>
      <FlexBox pt={2}>
        {attemptDocs
          ? attemptDocs.map((attempt) => (
              <ChallengeTopAttempt
                key={attempt.id}
                attempt={attempt.data()}
                viewReplay={viewReplay}
              />
            ))
          : 'Noone has completed this challenge yet'}
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
  const { data: challengeOwnerScoreboardEntry } = useDocument<IScoreboardEntry>(
    getScoreboardEntryPath(attempt.userId)
  );
  const viewReplayForThisAttempt = React.useCallback(
    () => viewReplay(attempt),
    [viewReplay, attempt]
  );
  return (
    <FlexBox flexDirection="row" gap={1} bgcolor="background.paper">
      <Typography variant="body1">
        {challengeOwnerScoreboardEntry?.data()?.nickname}
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
