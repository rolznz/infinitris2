import {
  Box,
  createStyles,
  Link,
  Theme,
  Typography,
  withStyles,
} from '@material-ui/core';
import React from 'react';
import SocialLogo, { SocialIcon } from 'social-logos';
import useAppStore from '../../state/AppStore';
import { WithStyles } from '@material-ui/core/styles/withStyles';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../models/Routes';
import { appName } from '@/utils/constants';

interface SocialIconLink {
  icon: SocialIcon;
  link: string;
}

const socialIconLinks: SocialIconLink[] = [
  { icon: 'github', link: 'https://github.com/rolznz/infinitris2' },
  { icon: 'facebook', link: 'https://facebook.com/infinitris' },
  {
    icon: 'youtube',
    link: 'https://www.youtube.com/channel/UCUdKTOTclz00c2BR9_m5sRg',
  },
];

const styles = (theme: Theme) =>
  createStyles({
    footer: {
      backgroundColor: theme.palette.background.default,
    },
    link: {
      '&:hover': {
        transform: 'scale(1.2)',
      },
      transition: 'all 0.5s ease',
    },
  });

function Footer(props: WithStyles<typeof styles>) {
  const appStore = useAppStore();

  return (
    <Box
      width="100%"
      alignItems="center"
      justifyContent="center"
      display="flex"
      flexWrap="wrap"
      flexDirection="row"
      paddingBottom={1}
      boxShadow={1}
    >
      <Typography variant="caption">
        {appName}{' '}
        <img
          src="/logo192.png"
          alt=""
          height={16}
          style={{ verticalAlign: 'sub' }}
        />{' '}
        Build {appStore.clientApi?.getVersion()}
      </Typography>
      <Box ml={0.5} />
      <Link
        component={RouterLink}
        underline="none"
        to={Routes.credits}
        style={{ lineHeight: 0 }}
      >
        <Typography variant="caption">CREDITS</Typography>
      </Link>
      <Box ml={0.5} />
      <Link
        component={RouterLink}
        underline="none"
        to={Routes.privacyPolicy}
        style={{ lineHeight: 0 }}
      >
        <Typography variant="caption">PRIVACY</Typography>
      </Link>
      <Box ml={0.5} />
      <Link
        component={RouterLink}
        underline="none"
        to={Routes.termsOfService}
        style={{ lineHeight: 0 }}
      >
        <Typography variant="caption">TOS</Typography>
      </Link>
      {socialIconLinks.map((link) => (
        <Box key={link.icon} ml={0.75} mr={0.25} mt={0.25}>
          <Link href={link.link}>
            <SocialLogo
              icon={link.icon}
              size={18}
              className={props.classes.link}
            />
          </Link>
        </Box>
      ))}
    </Box>
  );
}

export default withStyles(styles)(Footer);
