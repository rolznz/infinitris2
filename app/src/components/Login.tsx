import useAuthStore from '@/state/AuthStore';
import React, { useState } from 'react';

import { Box, IconButton, SvgIcon, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { FormattedMessage } from 'react-intl';
import FlexBox from './ui/FlexBox';
import LoadingSpinner from './LoadingSpinner';
import localStorageKeys from '@/utils/localStorageKeys';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import useAffiliateLinkRef from './hooks/useAffiliateLinkRef';

import { ReactComponent as GoogleIcon } from '@/icons/google.svg';
import { ReactComponent as FacebookIcon } from '@/icons/facebook.svg';
import { ReactComponent as CrossIcon } from '@/icons/x.svg';
import { RingIconButton } from './ui/RingIconButton';
import {
  AuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/firebase';

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const loginTitleId = 'login-title';

export interface LoginProps {
  showTitle?: boolean;
  onLogin?(userId: string): void;
  onClose?(): void;
}

export default function Login({
  onLogin,
  onClose,
  showTitle = true,
}: LoginProps) {
  useAffiliateLinkRef();
  const [isLoading, setIsLoading] = useState(false);
  //const user = useUser();
  //const userStore = useUserStore();
  const authUser = useAuthStore((authStore) => authStore.user);
  const [referredByAffiliateId, , deleteReferredByAffiliateId] =
    useLocalStorage<string>(localStorageKeys.referredByAffiliateId, undefined, {
      raw: true,
    });

  async function loginWithProvider(provider: AuthProvider) {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        console.log('Authentication succeeded');
        //const userPath = getUserPath(result.user.uid);
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
        onClose?.();
      } else {
        console.log('Signin canceled');
      }
    } catch (e) {
      console.error(e);
      alert(
        (e as Error)?.message || 'Unknown error occurred. Please try again.'
      );
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
    <FlexBox flex={1} py={20} px={8} bgcolor="background.paper">
      {showTitle && (
        <Typography variant="h5" align="center" id={loginTitleId}>
          <FormattedMessage
            defaultMessage="Login to continue"
            description="Login page title"
          />
        </Typography>
      )}
      <Box mt={4} />
      <FlexBox flexDirection="row" style={{ gap: '20px' }}>
        <LoginIcon icon={<GoogleIcon />} onClick={loginWithGoogle} />
        <LoginIcon icon={<FacebookIcon />} onClick={loginWithFacebook} />
      </FlexBox>
      <Box mt={4} />
      <RingIconButton padding="large" onClick={onClose}>
        <SvgIcon>
          <CrossIcon />
        </SvgIcon>
      </RingIconButton>
    </FlexBox>
  );
}

const useLoginIconStyles = makeStyles((theme) => ({
  icon: {
    fontSize: theme.spacing(10),
    margin: theme.spacing(1),
  },
}));
type LoginIconProps = {
  icon: JSX.Element;
  onClick(): void;
};
function LoginIcon({ icon, onClick }: LoginIconProps) {
  const classes = useLoginIconStyles();

  return (
    <IconButton onClick={onClick} size="large">
      <SvgIcon className={classes.icon}>{icon}</SvgIcon>
    </IconButton>
  );
}
