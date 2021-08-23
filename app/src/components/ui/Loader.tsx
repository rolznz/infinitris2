import useLoaderStore from '@/state/LoaderStore';
import { appName } from '@/utils/constants';
import { Box, LinearProgress, Typography } from '@material-ui/core';
import React from 'react';
import FlexBox from './FlexBox';

export default function Loader({ children }: React.PropsWithChildren<{}>) {
  const loaderStore = useLoaderStore();
  const isLoaded = loaderStore.isLoaded();

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
          <FlexBox width="15vw">
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
        </FlexBox>
      )}
      {children}
    </>
  );
}
