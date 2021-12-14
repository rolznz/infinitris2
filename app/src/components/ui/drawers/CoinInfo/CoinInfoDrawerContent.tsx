import React from 'react';

import { Box, SvgIcon } from '@mui/material';

import { ReactComponent as CrossIcon } from '@/icons/x.svg';
import FlexBox from '../../FlexBox';
import { RingIconButton } from '../../RingIconButton';
import { Carousel, narrowSwipeableViewsStyles } from '../../Carousel';

import { CoinInfoUseCoinsSlide } from './CoinInfoUseCoinsSlide';
import { CoinInfoEarnCoinsSlide } from './CoinInfoEarnCoinsSlide';
import { FilledIcon } from '../../FilledIcon';

export interface CoinInfoProps {
  onClose?(): void;
}

const pages = [
  <CoinInfoUseCoinsSlide key="1" />,
  <CoinInfoEarnCoinsSlide key="2" />,
];

export function CoinInfoDrawerContent({ onClose }: CoinInfoProps) {
  return (
    <FlexBox flex={1} px={8} bgcolor="background.paper">
      <Box mt={4} />
      <FlexBox flexDirection="row" style={{ gap: '20px' }}></FlexBox>
      <Box mt={4} />
      <Carousel slides={pages} styles={narrowSwipeableViewsStyles} blurEdges />
      <Box mt={2} />
    </FlexBox>
  );
}
