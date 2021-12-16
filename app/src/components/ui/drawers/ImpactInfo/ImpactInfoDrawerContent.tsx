import React from 'react';

import { Box } from '@mui/material';

import FlexBox from '../../FlexBox';
import { Carousel, narrowSwipeableViewsStyles } from '../../Carousel';

import { ImpactInfoIncreaseImpactSlide } from './ImpactInfoIncreaseImpactSlide';
import { ImpactInfoIncreaseImpactSlide2 } from './ImpactInfoIncreaseImpactSlide2';
import { ImpactInfoIncreaseImpactSlide3 } from './ImpactInfoIncreaseImpactSlide3';
import { ImpactInfoIncreaseImpactSlide4 } from './ImpactInfoIncreaseImpactSlide4';

const pages = [
  <ImpactInfoIncreaseImpactSlide key="1" />,
  <ImpactInfoIncreaseImpactSlide2 key="2" />,
  <ImpactInfoIncreaseImpactSlide3 key="3" />,
  <ImpactInfoIncreaseImpactSlide4 key="4" />,
];

export function ImpactInfoDrawerContent() {
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
