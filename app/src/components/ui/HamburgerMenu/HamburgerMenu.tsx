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
import { ReactComponent as LogoutIcon } from '@/icons/logout.svg';
import { ReactComponent as LoginIcon } from '@/icons/login.svg';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { FormattedMessage } from 'react-intl';
import Routes from '@/models/Routes';
import HamburgerListItem from './HamburgerListItem';
import { Link as RouterLink } from 'react-router-dom';
import FlexBox from '../FlexBox';
import logoImage from './assets/logo.png';
import useAuthStore from '@/state/AuthStore';
import { donationTarget, useDonations } from '@/components/hooks/useDonations';
import { colors, zIndexes } from '@/theme/theme';
import { openLoginDialog } from '@/state/DialogStore';
import { signOut } from '@/state/updateUser';

type HamburgerMenuProps = {
  isOpen: boolean;
  close(): void;
};

export default function HamburgerMenu({ isOpen, close }: HamburgerMenuProps) {
  //const appStore = useAppStore();
  const userId = useAuthStore().user?.uid;
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
          {/* <HamburgerListItem
            to={Routes.market}
            icon={<MarketIcon />}
            text={
              <FormattedMessage
                defaultMessage="Market"
                description="Hamburger menu - Market list item"
              />
            }
          /> */}
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
              to={Routes.home}
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
        <FlexBox flexDirection="row" pt={2} pl={1}>
          <img
            src={logoImage}
            alt="Logo"
            style={{
              width: '140px',
            }}
          />
        </FlexBox>
        <FlexBox flexDirection="row" gap={1}>
          <Link underline="none" href="https://github.com/rolznz/infinitris2">
            <Typography
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
                  clientVersion: `${process.env.REACT_APP_VERSION}`,
                }}
              />
            </Typography>
          </Link>
          <>•</>
          <Link
            underline="none"
            href="https://github.com/rolznz/infinitris2/issues"
          >
            <Typography
              style={{
                textTransform: 'uppercase',
                fontSize: '10px',
              }}
            >
              Report Bug
            </Typography>
          </Link>
        </FlexBox>
        <Link component={RouterLink} underline="none" to={Routes.donate}>
          <FlexBox
            px={2}
            pl={2}
            width="100%"
            boxSizing="border-box"
            style={{
              opacity: donations ? 1 : 0,
              transition: 'opacity 1s 1s',
            }}
            position="relative"
            justifyContent="flex-start"
            alignItems="flex-start"
          >
            <FlexBox
              height="100%"
              flexDirection="row"
              position="absolute"
              style={{ zIndex: zIndexes.above }}
              pl={1}
            >
              <SvgIcon sx={{ color: colors.white, fontSize: '12px' }}>
                <FavoriteIcon />
              </SvgIcon>
              {/* <Typography align="center" variant="caption" color="primary">
                {(monthDonationSum * 100) / donationTarget}%
              </Typography> */}
            </FlexBox>

            <LinearProgress
              value={Math.min(monthDonationSum / donationTarget, 1) * 100}
              style={{
                height: '19px',
                width: '100%',
                opacity: 0.3,
              }}
              color="primary"
              variant="determinate"
            />
          </FlexBox>
        </Link>
      </Box>
    </Drawer>
  );
}
