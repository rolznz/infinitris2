import useAuthStore from '@/state/AuthStore';
import {
  getUpdatableUserProperties,
  useUser,
  useUserStore,
} from '@/state/UserStore';
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
import FlexBox from './ui/FlexBox';
import LoadingSpinner from './LoadingSpinner';
import { getUserRequestPath, IUser, getUserPath } from 'infinitris2-models';
import localStorageKeys from '@/utils/localStorageKeys';
import { useLocalStorage } from 'react-use';

const googleProvider = new firebase.auth.GoogleAuthProvider();
const facebookProvider = new firebase.auth.FacebookAuthProvider();

export const loginTitleId = 'login-title';

interface LoginProps {
  showTitle?: boolean;
  onLogin?(userId: string): void;
}

export default function Login({ onLogin, showTitle = true }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();
  const userStore = useUserStore();
  const authUser = useAuthStore((authStore) => authStore.user);
  const [
    referredByAffiliateId,
    ,
    deleteReferredByAffiliateId,
  ] = useLocalStorage<string>(
    localStorageKeys.referredByAffiliateId,
    undefined,
    {
      raw: true,
    }
  );

  async function loginWithProvider(provider: firebase.auth.AuthProvider) {
    try {
      setIsLoading(true);
      const result = await firebase.auth().signInWithPopup(provider);
      if (result.user) {
        console.log('Authentication succeeded');
        const userPath = getUserPath(result.user.uid);
        if (referredByAffiliateId) {
          deleteReferredByAffiliateId();
          // FIXME: create conversion
          /*await set(
            getUserRequestPath(result.user.uid, 'referredByAffiliate'),
            {
              referredByAffiliateId,
            } as 
          );*/
        }
        /*
        // wait for the firebase onCreateUser function to run
          await new Promise((resolve) => setTimeout(resolve, 3000));
          // re-retrieve the user with updated properties
          await revalidateDocument(userPath);
          userStore.resyncLocalStorage(userDoc);
        */
        onLogin?.(result.user.uid);
      } else {
        console.log('Signin canceled');
      }
    } catch (e) {
      console.error(e);
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
      {showTitle && (
        <Typography align="center" id={loginTitleId}>
          <FormattedMessage
            defaultMessage="Login with"
            description="Login page title"
          />
        </Typography>
      )}
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
