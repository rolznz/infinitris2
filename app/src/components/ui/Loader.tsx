import useLoaderStore from '@/state/LoaderStore';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Typography,
} from '@mui/material';

import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  playMenuTheme,
  playSound,
  setMusicOn,
  setMusicVolume,
  setSfxOn,
  setSfxVolume,
  SoundKey,
} from '../../sound/SoundManager';
import FlexBox from './FlexBox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import useAppStore from '@/state/AppStore';
import { LanguagePicker } from '../pages/SettingsPage/SettingsPage';
import { borderColor, borderRadiuses } from '@/theme/theme';
import isMobile from '@/utils/isMobile';
import { useUser } from '@/components/hooks/useUser';
import { setUserMusicOn, setUserSfxOn } from '@/state/updateUser';
import useAuthStore from '@/state/AuthStore';
import usePrevious from 'react-use/lib/usePrevious';
import shallow from 'zustand/shallow';

export default function Loader({ children }: React.PropsWithChildren<{}>) {
  const loaderStore = useLoaderStore();
  const [isLoggedIn, authUserId] = useAuthStore(
    (store) => [store.isLoggedIn, store.user?.uid],
    shallow
  );
  const prevIsLoggedIn = usePrevious(isLoggedIn);
  const user = useUser();
  const userExists = !!user?.id;
  const hasFinished = loaderStore.hasFinished;
  const initializeLoaderStore = loaderStore.initialize;
  const increaseSteps = loaderStore.increaseSteps;
  const increaseStepsCompleted = loaderStore.increaseStepsCompleted;
  const clickStart = loaderStore.clickStart;
  const [hasToggledSounds, setHasToggledSounds] = useState(false);

  const clientLoaded = useAppStore((appStore) => !!appStore.clientApi);

  // Wait for the user to load if they are logged in
  // this also ensures if the app thinks they were logged in but aren't anymore (for whatever reason), the step will be reversed
  useEffect(() => {
    if (!authUserId) {
      if (isLoggedIn && prevIsLoggedIn !== undefined) {
        increaseSteps();
      } else if (prevIsLoggedIn) {
        increaseSteps(-1);
      }
    }
  }, [isLoggedIn, prevIsLoggedIn, increaseSteps, authUserId]);

  useEffect(() => {
    if (userExists) {
      increaseStepsCompleted();
    }
  }, [userExists, increaseStepsCompleted]);

  useEffect(() => {
    const htmlLoaderSpiner = document.getElementById('html-loader-spinner');
    if (htmlLoaderSpiner) {
      htmlLoaderSpiner.style.display = 'none';
    }
  }, []);

  useEffect(() => {
    if (clientLoaded) {
      initializeLoaderStore();
    }
  }, [initializeLoaderStore, clientLoaded]);

  // only show start button if music is on
  const musicOn = user.musicOn !== undefined ? user.musicOn : true;
  const sfxOn = user.sfxOn !== undefined ? user.sfxOn : true;
  useEffect(() => {
    if (loaderStore.stepsCompleted === loaderStore.steps) {
      if (musicOn === false && sfxOn === false && !hasToggledSounds) {
        // no interaction needed since sound is muted
        clickStart(false);
      } else {
        setMusicVolume(user.musicVolume ?? 1);
        setSfxVolume(user.sfxVolume ?? 1);
      }
      setHasToggledSounds(true);
    }
  }, [
    hasFinished,
    clickStart,
    musicOn,
    sfxOn,
    hasToggledSounds,
    setHasToggledSounds,
    loaderStore.stepsCompleted,
    loaderStore.steps,
    user.musicVolume,
    user.sfxVolume,
  ]);

  useEffect(() => {
    const htmlLoader = document.getElementById('html-loader');
    if (htmlLoader) {
      htmlLoader.style.opacity = hasFinished ? '0' : '1';
    }
  }, [hasFinished]);

  const showSettings =
    !loaderStore.startClicked &&
    loaderStore.hasInitialized &&
    hasToggledSounds &&
    loaderStore.stepsCompleted === loaderStore.steps;

  const loaderStyle: React.CSSProperties = React.useMemo(
    () => ({
      opacity: hasFinished ? 0 : 1,
      transition: hasFinished ? 'opacity 1s' : '',
      pointerEvents: hasFinished ? 'none' : 'all',
    }),
    [hasFinished]
  );

  return (
    <>
      <FlexBox
        height="100%"
        width="100%"
        style={loaderStyle}
        position="fixed"
        top={0}
        left={0}
        bgcolor="background.loader"
        zIndex="loader"
      >
        {showSettings && (
          <Box padding={2} height={100} position="absolute" top={0} right={0}>
            <LanguagePicker />
          </Box>
        )}
        <FlexBox
          height="50%"
          width="100vw"
          justifyContent="flex-start"
          position="fixed"
          left={0}
          bottom={0}
        >
          <LoaderProgress />

          {showSettings && (
            <LoaderStartSettings sfxOn={sfxOn} musicOn={musicOn} />
          )}
        </FlexBox>
      </FlexBox>
      {children}
    </>
  );
}

const LoaderProgress = React.memo(
  () => {
    const [stepsCompleted, steps, key] = useLoaderStore(
      (store) => [store.stepsCompleted, store.steps, store.key],
      shallow
    );
    return (
      <FlexBox
        width="259px"
        style={{
          opacity: stepsCompleted < steps ? 1 : 0,
          transition: 'opacity 1s',
          marginTop: '50px',
        }}
        alignItems="flex-start"
      >
        <Typography
          variant="body1"
          color="textPrimary"
          style={{ textTransform: 'uppercase' }}
        >
          loading {Math.floor((stepsCompleted * 100) / steps)}%
        </Typography>
        <Box width="100%">
          <LinearProgress
            key={key}
            color="primary"
            variant="determinate"
            style={{ height: '19px' }}
            value={steps === 0 ? 0 : (stepsCompleted * 100) / steps}
          />
        </Box>
      </FlexBox>
    );
  },
  () => true
);

type LoaderStartSettingsProps = {
  musicOn: boolean;
  sfxOn: boolean;
};

const LoaderStartSettings = React.memo(
  ({ musicOn, sfxOn }: LoaderStartSettingsProps) => {
    const [reset, clickStart] = useLoaderStore(
      (store) => [store.reset, store.clickStart],
      shallow
    );
    const intl = useIntl();
    return (
      <FlexBox position="absolute" top="100px">
        <Button
          variant="contained"
          autoFocus
          color="primary" // TODO: tertiary
          sx={{
            backgroundColor: '#A4DAF2CC',
            fontSize: 32,
            '&:hover': {
              backgroundColor: '#A4DAF2AA',
            },
            lineHeight: 1.5,
          }}
          onClick={() => {
            if (musicOn || sfxOn) {
              reset();
            }
            clickStart(musicOn);
            // On mobile, sounds can only be loaded after an interaction
            if (sfxOn) {
              setSfxOn(true);
            }
            if (musicOn) {
              setMusicOn(true);
            }
            playSound(SoundKey.silence);
            playMenuTheme();
          }}
        >
          <FormattedMessage
            defaultMessage="Start"
            description="Loader - Start button text"
          />
        </Button>
        <FlexBox
          flexDirection="row"
          mt={2}
          sx={{
            background: borderColor,
            transform: 'scale(0.75)',
          }}
          borderRadius={borderRadiuses.base}
          pl={2.5}
          py={0.5}
        >
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={musicOn}
                onChange={(event) => {
                  setUserMusicOn(event.target.checked);
                }}
                checkedIcon={<CheckCircleIcon />}
                icon={<RadioButtonUncheckedIcon />}
              />
            }
            label={intl.formatMessage({
              defaultMessage: 'Music',
              description: 'Loader - Load Music Sounds checkbox text',
            })}
          />
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={sfxOn}
                onChange={(event) => {
                  setUserSfxOn(event.target.checked);
                  setSfxOn(event.target.checked);
                }}
                checkedIcon={<CheckCircleIcon />}
                icon={<RadioButtonUncheckedIcon />}
              />
            }
            label={intl.formatMessage({
              defaultMessage: 'SFX',
              description: 'Loader - Load Music Sounds checkbox text',
            })}
          />
        </FlexBox>

        {sfxOn && isMobile() && (
          <Typography variant="caption" mt={1}>
            <FormattedMessage
              defaultMessage="Silent mode must be off to enable sounds"
              description="Loader - ringer switch warning"
            />
          </Typography>
        )}
      </FlexBox>
    );
  },
  (prevProps, nextProps) =>
    nextProps.musicOn === prevProps.musicOn &&
    nextProps.sfxOn === prevProps.sfxOn
);
