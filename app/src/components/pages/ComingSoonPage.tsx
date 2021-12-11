import { IconButton, Link } from '@mui/material';
import React from 'react';
import FlexBox from '../ui/FlexBox';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../models/Routes';
import HomeIcon from '@mui/icons-material/Home';

export function ComingSoonPage() {
  return (
    <FlexBox flex={1}>
      <p>Coming Soon</p>
      <p>Multiplayer gameplay is not quite ready yet. Check back here soon!</p>
      <Link component={RouterLink} underline="none" to={Routes.home}>
        <IconButton size="large">
          <HomeIcon />
        </IconButton>
      </Link>
    </FlexBox>
  );
}
