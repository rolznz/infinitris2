import { Box, BoxProps } from '@material-ui/core';
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
