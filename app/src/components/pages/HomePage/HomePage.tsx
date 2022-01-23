import React from 'react';
import { Box, Typography } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import logoImage from './assets/logo.png';

import FlexBox from '@/components/ui/FlexBox';
import useWindowSize from 'react-use/lib/useWindowSize';
import useLoaderStore from '@/state/LoaderStore';
import { Helmet } from 'react-helmet';
import { appName } from '@/utils/constants';
import { PlayButton } from './PlayButton';
import { firstTimeAnimationDelaySeconds } from './homePageConstants';
import { GameModePicker } from '@/components/ui/GameModePicker/GameModePicker';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { borderColorLight, borderRadiuses, boxShadows } from '@/theme/theme';
import isMobile from '@/utils/isMobile';

//const isFirstTimeAnimation = true;

const _HomePage = () => {
  const windowSize = useWindowSize();
  const isLandscape = windowSize.width >= windowSize.height;
  const showPWARecommendation =
    isMobile() && !window.matchMedia('(display-mode: standalone)').matches;
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
        {showPWARecommendation && (
          <a
            href="https://www.howtogeek.com/196087/how-to-add-websites-to-the-home-screen-on-any-smartphone-or-tablet/"
            target="_blank"
            rel="noreferrer"
          >
            <FlexBox
              position="absolute"
              top="70vh"
              left="0"
              width="100vw"
              zIndex={1}
            >
              <FlexBox
                boxShadow={boxShadows.small}
                borderRadius={borderRadiuses.base}
                py={1}
                px={2}
                sx={{
                  backgroundColor: borderColorLight,
                }}
                flexDirection="row"
                gap={2}
              >
                <FlexBox justifyContent="flex-start" alignItems="flex-start">
                  <Typography>
                    <FormattedMessage
                      defaultMessage="play {appName} in <b>full screen</b>"
                      description="Home page PWA fullscreen recommendation - play in full screen"
                      values={{
                        appName,
                        b: (...chunks: React.ReactNode[]) => (
                          <span
                            style={{ color: '#ccccff', fontWeight: 'bold' }}
                          >
                            {chunks}
                          </span>
                        ),
                      }}
                    />
                  </Typography>
                  <Typography>
                    <FormattedMessage
                      defaultMessage="Add to your home screen"
                      description="Home page PWA fullscreen recommendation - add to homescreen"
                      values={{ appName }}
                    />
                  </Typography>
                </FlexBox>
                <AddBoxIcon color="primary" />
              </FlexBox>
            </FlexBox>
          </a>
        )}
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
