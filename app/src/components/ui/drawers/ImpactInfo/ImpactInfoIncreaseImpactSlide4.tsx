import { Typography, SvgIcon } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import FlexBox from '../../FlexBox';
import { ReactComponent as ImpactIcon } from '@/icons/impact.svg';
import { InfoSlide } from '../InfoSlide';

export function ImpactInfoIncreaseImpactSlide4() {
  return (
    <InfoSlide
      title={
        <FormattedMessage
          defaultMessage="The Infinitris Network"
          description="Impact info slide 4 - the infinitris network"
        />
      }
      titleAppend={
        <SvgIcon style={{ fontSize: '60px' }}>
          <ImpactIcon />
        </SvgIcon>
      }
      content={
        <FlexBox height="100%">
          <Typography variant="body1" mt={1}>
            <FormattedMessage
              defaultMessage="your impact score symbolises your personal, positive impact to the infinitris network. infinitris is free, open source and community driven. by increasing your impact, you are helping infinitris to grow."
              description="Infinitris Network description"
            />
          </Typography>
        </FlexBox>
      }
    />
  );
}
