import { Box, IconButton, Link, Tooltip } from '@material-ui/core';
import React from 'react';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import SettingsIcon from '@material-ui/icons/Settings';
import FaceIcon from '@material-ui/icons/Face';
import HomeIcon from '@material-ui/icons/Home';
import AddIcon from '@material-ui/icons/Add';
import ScoreIcon from '@material-ui/icons/Score';
import ExtensionIcon from '@material-ui/icons/Extension';
import FolderIcon from '@material-ui/icons/Folder';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../models/Routes';
import { Route } from 'react-router-dom';
import useDemo from '../hooks/useDemo';
import { useIntl } from 'react-intl';

// TODO: use material UI app bar
// TODO: use material UI drawer component (open from the right), add text next to icons in menu
export default function Header() {
  const intl = useIntl();
  useDemo();

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
            <IconButton>
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
            <IconButton>
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
            <IconButton>
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
            <IconButton>
              <FaceIcon />
            </IconButton>
          </Tooltip>
        </Link>
        <Link component={RouterLink} underline="none" to={Routes.settings}>
          <IconButton>
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
            <IconButton>
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
            <IconButton>
              <FolderIcon />
            </IconButton>
          </Link>
        </Tooltip>
      </Route>
      <Route
        render={({ location }) =>
          location.pathname !== Routes.home ? (
            <Link component={RouterLink} underline="none" to={Routes.home}>
              <IconButton>
                <HomeIcon />
              </IconButton>
            </Link>
          ) : null
        }
      ></Route>
    </Box>
  );
}
