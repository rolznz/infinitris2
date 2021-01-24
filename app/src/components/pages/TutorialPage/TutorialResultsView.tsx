import { Box, Typography } from '@material-ui/core';
import { ITutorial, TutorialStatus } from 'infinitris2-models';
import TutorialCompletionStats from 'infinitris2-models/dist/src/TutorialCompletionStats';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import StarRatingComponent from 'react-star-rating-component';
import useUserStore from '../../../state/UserStore';
import ContinueHint from '../../ContinueHint';
import { Gesture } from '../../hooks/useGestureListener';
import useReceivedInput from '../../hooks/useReceivedInput';
import useTrue from '../../hooks/useTrue';
import FlexBox from '../../layout/FlexBox';

interface TutorialResultsViewProps {
  status: TutorialStatus;
  tutorial: ITutorial;
  onContinue(): void;
  onRetry(): void;
}

export default function TutorialResultsView({
  tutorial,
  status,
  onContinue,
  onRetry,
}: TutorialResultsViewProps) {
  const user = useUserStore((userStore) => userStore.user);
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
  const stats = status.stats as TutorialCompletionStats;

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
            defaultMessage="Tutorial Completed"
            description="Tutorial completed heading"
          />
        </Typography>
        <div style={{ fontSize: 96 }}>
          <StarRatingComponent
            name="tutorial-score"
            editing={false}
            starCount={3}
            value={starAnimation}
          />
        </div>
        {/* TODO: extract to a list of statistics, will this work with react-i18n? */}
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage="Time taken: {timeTaken} seconds"
            description="Time taken to complete tutorial"
            values={{
              timeTaken: (stats.timeTaken / 1000).toFixed(2),
            }}
          />
        </Typography>
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage="Blocks placed: {blocksPlaced}"
            description="Number of blocks placed in tutorial"
            values={{
              blocksPlaced: stats.blocksPlaced,
            }}
          />
        </Typography>
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage="Lines cleared: {linesCleared}"
            description="Number of lines cleared in tutorial"
            values={{
              linesCleared: stats.linesCleared,
            }}
          />
        </Typography>
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage="Attempt: #{attemptCount}"
            description="Number of times the user has attempted this tutorial"
            values={{
              attemptCount: user.tutorialAttempts[tutorial.id]?.length,
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
