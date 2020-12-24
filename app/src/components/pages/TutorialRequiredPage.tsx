import React, { useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';

import { useKeyPress } from 'react-use';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useTapListener from '../hooks/useTapListener';
import useIncompleteTutorials from '../hooks/useIncompleteTutorials';

export default function TutorialRequiredPage() {
  const [hasReceivedInput, setHasReceivedInput] = React.useState(false);
  const history = useHistory();
  const [isAnyKeyPressed] = useKeyPress((event) => Boolean(event.key));
  const [hasTapped, TapListener] = useTapListener();
  const incompleteTutorials = useIncompleteTutorials();

  if ((hasTapped || isAnyKeyPressed) && !hasReceivedInput) {
    setHasReceivedInput(true);
  }

  useEffect(() => {
    if (hasReceivedInput) {
      const highestPriorityTutorial = incompleteTutorials.sort(
        (a, b) => (b.priority || 0) - (a.priority || 0)
      )[0];
      history.replace(`${Routes.tutorials}/${highestPriorityTutorial.id}`);
    }
  }, [hasReceivedInput, history, incompleteTutorials]);

  return (
    <>
      <TapListener />
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Typography>
          {incompleteTutorials.length} Tutorials need to be completed.
        </Typography>
        <Typography>Tap or press any key to continue.</Typography>
      </Box>
    </>
  );
}
