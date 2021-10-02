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
import { AboutIcon } from './AboutIcon';

const useStyles = makeStyles((theme) => ({
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
          defaultMessage="{appName} is a multiplayer puzzle falling block puzzle game. Place blocks on a giant grid that expands and contracts based on the number of players in-game. Create challenges to share with the community and refine your skills in {appName} story mode."
          description="About page description"
          values={{ appName }}
        />
      </Typography>
      <Box mt={4} />
      <FlexBox flexDirection="row" flexWrap="wrap" gridGap={10}>
        <AboutIcon to={Routes.credits} icon={<CreditsIcon />} />
        <AboutIcon
          url={'https://github.com/rolznz/infinitris2'}
          icon={<GithubIcon />}
        />
        <AboutIcon to={Routes.credits} icon={<CreditsIcon />} />
      </FlexBox>

      {/* TODO: OG images for sharing */}
    </Page>
  );
}
