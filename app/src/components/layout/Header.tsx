import { Box, IconButton, Link, Tooltip } from '@material-ui/core';
import React from 'react';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import SettingsIcon from '@material-ui/icons/Settings';
import FaceIcon from '@material-ui/icons/Face';
import HomeIcon from '@material-ui/icons/Home';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../models/Routes';

import { useIntl } from 'react-intl';

export default function Header() {
  const intl = useIntl();

  return (
    <Box
      width="100%"
      zIndex={1}
      justifyContent="flex-end"
      display="flex"
      alignItems="center"
    >
      <Tooltip
        title={intl.formatMessage({
          defaultMessage: 'Single Player',
          description: 'Single player button tooltip',
        })}
      >
        <Link component={RouterLink} underline="none" to={Routes.singlePlayer}>
          <IconButton>
            <SportsEsportsIcon />
          </IconButton>
        </Link>
      </Tooltip>
      {window.location.pathname !== Routes.profile &&
        window.location.pathname !== Routes.login && (
          <Link component={RouterLink} underline="none" to={Routes.profile}>
            <IconButton>
              <FaceIcon />
            </IconButton>
          </Link>
        )}
      {window.location.pathname !== Routes.settings && (
        <Link component={RouterLink} underline="none" to={Routes.settings}>
          <IconButton>
            <SettingsIcon />
          </IconButton>
        </Link>
      )}
      {window.location.pathname !== Routes.home && (
        <Link component={RouterLink} underline="none" to={Routes.home}>
          <IconButton>
            <HomeIcon />
          </IconButton>
        </Link>
      )}
    </Box>
  );
}
