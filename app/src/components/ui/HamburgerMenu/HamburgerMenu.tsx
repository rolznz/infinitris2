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
import { appName } from '@/utils/constants';
import useAppStore from '@/state/AppStore';
import { FormattedMessage } from 'react-intl';
import Routes from '@/models/Routes';
import HamburgerListItem from './HamburgerListItem';
import { Link as RouterLink } from 'react-router-dom';
import FlexBox from '../FlexBox';

type HamburgerMenuProps = {
  isOpen: boolean;
  close(): void;
};

export default function HamburgerMenu({ isOpen, close }: HamburgerMenuProps) {
  const appStore = useAppStore();
  const useStyles = makeStyles({
    paper: {
      width: 250,
    },
  });

  const classes = useStyles();

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={close}
      classes={{ paper: classes.paper }}
    >
      <div role="presentation" onClick={close} onKeyDown={close}>
        <FlexBox alignItems="flex-end">
          <Link component={RouterLink} underline="none" to={Routes.home}>
            <IconButton>
              <SvgIcon>{<ProfileIcon />}</SvgIcon>
            </IconButton>
          </Link>
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
            icon={<ProfileIcon />}
            text={
              <FormattedMessage
                defaultMessage="Share & Earn"
                description="Hamburger menu - Share list item"
              />
            }
          />
          <HamburgerListItem
            to={Routes.scoreboard}
            icon={<ProfileIcon />}
            text={
              <FormattedMessage
                defaultMessage="Scoreboard"
                description="Hamburger menu - Scoreboard list item"
              />
            }
          />
          <HamburgerListItem
            to={Routes.settings}
            icon={<ProfileIcon />}
            text={
              <FormattedMessage
                defaultMessage="Settings"
                description="Hamburger menu - Settings list item"
              />
            }
          />
          <HamburgerListItem
            to={Routes.credits}
            icon={<ProfileIcon />}
            text={
              <FormattedMessage
                defaultMessage="About"
                description="Hamburger menu - About list item"
              />
            }
          />
        </List>
        <Divider />
        <Box p={2}>
          <Typography variant="caption" style={{ textTransform: 'uppercase' }}>
            <FormattedMessage
              defaultMessage="{appName} build {clientVersion}"
              description="Hamburger menu - App name and build"
              values={{
                appName,
                clientVersion: appStore.clientApi?.getVersion(),
              }}
            />
          </Typography>
        </Box>
      </div>
    </Drawer>
  );
}
