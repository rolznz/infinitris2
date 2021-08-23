import { Box, IconButton, SvgIcon } from '@material-ui/core';
import React from 'react';
import FlexBox from '../FlexBox';
import { ReactComponent as HamburgerIcon } from '@/icons/hamburger.svg';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';

export default function HamburgerMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
      }}
      zIndex="hamburgerButton"
    >
      <FlexBox padding={2}>
        <IconButton style={{}} onClick={() => setIsOpen(true)}>
          <SvgIcon
            color="secondary"
            fontSize="large"
            style={{
              filter: 'drop-shadow(0 0 0.75rem white)',
            }}
          >
            <HamburgerIcon />
          </SvgIcon>
        </IconButton>
      </FlexBox>
      <HamburgerMenu isOpen={isOpen} close={() => setIsOpen(false)} />
    </Box>
  );
}
