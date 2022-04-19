import useAuthStore from '@/state/AuthStore';
import React, { useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import FlexBox from '../FlexBox';
import LoadingSpinner from '../LoadingSpinner';
import localStorageKeys from '@/utils/localStorageKeys';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import useAffiliateLinkRef from '../../hooks/useAffiliateLinkRef';
import { RingIconButton } from '../RingIconButton';
import {
  AuthProvider,
  getAuth,
  sendSignInLinkToEmail,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/firebase';
import {
  CreateUserResponse,
  getConversionPath,
  getPaymentPath,
  IConversion,
  IPayment,
} from 'infinitris2-models';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { CharacterCoinStatChip } from '../../pages/Characters/CharacterStatChip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Controller, useForm } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { SettingsVoice } from '@mui/icons-material';
import { LightningQR } from '@/components/ui/LightningQR';
import { useDocument } from 'swr-firestore';

export interface LoginProps {
  showTitle?: boolean;
  onLogin?(userId: string): void;
  onClose?(): void;
}

const schema = yup
  .object({
    email: yup.string().email().required(),
  })
  .required();

type LoginFormData = {
  email: string;
};

export default function Login({
  onLogin,
  onClose,
  showTitle = true,
}: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [invoice, setInvoice] = useState<string | undefined>(undefined);
  const [paymentId, setPaymentId] = useState<string | undefined>(undefined);

  const { data: payment } = useDocument<IPayment>(
    paymentId ? getPaymentPath(paymentId) : null
  );

  //const user = useUser();
  //const userStore = useUserStore();
  const intl = useIntl();
  const authUser = useAuthStore((authStore) => authStore.user);
  const [referredByAffiliateId, , deleteReferredByAffiliateId] =
    useLocalStorage<string>(localStorageKeys.referredByAffiliateId, undefined, {
      raw: true,
    });
  const [formData, setFormData] = React.useState<LoginFormData>({
    email: '',
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: formData,
    resolver: yupResolver(schema),
  });

  React.useEffect(() => {
    if (payment?.data()?.status === 'completed' && formData.email.length) {
      /*sendSignInLinkToEmail(getAuth(), formData.email, {
        handleCodeInApp: true,
        url: window.location.origin,
      });
      alert('Login code sent');*/
    }
  }, [payment, formData.email]);

  /*async function loginWithProvider(provider: AuthProvider) {
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
        
        // FIXME: this is an ugly way to do it
        // wait for the firebase onCreateUser function to run
          // await new Promise((resolve) => setTimeout(resolve, 3000));
          // // re-retrieve the user with updated properties
          // await revalidateDocument(userPath);
          // userStore.resyncLocalStorage(userDoc);
        
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
  }*/

  const onSubmit = React.useCallback(
    async (data: LoginFormData) => {
      setIsLoading(true);
      if (process.env.REACT_APP_API_URL) {
        const response = (await (
          await fetch(`${process.env.REACT_APP_API_URL}/v1/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
        ).json()) as CreateUserResponse;
        console.log('Create user response', response);
        if (response.invoice) {
          setPaymentId(response.paymentId);
          setInvoice(response.invoice);
        } else {
          alert('Failed to request invoice');
        }
        setIsLoading(false);
      }
    },
    [setInvoice, setIsLoading]
  );

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
        <Typography variant="h5" align="center">
          <FormattedMessage
            defaultMessage="Login to continue"
            description="Login page title"
          />
        </Typography>
      )}
      <Box mt={4} />
      {payment?.exists() ? (
        <FlexBox>
          <Typography variant="body1" align="center">
            <FormattedMessage
              defaultMessage="Payment status: {status}"
              description="Payment status"
              values={{ status: payment.data().status }}
            />
          </Typography>
        </FlexBox>
      ) : invoice ? (
        <FlexBox width={400} my={4} maxWidth="100%">
          <Typography variant="body1" align="center">
            <FormattedMessage
              defaultMessage="Waiting for payment"
              description="Waiting for payment"
            />
          </Typography>
          <LoadingSpinner />
          <LightningQR value={invoice} />
        </FlexBox>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FlexBox width={300}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard" fullWidth>
                  <InputLabel>Email</InputLabel>
                  <Input {...field} autoFocus fullWidth />
                  <p>{errors.email?.message}</p>
                </FormControl>
              )}
            />
            <Button
              type="submit"
              color="primary"
              variant="contained"
              sx={{ width: '100%' }}
            >
              <FormattedMessage
                defaultMessage="Next"
                description="Single Player Options page - play button"
              />
            </Button>
          </FlexBox>
        </form>
      )}
      {referredByAffiliateId && (
        <FlexBox flexDirection="row" gap={2} mt={2}>
          <Typography variant="caption" align="center" pt={1}>
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
          <Button
            color="primary"
            variant="contained"
            onClick={() => deleteReferredByAffiliateId()}
          >
            <FormattedMessage
              defaultMessage="Remove"
              description="Affiliate Program Page - Remove referral code"
            />
          </Button>
        </FlexBox>
      )}
      <Box mt={4} />
    </FlexBox>
  );
}
