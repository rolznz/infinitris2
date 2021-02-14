import { Box, IconButton, Link, Tooltip } from '@material-ui/core';
import React from 'react';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import SettingsIcon from '@material-ui/icons/Settings';
import FaceIcon from '@material-ui/icons/Face';
import HomeIcon from '@material-ui/icons/Home';
import AddIcon from '@material-ui/icons/Add';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
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
      {window.location.pathname === Routes.home && (
        <Tooltip
          title={intl.formatMessage({
            defaultMessage: 'Challenges',
            description: 'Challenges button tooltip',
          })}
        >
          <Link component={RouterLink} underline="none" to={Routes.tutorials}>
            <IconButton>
              <LocalLibraryIcon />
            </IconButton>
          </Link>
        </Tooltip>
      )}
      {window.location.pathname === Routes.tutorials && (
        <Tooltip
          title={intl.formatMessage({
            defaultMessage: 'Create Challenge',
            description: 'Create Challenge button tooltip',
          })}
        >
          <Link
            component={RouterLink}
            underline="none"
            to={Routes.createChallenge}
          >
            <IconButton>
              <AddIcon />
            </IconButton>
          </Link>
        </Tooltip>
      )}
      {window.location.pathname === Routes.home && (
        <Tooltip
          title={intl.formatMessage({
            defaultMessage: 'Single Player',
            description: 'Single player button tooltip',
          })}
        >
          <Link
            component={RouterLink}
            underline="none"
            to={Routes.singlePlayer}
          >
            <IconButton>
              <SportsEsportsIcon />
            </IconButton>
          </Link>
        </Tooltip>
      )}
      {window.location.pathname === Routes.home && (
        <Link component={RouterLink} underline="none" to={Routes.profile}>
          <IconButton>
            <FaceIcon />
          </IconButton>
        </Link>
      )}
      {window.location.pathname === Routes.home && (
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
