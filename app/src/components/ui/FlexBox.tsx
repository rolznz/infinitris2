import { Box, BoxProps } from '@mui/material';
import React from 'react';

const FlexBox = React.forwardRef((props: BoxProps, ref) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      {...props}
      ref={ref}
    >
      {props.children}
    </Box>
  );
});

export default FlexBox;
