import useLoaderStore from '@/state/LoaderStore';
import { useUserStore } from '@/state/UserStore';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { prepareSounds } from '../sound/MusicPlayer';
import FlexBox from './FlexBox';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import useAppStore from '@/state/AppStore';

const useStyles = makeStyles((theme) => ({
  startButton: {
    backgroundColor: theme.palette.tertiary.main,
    fontSize: 20,
  },
  checkbox: {
    '& span': {
      margin: '-2px',
    },
  },
}));

export default function Loader({ children }: React.PropsWithChildren<{}>) {
  const loaderStore = useLoaderStore();
  const userStore = useUserStore();
  const hasFinished = loaderStore.hasFinished;
  const initializeLoaderStore = loaderStore.initialize;
  const setStartClicked = loaderStore.clickStart;
  const intl = useIntl();
  const [hasToggledSounds, setHasToggledSounds] = useState(false);

  const classes = useStyles();

  const clientLoaded = useAppStore((appStore) => !!appStore.clientApi);

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
  const musicOn =
    userStore.user.musicOn !== undefined ? userStore.user.musicOn : true;
  useEffect(() => {
    if (musicOn === false && !hasToggledSounds) {
      // no interaction needed since sound is muted
      setStartClicked(false);
    }
    setHasToggledSounds(true);
  }, [setStartClicked, musicOn, hasToggledSounds, setHasToggledSounds]);

  useEffect(() => {
    const htmlLoader = document.getElementById('html-loader');
    if (htmlLoader) {
      htmlLoader.style.opacity = hasFinished ? '0' : '1';
    }
  }, [hasFinished]);

  if (!hasToggledSounds) {
    return null;
  }

  return (
    <>
      <FlexBox
        height="100vh"
        width="100vw"
        style={{
          position: 'absolute',
          opacity: hasFinished ? 0 : 1,
          transition: hasFinished ? 'opacity 1s' : '',
          pointerEvents: hasFinished ? 'none' : 'all',
        }}
        bgcolor="background.loader"
        zIndex="loader"
      >
        <FlexBox
          height="50vh"
          width="100vw"
          style={{ position: 'absolute', left: 0, bottom: 0 }}
        >
          <FlexBox
            position="absolute"
            top="20px"
            width="259px"
            alignItems="flex-start"
            style={{
              opacity: loaderStore.stepsCompleted < loaderStore.steps ? 1 : 0,
              transition: 'opacity 1s',
            }}
          >
            <Typography
              variant="body1"
              color="textPrimary"
              style={{ textTransform: 'uppercase' }}
            >
              loading{' '}
              {Math.floor(
                (loaderStore.stepsCompleted * 100) / loaderStore.steps
              )}
              %
            </Typography>
            <Box width="100%">
              <LinearProgress
                key={loaderStore.key}
                color="primary"
                variant="determinate"
                style={{ height: '19px' }}
                value={
                  loaderStore.steps === 0
                    ? 0
                    : (loaderStore.stepsCompleted * 100) / loaderStore.steps
                }
              />
            </Box>
          </FlexBox>

          {!loaderStore.startClicked &&
            loaderStore.hasInitialized &&
            loaderStore.stepsCompleted === loaderStore.steps && (
              <FlexBox position="absolute" top="100px">
                <Button
                  variant="contained"
                  color="primary" // TODO: tertiary
                  className={classes.startButton}
                  onClick={() => {
                    if (musicOn) {
                      loaderStore.reset();
                    }
                    loaderStore.clickStart();
                    if (musicOn) {
                      // On mobile, sounds can only be loaded after an interaction
                      prepareSounds();
                    }
                  }}
                >
                  <FormattedMessage
                    defaultMessage="Start"
                    description="Loader - Start button text"
                  />
                </Button>
                <FormControlLabel
                  control={
                    <Checkbox
                      color={'white' as any}
                      checked={musicOn}
                      onChange={(event) => {
                        userStore.setMusicOn(event.target.checked);
                      }}
                      checkedIcon={<CheckCircleIcon />}
                      icon={<RadioButtonUncheckedIcon />}
                      className={classes.checkbox}
                    />
                  }
                  label={intl.formatMessage({
                    defaultMessage: 'Load Sounds',
                    description: 'Loader - Load Music Sounds checkbox text',
                  })}
                />
              </FlexBox>
            )}
        </FlexBox>
      </FlexBox>
      {children}
    </>
  );
}
