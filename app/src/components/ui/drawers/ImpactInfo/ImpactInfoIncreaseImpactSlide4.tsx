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
          defaultMessage="What is Impact?"
          description="Impact info slide 4 - what is impact?"
        />
      }
      titleAppend={
        <SvgIcon style={{ fontSize: '60px' }}>
          <ImpactIcon />
        </SvgIcon>
      }
      content={
        <FlexBox height="100%">
          <Typography variant="body2" mt={1}>
            <FormattedMessage
              defaultMessage="your impact score symbolises your personal, positive impact to this game. infinitris is open source and community driven. by increasing your impact, you are helping infinitris to grow."
              description="Infinitris Network description"
            />
          </Typography>
        </FlexBox>
      }
    />
  );
}
