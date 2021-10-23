import { Box, IconButton, Link } from '@material-ui/core';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../models/Routes';
import HomeIcon from '@material-ui/icons/Home';
import { Page } from '../ui/Page';

export function NotFoundPage() {
  return (
    <Page title="404" style={{ height: '100%', justifyContent: 'center' }}>
      <Link component={RouterLink} underline="none" to={Routes.home}>
        <IconButton>
          <HomeIcon fontSize="large" />
        </IconButton>
      </Link>
      <Box mt={10} />
    </Page>
  );
}
