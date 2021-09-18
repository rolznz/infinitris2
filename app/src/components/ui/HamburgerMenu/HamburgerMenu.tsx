import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  makeStyles,
  SvgIcon,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { ReactComponent as ProfileIcon } from '@/icons/profile.svg';
import { ReactComponent as CloseIcon } from '@/icons/x.svg';
import { ReactComponent as HomeIcon } from '@/icons/home.svg';
import { ReactComponent as ShareEarnIcon } from '@/icons/share_earn.svg';
import { ReactComponent as ScoreboardIcon } from '@/icons/scoreboard.svg';
import { ReactComponent as SettingsIcon } from '@/icons/settings.svg';
import { ReactComponent as AboutIcon } from '@/icons/about.svg';
import { ReactComponent as LogoutIcon } from '@/icons/logout.svg';
import { appName } from '@/utils/constants';
import useAppStore from '@/state/AppStore';
import { FormattedMessage } from 'react-intl';
import Routes from '@/models/Routes';
import HamburgerListItem from './HamburgerListItem';
import { Link as RouterLink } from 'react-router-dom';
import FlexBox from '../FlexBox';
import logoImage from './assets/logo.png';
import useAuthStore from '@/state/AuthStore';
import { useUserStore } from '@/state/UserStore';

type HamburgerMenuProps = {
  isOpen: boolean;
  close(): void;
};

const useStyles = makeStyles((theme) => ({
  paper: {
    width: 250,
  },
  topIcon: {
    color: theme.palette.text.primary,
  },
  divider: {
    //background: '#ECECED',
    //borderWidth: 2,
    //border: none,
    /* Set the hr color */
    //color: #333; /* old IE */
    //background-color: #333; /* Modern Browsers */
  },
}));

export default function HamburgerMenu({ isOpen, close }: HamburgerMenuProps) {
  const appStore = useAppStore();
  const userId = useAuthStore().user?.uid;
  const signOut = useUserStore((userStore) => userStore.signOut);

  const classes = useStyles();

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={close}
      classes={{ paper: classes.paper }}
    >
      <div role="presentation" onClick={close} onKeyDown={close}>
        <FlexBox justifyContent="flex-end" flexDirection="row" padding={3}>
          <Link component={RouterLink} underline="none" to={Routes.home}>
            <IconButton>
              <SvgIcon className={classes.topIcon}>{<HomeIcon />}</SvgIcon>
            </IconButton>
          </Link>
          <IconButton onClick={close}>
            <SvgIcon className={classes.topIcon}>{<CloseIcon />}</SvgIcon>
          </IconButton>
        </FlexBox>
        <List>
          <HamburgerListItem
            to={Routes.profile}
            icon={<ProfileIcon />}
            text={
              <FormattedMessage
                defaultMessage="Profile"
                description="Hamburger menu - Profile list item"
              />
            }
          />
          <HamburgerListItem
            to={Routes.affiliateProgram}
            icon={<ShareEarnIcon />}
            text={
              <FormattedMessage
                defaultMessage="Share & Earn"
                description="Hamburger menu - Share list item"
              />
            }
          />
          <HamburgerListItem
            to={Routes.scoreboard}
            icon={<ScoreboardIcon />}
            text={
              <FormattedMessage
                defaultMessage="Scoreboard"
                description="Hamburger menu - Scoreboard list item"
              />
            }
          />
          <HamburgerListItem
            to={Routes.settings}
            icon={<SettingsIcon />}
            text={
              <FormattedMessage
                defaultMessage="Settings"
                description="Hamburger menu - Settings list item"
              />
            }
          />
          <HamburgerListItem
            to={Routes.credits}
            icon={<AboutIcon />}
            text={
              <FormattedMessage
                defaultMessage="About"
                description="Hamburger menu - About list item"
              />
            }
          />
          {userId && (
            <HamburgerListItem
              onClick={signOut}
              icon={<LogoutIcon />}
              text={
                <FormattedMessage
                  defaultMessage="Logout"
                  description="Hamburger menu - Logout item"
                />
              }
            />
          )}
        </List>
        <Box px={4} pt={4}>
          <Divider className={classes.divider} />
        </Box>
        <FlexBox justifyContent="flex-start" flexDirection="row" pt={2} pl={1}>
          <img
            src={logoImage}
            alt="Logo"
            style={{
              width: '130px',
            }}
          />
          <Typography
            variant="caption"
            style={{ textTransform: 'uppercase', color: 'white' }}
          >
            <FormattedMessage
              defaultMessage="build {clientVersion}"
              description="Hamburger menu - App build"
              values={{
                clientVersion: `${
                  process.env.REACT_APP_VERSION
                }.${appStore.clientApi?.getVersion()}`,
              }}
            />
          </Typography>
        </FlexBox>
      </div>
    </Drawer>
  );
}
