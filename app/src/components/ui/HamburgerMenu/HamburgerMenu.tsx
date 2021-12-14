import {
  Box,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Link,
  List,
  SvgIcon,
  Typography,
} from '@mui/material';

import React from 'react';
import { ReactComponent as ProfileIcon } from '@/icons/profile.svg';
import { ReactComponent as CloseIcon } from '@/icons/x.svg';
import { ReactComponent as HomeIcon } from '@/icons/home.svg';
import { ReactComponent as ShareEarnIcon } from '@/icons/share_earn.svg';
import { ReactComponent as ScoreboardIcon } from '@/icons/scoreboard.svg';
import { ReactComponent as SettingsIcon } from '@/icons/settings.svg';
import { ReactComponent as AboutIcon } from '@/icons/about.svg';
import { ReactComponent as MarketIcon } from '@/icons/market.svg';
import { ReactComponent as LogoutIcon } from '@/icons/logout.svg';
import { ReactComponent as LoginIcon } from '@/icons/login.svg';
import FavoriteIcon from '@mui/icons-material/Favorite';
import useAppStore from '@/state/AppStore';
import { FormattedMessage } from 'react-intl';
import Routes from '@/models/Routes';
import HamburgerListItem from './HamburgerListItem';
import { Link as RouterLink } from 'react-router-dom';
import FlexBox from '../FlexBox';
import logoImage from './assets/logo.png';
import useAuthStore from '@/state/AuthStore';
import { useUserStore } from '@/state/UserStore';
import { donationTarget, useDonations } from '@/components/hooks/useDonations';
import { colors, zIndexes } from '@/theme/theme';
import { openLoginDialog } from '@/state/DialogStore';

type HamburgerMenuProps = {
  isOpen: boolean;
  close(): void;
};

export default function HamburgerMenu({ isOpen, close }: HamburgerMenuProps) {
  const appStore = useAppStore();
  const userId = useAuthStore().user?.uid;
  const signOut = useUserStore((userStore) => userStore.signOut);
  const { donations, monthDonationSum } = useDonations(isOpen);

  return (
    <Drawer anchor="right" open={isOpen} onClose={close}>
      <Box role="presentation" onClick={close} onKeyDown={close} px={1}>
        <FlexBox
          justifyContent="flex-end"
          flexDirection="row"
          padding={3}
          pr={1}
        >
          <Link component={RouterLink} underline="none" to={Routes.home}>
            <IconButton size="large">
              <SvgIcon sx={{ color: colors.white }}>{<HomeIcon />}</SvgIcon>
            </IconButton>
          </Link>
          <IconButton onClick={close} size="large">
            <SvgIcon sx={{ color: colors.white }}>{<CloseIcon />}</SvgIcon>
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
            to={Routes.market}
            icon={<MarketIcon />}
            text={
              <FormattedMessage
                defaultMessage="Market"
                description="Hamburger menu - Market list item"
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
            to={Routes.about}
            icon={<AboutIcon />}
            text={
              <FormattedMessage
                defaultMessage="About"
                description="Hamburger menu - About list item"
              />
            }
          />
          {userId ? (
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
          ) : (
            <HamburgerListItem
              onClick={openLoginDialog}
              icon={<LoginIcon />}
              text={
                <FormattedMessage
                  defaultMessage="Login"
                  description="Hamburger menu - Login item"
                />
              }
            />
          )}
        </List>
        <Box px={4} pt={4}>
          <Divider />
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
            style={{
              textTransform: 'uppercase',
              color: colors.white,
              fontSize: '10px',
            }}
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
        <Link component={RouterLink} underline="none" to={Routes.donate}>
          <FlexBox
            px={2}
            pl={2}
            width="100%"
            boxSizing="border-box"
            style={{
              opacity: donations ? 0.3 : 0,
              transition: 'opacity 1s 1s',
            }}
            position="relative"
          >
            <FlexBox
              justifyContent="flex-start"
              flexDirection="row"
              position="absolute"
              style={{ zIndex: zIndexes.above }}
            >
              <SvgIcon color="secondary" fontSize="small">
                <FavoriteIcon />
              </SvgIcon>
              <Typography align="center" variant="caption" color="primary">
                {(monthDonationSum * 100) / donationTarget}%
              </Typography>
            </FlexBox>

            <LinearProgress
              value={Math.min(monthDonationSum / donationTarget, 1) * 100}
              style={{ height: '19px', width: '100%' }}
              color="primary"
              variant="determinate"
            />
          </FlexBox>
        </Link>
      </Box>
    </Drawer>
  );
}
