import { Box, BoxProps } from '@mui/material';
import React from 'react';

export default function FlexBox(props: BoxProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      {...props}
    >
      {props.children}
    </Box>
  );
}
