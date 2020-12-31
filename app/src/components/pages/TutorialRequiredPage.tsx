import React, { useEffect } from 'react';
import { Typography } from '@material-ui/core';

import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useIncompleteTutorials from '../hooks/useIncompleteTutorials';
import useReceivedInput from '../hooks/useReceivedInput';
import Lottie from 'lottie-react';
import planeAnimation from '../lottie/plane.json';
import ContinueHint from '../ContinueHint';
import FlexBox from '../layout/FlexBox';
import { FormattedMessage } from 'react-intl';
import useDemo from '../hooks/useDemo';

export default function TutorialRequiredPage() {
  useDemo();
  const [hasReceivedInput] = useReceivedInput();
  const history = useHistory();
  const incompleteTutorials = useIncompleteTutorials();

  useEffect(() => {
    if (!incompleteTutorials.length) {
      history.replace(Routes.home);
    }

    if (hasReceivedInput) {
      const highestPriorityTutorial = incompleteTutorials.sort(
        (a, b) => (b.priority || 0) - (a.priority || 0)
      )[0];
      history.replace(`${Routes.tutorials}/${highestPriorityTutorial.id}`);
    }
  }, [hasReceivedInput, history, incompleteTutorials]);

  // TODO: "1 tutorial needs to be completed" makes the game feel like work.
  // Wording needs to be improved to incentivize the tutorials as not only being required to teach the user,
  // but a fun way to do so.
  // TODO: game level map?
  return (
    <>
      <FlexBox flex={1}>
        <Typography>
          <FormattedMessage
            defaultMessage="{count} incomplete {count, plural, one {tutorial} other {tutorials}} to be completed"
            description="Incompleted tutorials"
            values={{
              count: incompleteTutorials.length,
            }}
          />
        </Typography>
        <Lottie animationData={planeAnimation} />
        <ContinueHint />
      </FlexBox>
    </>
  );
}
