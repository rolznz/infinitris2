import useAuthStore from '@/state/AuthStore';
import React, { useState } from 'react';

import { Box, IconButton, SvgIcon, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import FlexBox from '../FlexBox';
import LoadingSpinner from '../LoadingSpinner';
import localStorageKeys from '@/utils/localStorageKeys';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import useAffiliateLinkRef from '../../hooks/useAffiliateLinkRef';
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';

import { ReactComponent as GoogleIcon } from '@/icons/google.svg';
import { ReactComponent as FacebookIcon } from '@/icons/facebook.svg';
import { ReactComponent as CrossIcon } from '@/icons/x.svg';
import { RingIconButton } from '../RingIconButton';
import {
  AuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/firebase';
import { getConversionPath, IConversion } from 'infinitris2-models';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { FilledIcon } from '../FilledIcon';
import { CharacterCoinStatChip } from '../../pages/Characters/CharacterStatChip';

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
          const conversionPath = getConversionPath(
            referredByAffiliateId,
            result.user.uid
          );
          const conversion: IConversion = {
            created: false,
            userId: result.user.uid,
          };

          console.log('Setting conversion ' + conversionPath, conversion);
          try {
            await setDoc(doc(getFirestore(), conversionPath), conversion);
          } catch (error) {
            console.error('Failed to create conversion', error);
          }
          deleteReferredByAffiliateId();
        }
        /*
        // FIXME: this is an ugly way to do it
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
    <FlexBox flex={1} pt={8} px={8}>
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
      {referredByAffiliateId && (
        <FlexBox flexDirection="row" gap={2} mt={2}>
          <Typography variant="caption" align="center" id={loginTitleId} pt={1}>
            <FormattedMessage
              defaultMessage="Referral ID: {referredByAffiliateId}"
              description="Login page Referral ID"
              values={{
                referredByAffiliateId,
              }}
            />
          </Typography>
          <FlexBox display="inline-flex">
            <CharacterCoinStatChip value={3} />
          </FlexBox>
        </FlexBox>
      )}
      <Box mt={4} />
    </FlexBox>
  );
}

type LoginIconProps = {
  icon: JSX.Element;
  onClick(): void;
};
function LoginIcon({ icon, onClick }: LoginIconProps) {
  return (
    <RingIconButton onClick={onClick} padding="none" borderWidth={8}>
      <SvgIcon
        sx={{
          fontSize: '60px',
          margin: -0.25,
        }}
      >
        {icon}
      </SvgIcon>
    </RingIconButton>
  );
}
