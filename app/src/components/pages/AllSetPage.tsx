import React, { useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';

import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useAppStore from '../../state/AppStore';
import Lottie from 'lottie-react';
import rocketAnimation from '../lottie/rocket.json';
import FlexBox from '../ui/FlexBox';
import { FormattedMessage } from 'react-intl';
import { useUserStore } from '@/state/UserStore';
import useContinueButton from '../hooks/useContinueButton';

export default function AllSetPage() {
  const [hasReceivedInput, continueButton] = useContinueButton();
  const history = useHistory();
  const appStore = useAppStore();
  const returnToUrl = appStore.returnToUrl;
  const setReturnToUrl = appStore.setReturnToUrl;
  const [hasRedirected, setHasRedirected] = useState(false);
  const destinationUrl = returnToUrl || Routes.home;
  const markHasSeenAllSet = useUserStore((store) => store.markHasSeenAllSet);

  useEffect(() => {
    if (hasReceivedInput && !hasRedirected) {
      markHasSeenAllSet();
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
    markHasSeenAllSet,
  ]);

  return (
    <>
      <FlexBox flex={1}>
        <Typography align="center">
          <FormattedMessage
            defaultMessage="Woohoo! All required challenges have been completed!"
            description="All required challenges have been completed"
          />
        </Typography>
        {/*TODO: show destination name (need to retrieve room from URL) destinationUrl !== Routes.home && (
          <Typography>You will now be going to </Typography>
        )*/}

        <Lottie animationData={rocketAnimation} loop={false} />

        {continueButton}

        {/*TODO: <Typography>
          You can play more challenges at any time from the main menu.
        </Typography>*/}
      </FlexBox>
    </>
  );
}
