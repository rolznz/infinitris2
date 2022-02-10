import { borderColorLight, boxShadows, borderRadiuses } from '@/theme/theme';
import { Typography, Box } from '@mui/material';
import React from 'react';
import FlexBox from '../FlexBox';

type InfoSlideProps = {
  title: React.ReactNode;
  titleAppend?: React.ReactNode;
  content: React.ReactNode;
};

export function InfoSlide({ title, titleAppend, content }: InfoSlideProps) {
  return (
    <FlexBox
      style={{
        boxShadow: boxShadows.small,
      }}
      p={4}
      borderRadius={borderRadiuses.base}
      height="100%"
      justifyContent="flex-start"
      bgcolor="background.paper"
    >
      <FlexBox flexDirection="row" justifyContent="flex-start" width="100%">
        <Typography
          variant="h3"
          style={{ alignSelf: 'flex-start', width: '60%' }}
        >
          {title}
        </Typography>
        {titleAppend}
      </FlexBox>
      <Box mt={1} />
      {content}
    </FlexBox>
  );
}
