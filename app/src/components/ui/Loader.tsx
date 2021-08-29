import useLoaderStore from '@/state/LoaderStore';
import { useUserStore } from '@/state/UserStore';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { prepareSounds } from '../sound/MusicPlayer';
import FlexBox from './FlexBox';

export default function Loader({ children }: React.PropsWithChildren<{}>) {
  const loaderStore = useLoaderStore();
  const userStore = useUserStore();
  const isLoaded = loaderStore.isLoaded();
  const setStartClicked = loaderStore.setStartClicked;
  const intl = useIntl();
  const [hasToggledSounds, setHasToggledSounds] = useState(false);

  // TODO: only show start button if music is on

  const musicOn = userStore.user.musicOn;
  useEffect(() => {
    if (musicOn === false && !hasToggledSounds) {
      // no interaction needed since sound is muted
      setStartClicked(true);
    }
    setHasToggledSounds(true);
  }, [setStartClicked, musicOn, hasToggledSounds, setHasToggledSounds]);

  return (
    <>
      {!isLoaded && (
        <FlexBox
          height="100%"
          width="100%"
          style={{ position: 'absolute' }}
          bgcolor="background.paper"
          zIndex="loader"
        >
          {loaderStore.startClicked ? (
            <FlexBox width={200}>
              <Typography
                variant="caption"
                color="textPrimary"
                style={{ textTransform: 'uppercase' }}
              >
                loading{' '}
                {Math.floor(
                  (loaderStore.stepsCompleted * 100) / loaderStore.steps
                )}
                %
              </Typography>
              <Box width="15vw" mt={2}>
                <LinearProgress
                  variant="determinate"
                  value={
                    loaderStore.steps === 0
                      ? 0
                      : (loaderStore.stepsCompleted * 100) / loaderStore.steps
                  }
                />
              </Box>
            </FlexBox>
          ) : (
            <FlexBox>
              <Button
                onClick={() => {
                  if (musicOn) {
                    // On mobile, sounds can only be loaded after an interaction
                    prepareSounds();
                  }
                  loaderStore.setStartClicked(true);
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
                    checked={
                      userStore.user.musicOn !== undefined
                        ? userStore.user.musicOn
                        : true
                    }
                    onChange={(event) => {
                      userStore.setMusicOn(event.target.checked);
                    }}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
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
      )}
      {children}
    </>
  );
}
