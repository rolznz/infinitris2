import React from 'react';
import { Button, Typography, Link, Box } from '@material-ui/core';

import FlexBox from '../ui/FlexBox';
import { FormattedMessage } from 'react-intl';

import useLoginRedirect from '../hooks/useLoginRedirect';
import { useUserStore } from '../../state/UserStore';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import { useCollection, useDocument } from '@nandorojo/swr-firestore';
import {
  challengesPath,
  getUserPath,
  IChallenge,
  IUser,
} from 'infinitris2-models';
import useAuthStore from '../../state/AuthStore';
import LoadingSpinner from '../LoadingSpinner';
import { Link as RouterLink } from 'react-router-dom';
import { YourBlockPreview } from '../ui/BlockPreview';
import { Page } from '../ui/Page';
import { openLoginDialog } from '@/state/DialogStore';

export default function ProfilePage() {
  const [userStore, user] = useUserStore((store) => [store, store.user]);
  const userId = useAuthStore().user?.uid;
  const { data: userChallenges } = useCollection<IChallenge>(
    userId ? challengesPath : null,
    {
      where: [['userId', '==', userId]],
    }
  );

  function signOut() {
    userStore.signOut();
  }

  return (
    <Page
      title={
        <FormattedMessage
          defaultMessage="Profile"
          description="Profile title"
        />
      }
    >
      {!userId && (
        <Button color="primary" variant="contained" onClick={openLoginDialog}>
          <FormattedMessage
            defaultMessage="Log in"
            description="User Profile Page - login button"
          />
        </Button>
      )}

      <Typography align="center">
        <FormattedMessage
          defaultMessage="{count} challenges completed"
          description="Completed challenges statistic"
          values={{
            count: /*FIXME: add backend counter user.completedChallengeIds.length*/ 0,
          }}
        />
      </Typography>

      <Typography align="center">
        <FormattedMessage
          defaultMessage="{count} challenges created"
          description="Created challenges statistic"
          values={{ count: userChallenges?.length || 0 }}
        />
      </Typography>

      <FlexBox flexDirection="row">
        <Typography align="center">
          <FormattedMessage
            defaultMessage="{count} coins available"
            description="User coins statistic"
            values={{ count: user.readOnly?.coins || 0 }}
          />
        </Typography>
        <Box ml={1} />
        <Link component={RouterLink} underline="none" to={Routes.earnCoins}>
          <Typography align="center">
            <FormattedMessage
              defaultMessage="Earn coins"
              description="Earn coins link"
            />
          </Typography>
        </Link>
      </FlexBox>
      <Typography align="center">
        <FormattedMessage
          defaultMessage="Network impact: {networkImpact}"
          description="Network impact statistic"
          values={{ networkImpact: user.readOnly?.networkImpact || 0 }}
        />
      </Typography>
      <FlexBox flexDirection="row">
        <YourBlockPreview user={user} />
        <Box ml={1} />
        <Link
          component={RouterLink}
          underline="none"
          to={Routes.customizeProfile}
        >
          <Typography align="center">
            <FormattedMessage
              defaultMessage="Customize"
              description="Customize block link"
            />
          </Typography>
        </Link>
      </FlexBox>

      {userId && (
        <FlexBox flex={1} justifyContent="flex-end" mb={4}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() =>
              window.confirm('Are you sure you wish to sign out?') && signOut()
            }
          >
            <FormattedMessage
              defaultMessage="Sign out"
              description="Sign out button text"
            />
          </Button>
        </FlexBox>
      )}
    </Page>
  );
}
