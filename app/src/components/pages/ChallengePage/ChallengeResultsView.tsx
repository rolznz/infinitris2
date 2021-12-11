import FlexBox from '@/components/ui/FlexBox';
import { borderRadiuses } from '@/theme/theme';
import { Button, Typography } from '@mui/material';
import { ChallengeStatus } from 'infinitris2-models';
import ChallengeCompletionStats from 'infinitris2-models/dist/src/ChallengeCompletionStats';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useUser } from '../../../state/UserStore';
import ChallengeMedalDisplay from './ChallengeMedalDisplay';
import RateChallenge from './RateChallenge';

export interface ChallengeResultsViewProps {
  status: ChallengeStatus;
  challengeId: string;
  isTest: boolean;
  onContinue(): void;
  onRetry(): void;
}

export default function ChallengeResultsView({
  challengeId,
  isTest,
  status,
  onContinue,
  onRetry,
}: ChallengeResultsViewProps) {
  const user = useUser();

  // TODO: add keyboard shortcuts / improve accessibility
  /*const [hasReceivedRetryInput] = useReceivedInput('r', true);
  useTrue(hasReceivedRetryInput, onRetry);
  const [hasReceivedContinueInput] = useReceivedInput(undefined, true);
  useTrue(hasReceivedContinueInput, onContinue);*/

  const stats = status.stats as ChallengeCompletionStats;

  return (
    <FlexBox flex={1} maxWidth="100%" padding={4}>
      <FlexBox
        color="primary.main"
        bgcolor="background.paper"
        padding={4}
        borderRadius={borderRadiuses.base}
      >
        <Typography variant="h6">
          <FormattedMessage
            defaultMessage="Challenge Completed"
            description="Challenge completed heading"
          />
        </Typography>
        <ChallengeMedalDisplay medalIndex={status.medalIndex} />
        {/* TODO: extract to a list of statistics, will this work with react-i18n? */}
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage="Time taken: {timeTakenMs} seconds"
            description="Time taken to complete challenge"
            values={{
              timeTakenMs: (stats.timeTakenMs / 1000).toFixed(2),
            }}
          />
        </Typography>
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage="Blocks placed: {blocksPlaced}"
            description="Number of blocks placed in challenge"
            values={{
              blocksPlaced: stats.blocksPlaced,
            }}
          />
        </Typography>
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage="Lines cleared: {linesCleared}"
            description="Number of lines cleared in challenge"
            values={{
              linesCleared: stats.linesCleared,
            }}
          />
        </Typography>
        {/* TODO: efficiency rating e.g. not leaving gaps */}
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage="Attempt: #{attemptCount}"
            description="Number of times the user has attempted this challenge"
            values={{
              attemptCount: user.challengeAttempts[challengeId]?.length || 1,
            }}
          />
        </Typography>
        <RateChallenge isTest={isTest} challengeId={challengeId} />
        <FlexBox
          pt={2}
          width="100%"
          flexDirection="row"
          justifyContent="space-between"
        >
          <Button variant="contained" color="secondary" onClick={onRetry}>
            <FormattedMessage
              defaultMessage="Retry"
              description="Challenge Results View - Retry button text"
            />
          </Button>
          <Button variant="contained" color="primary" onClick={onContinue}>
            <FormattedMessage
              defaultMessage="Continue"
              description="Challenge Results View - Continue button text"
            />
          </Button>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  );
}
