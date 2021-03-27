import React, { useEffect } from 'react';
import { Typography } from '@material-ui/core';

import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useIncompleteChallenges from '../hooks/useIncompleteChallenges';
import useReceivedInput from '../hooks/useReceivedInput';
import Lottie from 'lottie-react';
import planeAnimation from '../lottie/plane.json';
import ContinueHint from '../ContinueHint';
import FlexBox from '../layout/FlexBox';
import { FormattedMessage } from 'react-intl';

export default function ChallengeRequiredPage() {
  const [hasReceivedInput] = useReceivedInput();
  const history = useHistory();
  const { incompleteChallenges } = useIncompleteChallenges();

  useEffect(() => {
    if (!incompleteChallenges.length) {
      history.push(Routes.home);
    }

    if (hasReceivedInput) {
      const highestPriorityChallenge = incompleteChallenges.sort(
        (a, b) => (b.priority || 0) - (a.priority || 0)
      )[0];
      history.push(`${Routes.challenges}/${highestPriorityChallenge.id}`);
    }
  }, [hasReceivedInput, history, incompleteChallenges]);

  // TODO: "1 challenge needs to be completed" makes the game feel like work.
  // Wording needs to be improved to incentivize the challenges as not only being required to teach the user,
  // but a fun way to do so.
  // TODO: game level map?
  return (
    <>
      <FlexBox flex={1}>
        <Typography>
          <FormattedMessage
            defaultMessage="{count} incomplete {count, plural, one {challenge} other {challenges}} to be completed"
            description="Incompleted challenges"
            values={{
              count: incompleteChallenges.length,
            }}
          />
        </Typography>
        <Lottie animationData={planeAnimation} />
        <ContinueHint />
      </FlexBox>
    </>
  );
}
