import React from 'react';
import Box from '@mui/material/Box';

import logoImage from './assets/logo.png';

import FlexBox from '@/components/ui/FlexBox';
import useWindowSize from 'react-use/lib/useWindowSize';
import useLoaderStore from '@/state/LoaderStore';
import { Helmet } from 'react-helmet';
import { appName } from '@/utils/constants';
import { PlayButton } from './PlayButton';
import { firstTimeAnimationDelaySeconds } from './homePageConstants';
import { PlayTypePicker } from '@/components/ui/GameModePicker/PlayTypePicker';
import shallow from 'zustand/shallow';

import { playTypePickerId } from '@/components/ui/GameModePicker/PlayTypePicker';
import { requiresPwa } from '@/utils/isMobile';
import { useHistory } from 'react-router-dom';
import Routes from '@/models/Routes';
import { useUser } from '@/components/hooks/useUser';
import useIncompleteChallenges from '@/components/hooks/useIncompleteChallenges';
import { launchFullscreen } from '@/utils/launchFullscreen';

function scrollPlayTypePickerIntoView() {
  const gameModePicker = document.getElementById(playTypePickerId);
  if (!gameModePicker) {
    return;
  }
  gameModePicker.style.display = 'flex';
  gameModePicker.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'start',
  });
}

const _HomePage = () => {
  const windowSize = useWindowSize();
  const isLandscape = windowSize.width >= windowSize.height;
  const [loaderHasFinished, delayButtonVisibility] = useLoaderStore(
    (store) => [store.hasFinished, store.delayButtonVisibility],
    shallow
  );
  const history = useHistory();
  const user = useUser();
  // TODO: only get when playTypePicker feature is locked
  // TODO: only retrieve grass world challenges
  const forceIntroWorld =
    (user.unlockedFeatures || []).indexOf('playTypePicker') < 0;

  const { incompleteChallenges } = useIncompleteChallenges(
    forceIntroWorld ? 'grass' : undefined
  );
  const isLoaded = Boolean(
    loaderHasFinished && (!forceIntroWorld || incompleteChallenges?.length)
  );

  React.useEffect(() => {
    if (!forceIntroWorld) {
      useLoaderStore.getState().disableDelayButtonVisiblity();
    }
  }, [forceIntroWorld]);

  const handlePlayClick = React.useCallback(() => {
    useLoaderStore.getState().disableDelayButtonVisiblity();
    if (requiresPwa()) {
      history.push(Routes.pwa);
    } else if (forceIntroWorld) {
      launchFullscreen();
      history.push(`${Routes.challenges}/${incompleteChallenges[0].id}`);
    } else {
      scrollPlayTypePickerIntoView();
    }
  }, [history, forceIntroWorld, incompleteChallenges]);

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
          {isLoaded && (
            <PlayButton
              delayButtonVisibility={delayButtonVisibility}
              onClick={handlePlayClick}
            />
          )}
        </FlexBox>
        <Box mt={8} />
      </FlexBox>
      <PlayTypePicker display="none" />
    </>
  );
};

export const HomePage = React.memo(_HomePage);
