import React, { useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';

import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useAppStore from '../../state/AppStore';
import useReceivedInput from '../hooks/useReceivedInput';
import Lottie from 'lottie-react';
import rocketAnimation from '../lottie/rocket.json';
import FlexBox from '../layout/FlexBox';
import ContinueHint from '../ContinueHint';
import { FormattedMessage } from 'react-intl';
import useDemo from '../hooks/useDemo';

export default function AllSetPage() {
  useDemo();
  const [hasReceivedInput] = useReceivedInput();
  const history = useHistory();
  const appStore = useAppStore();
  const returnToUrl = appStore.returnToUrl;
  const setReturnToUrl = appStore.setReturnToUrl;
  const [hasRedirected, setHasRedirected] = useState(false);
  const destinationUrl = returnToUrl || Routes.home;

  useEffect(() => {
    if (hasReceivedInput && !hasRedirected) {
      setHasRedirected(true);
      setReturnToUrl(undefined);
      history.push(destinationUrl);
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
      <FlexBox flex={1}>
        <Typography align="center">
          <FormattedMessage
            defaultMessage="Woohoo! All required tutorials have been completed!"
            description="All required tutorials have been completed"
          />
        </Typography>
        {/*TODO: show destination name (need to retrieve room from URL) destinationUrl !== Routes.home && (
          <Typography>You will now be going to </Typography>
        )*/}

        <Lottie animationData={rocketAnimation} loop={false} />

        <ContinueHint />

        {/*TODO: <Typography>
          You can play more tutorials at any time from the main menu.
        </Typography>*/}
      </FlexBox>
    </>
  );
}
