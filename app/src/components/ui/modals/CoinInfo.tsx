import React from 'react';

import { Box, Button, SvgIcon, Typography, Link } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

import { ReactComponent as CrossIcon } from '@/icons/x.svg';
import FlexBox from '../FlexBox';
import { RingIconButton } from '../RingIconButton';
import { Carousel } from '../Carousel';
import { borderColorLight, borderRadiuses, boxShadows } from '@/theme';
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import { closeDialog } from '@/state/DialogStore';
import { ReactComponent as MarketIcon } from '@/icons/market.svg';
import { FilledIcon } from '../FilledIcon';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';

export interface CoinInfoProps {
  onClose?(): void;
}

type CoinInfoPageProps = {
  title: React.ReactNode;
  content: React.ReactNode;
};

function CoinInfoPage({ title, content }: CoinInfoPageProps) {
  return (
    <FlexBox
      style={{
        backgroundColor: borderColorLight,
        boxShadow: boxShadows.small,
      }}
      p={4}
      my={2}
      mx={0.5}
      borderRadius={borderRadiuses.base}
    >
      <Typography variant="h4" style={{ alignSelf: 'flex-start' }}>
        {title}
      </Typography>
      <Box mt={1} />
      {content}
    </FlexBox>
  );
}

const pages = [
  <CoinInfoPage
    title={
      <FormattedMessage
        defaultMessage="Use coins"
        description="Coin info page - use coins title"
      />
    }
    content={
      <FlexBox>
        <FlexBox flexDirection="row">
          <Typography variant="h6" style={{ alignSelf: 'flex-start' }}>
            <FormattedMessage
              defaultMessage="To customise your character!"
              description="Coin info page - use coins to customize your character"
            />
          </Typography>
          <CharacterImage characterId="0" width={100} />
        </FlexBox>
        <Box mt={1} />
        <Typography variant="body1">
          <FormattedMessage
            defaultMessage="You currently have:"
            description="Coin info page - use coins - your amount"
          />
        </Typography>
        <Box mt={2} />
        <FlexBox flexDirection="row" gridGap={10}>
          <SvgIcon style={{ fontSize: '60px' }}>
            <CoinIcon />
          </SvgIcon>
          <Typography variant="h1">5</Typography>
        </FlexBox>
        <Box mt={2} />
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
  />,
  <CoinInfoPage
    title={
      <FormattedMessage
        defaultMessage="Use coins"
        description="Coin info page - use coins title"
      />
    }
    content={
      <FlexBox>
        <Typography variant="h6">
          {
            <FormattedMessage
              defaultMessage="To customise your character!"
              description="Coin info page - use coins to customize your character"
            />
          }
        </Typography>
        <Typography variant="body1">
          {
            <FormattedMessage
              defaultMessage="You currently have:"
              description="Coin info page - use coins - your amount"
            />
          }
        </Typography>
      </FlexBox>
    }
  />,
];

export default function CoinInfo({ onClose }: CoinInfoProps) {
  return (
    <FlexBox flex={1} pb={5} pt={0} px={8} bgcolor="background.paper">
      <Box mt={4} />
      <FlexBox flexDirection="row" style={{ gap: '20px' }}></FlexBox>
      <Box mt={4} />
      <Carousel pages={pages} />
      <Box mt={2} />
      <RingIconButton padding="large" onClick={onClose}>
        <SvgIcon>
          <CrossIcon />
        </SvgIcon>
      </RingIconButton>
    </FlexBox>
  );
}
