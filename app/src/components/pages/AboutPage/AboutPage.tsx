import FlexBox from '@/components/ui/FlexBox';
import { Page } from '@/components/ui/Page';
import { RingIconButton } from '@/components/ui/RingIconButton';
import { appName } from '@/utils/constants';
import { makeStyles, Typography, Box, SvgIcon, Link } from '@material-ui/core';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import { ReactComponent as CreditsIcon } from '@/icons/credits.svg';
import { ReactComponent as GithubIcon } from '@/icons/github.svg';
import { ReactComponent as PrivacyIcon } from '@/icons/privacy.svg';
import { ReactComponent as TermsIcon } from '@/icons/terms.svg';
import { ReactComponent as DonateIcon } from '@/icons/donate.svg';
import { ReactComponent as FacebookIcon } from '@/icons/facebook2.svg';
import { ReactComponent as YouTubeIcon } from '@/icons/youtube.svg';
import { ReactComponent as TwitterIcon } from '@/icons/twitter.svg';
import { AboutIconButton } from './AboutIconButton';

const useStyles = makeStyles(() => ({
  shareButton: {
    display: 'flex',
  },
}));

export default function AboutPage() {
  const classes = useStyles();

  return (
    <Page
      title={
        <FormattedMessage
          defaultMessage="About"
          description="About page title"
        />
      }
      narrow
    >
      <Typography align="center" variant="body1">
        <FormattedMessage
          defaultMessage="{appName} is a multiplayer puzzle falling block puzzle game. Place blocks on a giant grid that expands and contracts based on the number of players in-game. Customize your character, create challenges to share with the community and refine your skills in {appName} story mode."
          description="About page description"
          values={{ appName }}
        />
      </Typography>
      <Box mt={4} />
      <FlexBox flexDirection="row" flexWrap="wrap" gridGap={20}>
        <AboutIconButton to={Routes.credits} icon={<CreditsIcon />} />
        <AboutIconButton
          url={'https://github.com/rolznz/infinitris2'}
          icon={<GithubIcon />}
        />
        <AboutIconButton to={Routes.privacyPolicy} icon={<PrivacyIcon />} />
        <AboutIconButton to={Routes.termsOfService} icon={<TermsIcon />} />
        <AboutIconButton to={Routes.donate} icon={<DonateIcon />} />
        <AboutIconButton
          url={'https://facebook.com/infinitris'}
          icon={<FacebookIcon />}
        />
        <AboutIconButton
          url={'https://www.youtube.com/channel/UCUdKTOTclz00c2BR9_m5sRg'}
          icon={<YouTubeIcon />}
        />
        <AboutIconButton
          url={'https://twitter.com/infinitris_io'}
          icon={<TwitterIcon />}
        />
      </FlexBox>
    </Page>
  );
}
