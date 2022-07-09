import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import FlexBox from '@/components/ui/FlexBox';
import { Typography } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Page } from '../../ui/Page';
import notFoundImage from './assets/not_found.svg';
import notFoundImageMobile from './assets/not_found.svg';

export function NotFoundPage() {
  const isLandscape = useIsLandscape();
  const image = isLandscape ? notFoundImage : notFoundImageMobile;
  return (
    <Page
      title="404"
      background={
        <FlexBox
          key={image}
          width="100vw"
          height="100vh"
          sx={{
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%), url(${image})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPositionY: '100%',
            backgroundPositionX: '22%',
          }}
          position="absolute"
          top={0}
          left={0}
          zIndex={-1}
        />
      }
      style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}
    >
      <Typography>
        <FormattedMessage
          defaultMessage="Sorry, this page doesn't seem to exist."
          description="Not Found page text"
        />
      </Typography>
    </Page>
  );
}
