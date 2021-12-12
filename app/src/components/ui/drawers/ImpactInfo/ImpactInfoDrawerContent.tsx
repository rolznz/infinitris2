import React from 'react';

import { Box, SvgIcon } from '@mui/material';

import { ReactComponent as CrossIcon } from '@/icons/x.svg';
import FlexBox from '../../FlexBox';
import { RingIconButton } from '../../RingIconButton';
import { Carousel, narrowSwipeableViewsStyles } from '../../Carousel';

import { ImpactInfoIncreaseImpactSlide } from './ImpactInfoIncreaseImpactSlide';
import { ImpactInfoIncreaseImpactSlide2 } from './ImpactInfoIncreaseImpactSlide2';
import { ImpactInfoIncreaseImpactSlide3 } from './ImpactInfoIncreaseImpactSlide3';
import { ImpactInfoIncreaseImpactSlide4 } from './ImpactInfoIncreaseImpactSlide4';

export interface ImpactInfoProps {
  onClose?(): void;
}

const pages = [
  <ImpactInfoIncreaseImpactSlide key="1" />,
  <ImpactInfoIncreaseImpactSlide2 key="2" />,
  <ImpactInfoIncreaseImpactSlide3 key="3" />,
  <ImpactInfoIncreaseImpactSlide4 key="4" />,
];

export function ImpactInfoDrawerContent({ onClose }: ImpactInfoProps) {
  return (
    <FlexBox flex={1} pb={5} pt={0} px={8} bgcolor="background.paper">
      <Box mt={4} />
      <FlexBox flexDirection="row" style={{ gap: '20px' }}></FlexBox>
      <Box mt={4} />
      <Carousel slides={pages} styles={narrowSwipeableViewsStyles} blurEdges />
      <Box mt={2} />
      <RingIconButton padding="large" onClick={onClose}>
        <SvgIcon>
          <CrossIcon />
        </SvgIcon>
      </RingIconButton>
    </FlexBox>
  );
}
