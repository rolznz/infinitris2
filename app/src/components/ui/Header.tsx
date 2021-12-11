import { Box, IconButton, Link, Tooltip } from '@mui/material';
import React from 'react';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SettingsIcon from '@mui/icons-material/Settings';
import FaceIcon from '@mui/icons-material/Face';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import ScoreIcon from '@mui/icons-material/Score';
import ExtensionIcon from '@mui/icons-material/Extension';
import FolderIcon from '@mui/icons-material/Folder';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../models/Routes';
import { Route } from 'react-router-dom';
import { useIntl } from 'react-intl';

// TODO: use material UI app bar
// TODO: use material UI drawer component (open from the right), add text next to icons in menu
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
      <Route exact path={Routes.home}>
        <Tooltip
          title={intl.formatMessage({
            defaultMessage: 'Scoreboard',
            description: 'Scoreboard button tooltip',
          })}
        >
          <Link component={RouterLink} underline="none" to={Routes.scoreboard}>
            <IconButton size="large">
              <ScoreIcon />
            </IconButton>
          </Link>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({
            defaultMessage: 'Challenges',
            description: 'Challenges button tooltip',
          })}
        >
          <Link component={RouterLink} underline="none" to={Routes.challenges}>
            <IconButton size="large">
              <ExtensionIcon />
            </IconButton>
          </Link>
        </Tooltip>
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
            <IconButton size="large">
              <SportsEsportsIcon />
            </IconButton>
          </Link>
        </Tooltip>
        <Link component={RouterLink} underline="none" to={Routes.profile}>
          <Tooltip
            title={intl.formatMessage({
              defaultMessage: 'Profile',
              description: 'Profile button tooltip',
            })}
          >
            <IconButton size="large">
              <FaceIcon />
            </IconButton>
          </Tooltip>
        </Link>
        <Link component={RouterLink} underline="none" to={Routes.settings}>
          <IconButton size="large">
            <SettingsIcon />
          </IconButton>
        </Link>
      </Route>
      <Route exact path={Routes.challenges}>
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
            <IconButton size="large">
              <AddIcon />
            </IconButton>
          </Link>
        </Tooltip>
      </Route>
      <Route exact path={Routes.createChallenge}>
        <Tooltip
          title={intl.formatMessage({
            defaultMessage: 'Load Challenge',
            description: 'Load Challenge button tooltip',
          })}
        >
          <Link
            component={RouterLink}
            underline="none"
            to={Routes.loadChallenge}
          >
            <IconButton size="large">
              <FolderIcon />
            </IconButton>
          </Link>
        </Tooltip>
      </Route>
      <Route
        render={({ location }) =>
          location.pathname !== Routes.home ? (
            <Link component={RouterLink} underline="none" to={Routes.home}>
              <IconButton size="large">
                <HomeIcon />
              </IconButton>
            </Link>
          ) : null
        }
      ></Route>
    </Box>
  );
}
