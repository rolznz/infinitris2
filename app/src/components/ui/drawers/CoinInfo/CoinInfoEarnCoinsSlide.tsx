import { Typography, SvgIcon, Box, Button } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import FlexBox from '../../FlexBox';
import { InfoSlide } from '../InfoSlide';
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { ReactComponent as ImpactIcon } from '@/icons/impact.svg';
import { openImpactInfoDialog } from '@/state/DialogStore';
import { useUser } from '@/components/hooks/useUser';

export function CoinInfoEarnCoinsSlide() {
  const impact = useUser().readOnly?.networkImpact || 0;
  return (
    <InfoSlide
      title={
        <FormattedMessage
          defaultMessage="Earn coins"
          description="Coin info slide 2 - earn coins title"
        />
      }
      titleAppend={
        <SvgIcon style={{ fontSize: '60px' }}>
          <CoinIcon />
        </SvgIcon>
      }
      content={
        <FlexBox height="100%">
          <Typography variant="h6">
            <FormattedMessage
              defaultMessage="By increasing your impact!"
              description="Coin info page - by increasing impact text"
            />
          </Typography>

          <Box mt={3} />
          <Typography variant="body1">
            <FormattedMessage
              defaultMessage="You currently have:"
              description="Coin info slide 1 - use coins - your amount"
            />
          </Typography>
          <Box mt={2} />
          <FlexBox flexDirection="row" gap={1}>
            <SvgIcon style={{ fontSize: '60px' }}>
              <ImpactIcon />
            </SvgIcon>
            <Typography variant="h1" marginTop={0.5}>
              {impact}
            </Typography>
          </FlexBox>
          <Box flex={1} />
          <Button
            color="primary"
            variant="contained"
            size="large"
            onClick={openImpactInfoDialog}
          >
            <FormattedMessage
              defaultMessage="Learn more"
              description="Coin info page - learn more about impact"
            />
          </Button>
        </FlexBox>
      }
    />
  );
}
