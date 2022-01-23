import React from 'react';
import { Box } from '@mui/material';

import { useIntl } from 'react-intl';

import logoImage from './assets/logo.png';

import FlexBox from '@/components/ui/FlexBox';
import useWindowSize from 'react-use/lib/useWindowSize';
import useLoaderStore from '@/state/LoaderStore';
import { Helmet } from 'react-helmet';
import { appName } from '@/utils/constants';
import { PlayButton } from './PlayButton';
import { firstTimeAnimationDelaySeconds } from './homePageConstants';
import { GameModePicker } from '@/components/ui/GameModePicker/GameModePicker';

//const isFirstTimeAnimation = true;

const _HomePage = () => {
  const windowSize = useWindowSize();
  const isLandscape = windowSize.width >= windowSize.height;
  const [isLoaded, delayButtonVisibility] = useLoaderStore((store) => [
    store.hasFinished,
    store.delayButtonVisibility,
  ]);

  return (
    <>
      <FlexBox height="100vh" width="100vw">
        <Helmet>
          <title>{appName}</title>
        </Helmet>
        {!isLandscape && <Box mt="10vh" />}
        <Box height={isLandscape ? '30vh' : '20vh'}>
          <img
            src={logoImage}
            alt="Logo"
            style={{
              width: 'auto',
              height: '100%',
              opacity: isLoaded ? 1 : 0,
              transition: delayButtonVisibility
                ? `opacity 2s ${firstTimeAnimationDelaySeconds}s`
                : undefined,
            }}
          />
        </Box>
        <Box mt={4} />
        <FlexBox>
          <PlayButton
            isLoaded={isLoaded}
            delayButtonVisibility={delayButtonVisibility}
          />
        </FlexBox>
        <Box mt={8} />
      </FlexBox>
      <GameModePicker display="none" />
    </>
  );
};

export const HomePage = React.memo(_HomePage);
