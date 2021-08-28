import useLoaderStore from '@/state/LoaderStore';
import { appName } from '@/utils/constants';
import isMobile from '@/utils/isMobile';
import { Box, Button, LinearProgress, Typography } from '@material-ui/core';
import React from 'react';
import { prepareSounds } from '../sound/MusicPlayer';
import FlexBox from './FlexBox';

export default function Loader({ children }: React.PropsWithChildren<{}>) {
  const loaderStore = useLoaderStore();
  const isLoaded = loaderStore.isLoaded();
  // TODO: only show start button if music is on

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
          {loaderStore.startClicked || !isMobile() ? (
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
            <Button
              onClick={() => {
                // On mobile, sounds can only be loaded after an interaction
                prepareSounds();
                loaderStore.setStartClicked(true);
              }}
            >
              Start
            </Button>
          )}
        </FlexBox>
      )}
      {children}
    </>
  );
}
