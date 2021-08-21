import { Box, IconButton, SvgIcon } from '@material-ui/core';
import React from 'react';
import FlexBox from '../FlexBox';
import { ReactComponent as ProfileIcon } from '@/icons/profile.svg';
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
        <IconButton
          style={{ backgroundColor: 'white', borderRadius: 32 }}
          onClick={() => setIsOpen(true)}
        >
          <SvgIcon color="secondary" fontSize="large">
            <ProfileIcon />
          </SvgIcon>
        </IconButton>
      </FlexBox>
      <HamburgerMenu isOpen={isOpen} close={() => setIsOpen(false)} />
    </Box>
  );
}
