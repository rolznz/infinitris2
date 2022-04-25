import React from 'react';

import { Box } from '@mui/material';

import FlexBox from '../../FlexBox';
import { Carousel, narrowSwipeableViewsStyles } from '../../Carousel';

import { CoinInfoUseCoinsSlide } from './CoinInfoUseCoinsSlide';
import { CoinInfoEarnCoinsSlide } from './CoinInfoEarnCoinsSlide';
import { CoinInfoBuyCoinsSlide } from '@/components/ui/drawers/CoinInfo/CoinInfoBuyCoinsSlide';

const pages = [
  <CoinInfoUseCoinsSlide key="1" />,
  <CoinInfoEarnCoinsSlide key="2" />,
  <CoinInfoBuyCoinsSlide key="3" />,
];

export function CoinInfoDrawerContent() {
  return (
    <FlexBox flex={1}>
      <Box mt={4} />
      <FlexBox flexDirection="row" style={{ gap: '20px' }}></FlexBox>
      <Box mt={4} />
      <Carousel slides={pages} styles={narrowSwipeableViewsStyles} blurEdges />
      <Box mt={2} />
    </FlexBox>
  );
}
