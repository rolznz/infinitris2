import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import Routes from '@/models/Routes';
import { closeDialog } from '@/state/DialogStore';
import { Typography, Box, SvgIcon, Button, Link } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import FlexBox from '../../FlexBox';
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { Link as RouterLink } from 'react-router-dom';
import { useUser } from '@/components/hooks/useUser';
import { InfoSlide } from '../InfoSlide';

export function CoinInfoUseCoinsSlide() {
  const coins = useUser().readOnly?.coins || 0;
  return (
    <InfoSlide
      title={
        <FormattedMessage
          defaultMessage="Use coins"
          description="Coin info slide 1 - use coins title"
        />
      }
      content={
        <FlexBox height="100%">
          <FlexBox flexDirection="row">
            <Typography variant="h6" style={{ alignSelf: 'flex-start' }}>
              <FormattedMessage
                defaultMessage="To customise your character!"
                description="Coin info slide 1 - use coins to customize your character"
              />
            </Typography>
            <CharacterImage characterId="0" width={100} />
          </FlexBox>
          <Typography variant="body1">
            <FormattedMessage
              defaultMessage="You currently have:"
              description="Coin info slide 1 - use coins - your amount"
            />
          </Typography>

          <FlexBox flexDirection="row" gap={1}>
            <SvgIcon style={{ fontSize: '60px' }}>
              <CoinIcon />
            </SvgIcon>
            <Typography variant="h1" marginTop={0.5}>
              {coins}
            </Typography>
          </FlexBox>
          <Box mt={2} />
          <Box flex={1} />
          <Link
            component={RouterLink}
            underline="none"
            to={Routes.market}
            onClick={closeDialog}
          >
            <Button color="primary" variant="contained" size="large">
              <FormattedMessage
                defaultMessage="Customize now"
                description="Coin info page - customize button"
              />
            </Button>
          </Link>
        </FlexBox>
      }
    />
  );
}
