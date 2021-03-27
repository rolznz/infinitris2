import { getUserPath } from '@/firebase';
import useAuthStore from '@/state/AuthStore';
import { useUser, useUserStore } from '@/state/UserStore';
import removeUndefinedValues from '@/utils/removeUndefinedValues';
import {
  getDocument,
  set,
  revalidateDocument,
  Document,
} from '@nandorojo/swr-firestore';
import firebase from 'firebase';
import React, { useState } from 'react';

import { Box, IconButton, Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import SocialLogo from 'social-logos';
import FlexBox from './layout/FlexBox';
import LoadingSpinner from './LoadingSpinner';
import { IUser } from 'infinitris2-models';

const googleProvider = new firebase.auth.GoogleAuthProvider();
const facebookProvider = new firebase.auth.FacebookAuthProvider();

export const loginTitleId = 'login-title';

interface LoginProps {
  onLogin?(userId: string): void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();
  const userStore = useUserStore();
  const authUser = useAuthStore((authStore) => authStore.user);

  async function loginWithProvider(provider: firebase.auth.AuthProvider) {
    try {
      setIsLoading(true);
      const result = await firebase.auth().signInWithPopup(provider);
      if (result.user) {
        // sync on first load
        const userPath = getUserPath(result.user.uid);
        const userDoc = await getDocument<IUser & Document>(userPath);
        if (!userDoc.exists) {
          await set(userPath, {
            ...removeUndefinedValues(user),
            nickname: user.nickname || result.user.displayName,
            email: result.user.email,
          });
          // wait for the firebase onCreateUser function to run
          await new Promise((resolve) => setTimeout(resolve, 3000));
          // re-retrieve the user with updated properties
          await revalidateDocument(userPath);
        } else {
          userStore.resyncLocalStorage(userDoc);
        }
        onLogin?.(result.user.uid);
      }
    } catch (e) {
      alert(e.message || 'Unknown error occurred. Please try again.');
      setIsLoading(false);
    }
  }

  function loginWithGoogle() {
    loginWithProvider(googleProvider);
  }
  function loginWithFacebook() {
    loginWithProvider(facebookProvider);
  }

  if (authUser || isLoading) {
    return (
      <FlexBox flex={1}>
        <LoadingSpinner />
      </FlexBox>
    );
  }

  return (
    <FlexBox flex={1}>
      <Typography align="center" id={loginTitleId}>
        <FormattedMessage
          defaultMessage="Login with"
          description="Login page title"
        />
      </Typography>
      <Box mt={2} />
      <FlexBox flexDirection="row">
        <IconButton color="primary" onClick={loginWithGoogle}>
          <SocialLogo icon="google" size={18} />
        </IconButton>
        <IconButton color="primary" onClick={loginWithFacebook}>
          <SocialLogo icon="facebook" size={18} />
        </IconButton>
      </FlexBox>
    </FlexBox>
  );
}
