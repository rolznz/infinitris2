import React from 'react';
import { Box, Link } from '@mui/material';

import { Link as RouterLink } from 'react-router-dom';
import { useIntl } from 'react-intl';

import { useUserStore } from '../../../state/UserStore';

import logoImage from './assets/logo.png';

import FlexBox from '@/components/ui/FlexBox';
import useWindowSize from 'react-use/lib/useWindowSize';
import useLoaderStore from '@/state/LoaderStore';
import { zIndexes } from '@/theme/theme';
import { Helmet } from 'react-helmet';
import { appName } from '@/utils/constants';
import { PlayButton } from './PlayButton';
import { firstTimeAnimationDelaySeconds } from './homePageConstants';

//const isFirstTimeAnimation = true;

const _HomePage = () => {
  //const userStore = useUserStore();
  //const isLoggedIn = useAuthStore((authStore) => !!authStore.user);
  //const homeStore = useHomeStore();
  //const { data: rooms } = useCollection<IRoom>(roomsPath);
  // TODO: move to music player
  //const selectedRoom = homeStore.selectedRoom || rooms?.[0];
  //const isLoading = !selectedRoom;
  /*const {
    incompleteChallenges,
    isLoadingOfficialChallenges,
  } = useIncompleteChallenges();*/

  const windowSize = useWindowSize();
  const isLandscape = windowSize.width >= windowSize.height;
  const isLoaded = useLoaderStore((loaderStore) => loaderStore.hasFinished);

  /*const shortLandscapeScreen =
    useMediaQuery('(max-height:400px)') && isLandscape;*/

  const intl = useIntl();

  return (
    <FlexBox height="100%" zIndex={zIndexes.above}>
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
            transition: `opacity 2s ${firstTimeAnimationDelaySeconds}s`,
          }}
        />
      </Box>
      <Box mt={4} />
      <FlexBox /*flexDirection={shortLandscapeScreen ? 'row' : 'column'}*/>
        {/*<Box
          mt={shortLandscapeScreen ? 0 : 4}
          ml={shortLandscapeScreen ? 4 : 0}
        />*/}
        <Box display="flex" justifyContent="center">
          <Link
            component={RouterLink}
            underline="none"
            to={/*`${Routes.rooms}/${selectedRoom?.id}`*/ '/'}
            style={
              /*isLoading
                  ? {
                      pointerEvents: 'none',
                    }
                  : */ {}
            }
          >
            <PlayButton isLoaded={isLoaded} />
          </Link>
        </Box>
      </FlexBox>
      <Box mt={8} />
    </FlexBox>
  );
};

export const HomePage = React.memo(_HomePage);
