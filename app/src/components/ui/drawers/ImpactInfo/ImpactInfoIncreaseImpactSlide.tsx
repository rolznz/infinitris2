import { Typography, SvgIcon, Box, Button } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import FlexBox from '../../FlexBox';
import { ReactComponent as ImpactIcon } from '@/icons/impact.svg';
import { openImpactInfoDialog } from '@/state/DialogStore';
import { useUser } from '@/state/UserStore';
import { InfoSlide } from '../InfoSlide';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';

export function ImpactInfoIncreaseImpactSlide() {
  const impact = useUser().readOnly?.networkImpact || 0;
  return (
    <InfoSlide
      title={
        <FormattedMessage
          defaultMessage="Increase your Impact"
          description="Impact info slide 1 - increase impact title"
        />
      }
      content={
        <FlexBox>
          <Typography variant="body1" mt={1}>
            <FormattedMessage
              defaultMessage="To ascend the scoreboard, earn coins and more!"
              description="Impact info slide 1 - impact benefits"
            />
          </Typography>

          <Box mt={3} />
          <Typography variant="body1">
            <FormattedMessage
              defaultMessage="Your impact is currently:"
              description="Impact info slide 1 - your impact"
            />
          </Typography>
          <Box mt={2} />
          <FlexBox flexDirection="row" gap={1}>
            <SvgIcon style={{ fontSize: '80px' }}>
              <ImpactIcon />
            </SvgIcon>
            <Typography variant="h1" marginTop={0.5}>
              {impact}
            </Typography>
          </FlexBox>
        </FlexBox>
      }
    />
  );
}