import { IconButton, Link, Typography } from '@mui/material';
import React from 'react';
import FlexBox from '../ui/FlexBox';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../models/Routes';
import HomeIcon from '@mui/icons-material/Home';
import { Page } from '../ui/Page';
import { colors } from '@/theme/theme';

export function ComingSoonPage() {
  return (
    <Page title="Coming Soon">
      <FlexBox flex={1}>
        <Typography variant="body1" mb={10}>
          Good things take time <span style={{ fontSize: '40px' }}>🚣</span>
        </Typography>
        <Link component={RouterLink} underline="none" to={Routes.home}>
          <IconButton sx={{ color: colors.white }}>
            <HomeIcon sx={{ fontSize: '100px' }} />
          </IconButton>
        </Link>
      </FlexBox>
    </Page>
  );
}
