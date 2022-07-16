import FlexBox from '@/components/ui/FlexBox';
import Typography from '@mui/material/Typography';
import { where } from 'firebase/firestore';
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

type ChallengeTopAttemptsProps = {
  challengeId: string;
};

export function ChallengeTopAttempts({
  challengeId,
}: ChallengeTopAttemptsProps) {
  const useCollectionOptions: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('challengeId', '==', challengeId),
        //orderBy('stats.timeTakenMs', 'desc'),
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
              <ChallengeTopAttempt key={attempt.id} attempt={attempt.data()} />
            ))
          : 'Noone has completed this challenge yet'}
      </FlexBox>
    </FlexBox>
  );
}

function ChallengeTopAttempt({ attempt }: { attempt: IChallengeAttempt }) {
  // FIXME: this is very inefficient. Challenges should be updated to include creator nickname
  const { data: challengeOwnerScoreboardEntry } = useDocument<IScoreboardEntry>(
    getScoreboardEntryPath(attempt.userId)
  );
  return (
    <FlexBox flexDirection="row" gap={1} bgcolor="background.paper">
      <Typography variant="body1">
        {challengeOwnerScoreboardEntry?.data()?.nickname}
      </Typography>
      <Typography variant="body2">
        {(attempt.stats.timeTakenMs / 1000).toFixed(2)}s
      </Typography>
    </FlexBox>
  );
}
