import { IconButton, Link } from '@material-ui/core';
import React from 'react';
import FlexBox from '../layout/FlexBox';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../models/Routes';
import HomeIcon from '@material-ui/icons/Home';

export function ComingSoonPage() {
  return (
    <FlexBox flex={1}>
      <p>Coming Soon</p>
      <p>Multiplayer gameplay is not quite ready yet. Check back here soon!</p>
      <Link component={RouterLink} underline="none" to={Routes.home}>
        <IconButton>
          <HomeIcon />
        </IconButton>
      </Link>
    </FlexBox>
  );
}
