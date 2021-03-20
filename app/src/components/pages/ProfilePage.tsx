import React from 'react';
import { Button, Typography } from '@material-ui/core';

import FlexBox from '../layout/FlexBox';
import { FormattedMessage } from 'react-intl';

import useLoginRedirect from '../hooks/useLoginRedirect';
import { useUserStore } from '../../state/UserStore';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import { useCollection, useDocument } from '@nandorojo/swr-firestore';
import { IChallenge, IUser } from 'infinitris2-models';
import useAuthStore from '../../state/AuthStore';
import { challengesPath, getUserPath } from '../../firebase';
import LoadingSpinner from '../LoadingSpinner';

export default function ProfilePage() {
  useLoginRedirect();

  const [userStore, user] = useUserStore((store) => [store, store.user]);
  const userId = useAuthStore().user?.uid;
  const history = useHistory();
  const { data: userChallenges } = useCollection<IChallenge>(challengesPath, {
    where: [['userId', '==', userId]],
  });

  const { data: fireStoreUserDoc } = useDocument<IUser>(
    userId ? getUserPath(userId) : null
  );

  function signOut() {
    userStore.signOut();
    history.replace(Routes.home);
  }

  if (!fireStoreUserDoc?.id || fireStoreUserDoc.id !== userId) {
    // wait for the user profile to load
    return (
      <FlexBox flex={1}>
        <LoadingSpinner />
      </FlexBox>
    );
  }

  return (
    <FlexBox flex={1}>
      <Typography align="center">
        <FormattedMessage
          defaultMessage="{nickname}'s Profile"
          description="Profile title"
          values={{ nickname: user.nickname || 'Unknown' }}
        />
      </Typography>

      <Typography align="center">
        <FormattedMessage
          defaultMessage="{count} completed challenges"
          description="Completed challenges statistic"
          values={{ count: user.completedChallengeIds.length }}
        />
      </Typography>

      <Typography align="center">
        <FormattedMessage
          defaultMessage="{count} challenges created"
          description="Created challenges statistic"
          values={{ count: userChallenges?.length }}
        />
      </Typography>

      <Typography align="center">
        <FormattedMessage
          defaultMessage="{count} credits available"
          description="User credits statistic"
          values={{ count: user.credits || 0 }}
        />
      </Typography>

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
    </FlexBox>
  );
}
