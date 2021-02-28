import { Box, Typography } from '@material-ui/core';
import { IChallenge, ChallengeStatus } from 'infinitris2-models';
import ChallengeCompletionStats from 'infinitris2-models/dist/src/ChallengeCompletionStats';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import StarRatingComponent from 'react-star-rating-component';
import { useUser } from '../../../state/UserStore';
import ContinueHint from '../../ContinueHint';
import { Gesture } from '../../hooks/useGestureListener';
import useReceivedInput from '../../hooks/useReceivedInput';
import useTrue from '../../hooks/useTrue';
import FlexBox from '../../layout/FlexBox';

interface ChallengeResultsViewProps {
  status: ChallengeStatus;
  challenge: IChallenge;
  onContinue(): void;
  onRetry(): void;
}

export default function ChallengeResultsView({
  challenge,
  status,
  onContinue,
  onRetry,
}: ChallengeResultsViewProps) {
  const user = useUser();
  const [starAnimation, setStarAnimation] = useState(0);
  useEffect(() => {
    if (starAnimation < status.stars) {
      setTimeout(() => {
        setStarAnimation((oldStarAnimation) => oldStarAnimation + 1);
      }, 500);
    }
  }, [starAnimation, status.stars]);

  const [hasReceivedRetryInput] = useReceivedInput('r', Gesture.LongPress);
  useTrue(hasReceivedRetryInput, onRetry);
  // TODO:
  /*const [hasReceivedFeedbackInput] = useReceivedInput(
    'F',
    Gesture.LongPress,
  );*/

  const [hasReceivedContinueInput] = useReceivedInput();
  useTrue(hasReceivedContinueInput, onContinue);
  const stats = status.stats as ChallengeCompletionStats;

  return (
    <FlexBox flex={1} maxWidth="100%" padding={4}>
      <FlexBox
        color="primary.main"
        bgcolor="background.paper"
        padding={4}
        borderRadius={16}
      >
        <Typography variant="h6">
          <FormattedMessage
            defaultMessage="Challenge Completed"
            description="Challenge completed heading"
          />
        </Typography>
        <div style={{ fontSize: 96 }}>
          <StarRatingComponent
            name="challenge-score"
            editing={false}
            starCount={3}
            value={starAnimation}
          />
        </div>
        {/* TODO: extract to a list of statistics, will this work with react-i18n? */}
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage="Time taken: {timeTaken} seconds"
            description="Time taken to complete challenge"
            values={{
              timeTaken: (stats.timeTaken / 1000).toFixed(2),
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
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage="Attempt: #{attemptCount}"
            description="Number of times the user has attempted this challenge"
            values={{
              attemptCount: user.challengeAttempts[challenge.id]?.length,
            }}
          />
        </Typography>
        <Box pt={2}>
          <ContinueHint showContextMenu />
        </Box>
      </FlexBox>
    </FlexBox>
  );
}
