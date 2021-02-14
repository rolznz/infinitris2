import React, { useState } from 'react';
import { Box, IconButton, Typography } from '@material-ui/core';

import FlexBox from '../layout/FlexBox';
import { FormattedMessage } from 'react-intl';
import useDemo from '../hooks/useDemo';
import firebase from 'firebase';
import useLoggedInRedirect from '../hooks/useLoggedInRedirect';
import SocialLogo from 'social-logos';
import LoadingSpinner from '../LoadingSpinner';
import { useUser } from '../../state/UserStore';
import removeUndefinedValues from '../../utils/removeUndefinedValues';
import { getDocument, set } from '@nandorojo/swr-firestore';
import { getUserPath } from '../../firebase';
const googleProvider = new firebase.auth.GoogleAuthProvider();
const facebookProvider = new firebase.auth.FacebookAuthProvider();

export default function LoginPage() {
  useLoggedInRedirect();
  useDemo();
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  async function loginWithProvider(provider: firebase.auth.AuthProvider) {
    try {
      setIsLoading(true);
      const result = await firebase.auth().signInWithPopup(provider);
      if (result.user) {
        // sync on first load
        const userPath = getUserPath(result.user.uid);
        const userDoc = await getDocument(userPath);
        if (!userDoc.exists) {
          await set(userPath, {
            ...removeUndefinedValues(user),
            nickname: user.nickname || result.user.displayName,
            email: result.user.email,
          });
        }
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

  if (isLoading) {
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
