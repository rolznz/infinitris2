import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@material-ui/core';

import { useKeyPress } from 'react-use';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useTapListener from '../hooks/useTapListener';
import useAppStore from '../../state/AppStore';

export default function AllSetPage() {
  const [hasReceivedInput, setHasReceivedInput] = React.useState(false);
  const history = useHistory();
  const [isAnyKeyPressed] = useKeyPress((event) => Boolean(event.key));
  const [hasTapped, TapListener] = useTapListener();
  const appStore = useAppStore();
  const returnToUrl = appStore.returnToUrl;
  const setReturnToUrl = appStore.setReturnToUrl;
  const [hasRedirected, setHasRedirected] = useState(false);
  const destinationUrl = returnToUrl || Routes.home;

  // TODO: move into useReceivedInput
  // TODO: also add delay
  if ((hasTapped || isAnyKeyPressed) && !hasReceivedInput) {
    setHasReceivedInput(true);
  }

  useEffect(() => {
    if (hasReceivedInput && !hasRedirected) {
      setHasRedirected(true);
      setReturnToUrl(undefined);
      history.replace(destinationUrl);
    }
  }, [
    hasReceivedInput,
    history,
    setReturnToUrl,
    hasRedirected,
    destinationUrl,
  ]);

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
          Woohoo! All mandatory tutorials have been completed!
        </Typography>
        {<Typography>You will now be going to {destinationUrl}</Typography>}
        {/* TODO: Play more tutorials button */}
        <Typography>Tap or press any key to continue.</Typography>
      </Box>
    </>
  );
}
