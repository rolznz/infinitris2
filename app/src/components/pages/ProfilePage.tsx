import React from 'react';
import { Button, Typography } from '@material-ui/core';

import FlexBox from '../layout/FlexBox';
import { FormattedMessage } from 'react-intl';
import useDemo from '../hooks/useDemo';
import useLoginRedirect from '../hooks/useLoginRedirect';
import useUserStore from '../../state/UserStore';

export default function ProfilePage() {
  useLoginRedirect();
  useDemo();
  const userStore = useUserStore();
  const user = userStore.user;

  function signOut() {
    userStore.signOut();
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
          defaultMessage="{count} completed tutorials"
          description="Profile"
          values={{ count: user.completedTutorialIds.length }}
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
