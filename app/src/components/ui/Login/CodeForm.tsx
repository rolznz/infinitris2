import FlexBox from '@/components/ui/FlexBox';
import Typography from '@mui/material/Typography';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import useLoginStore from '@/state/LoginStore';
import shallow from 'zustand/shallow';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import localStorageKeys from '@/utils/localStorageKeys';
import { setDoc, getFirestore, doc, updateDoc } from 'firebase/firestore';
import {
  getConversionPath,
  getUserPath,
  IConversion,
  removeUndefinedValues,
} from 'infinitris2-models';
import Link from '@mui/material/Link';
import useLocalUserStore, {
  DEFAULT_CHARACTER_ID,
} from '@/state/LocalUserStore';
import { purchaseCharacter, setNickname } from '@/state/updateUser';
import { useSnackbar } from 'notistack';

const codeSchema = yup
  .object({
    code: yup.string().length(6).required(),
  })
  .required();
type EnterCodeFormData = {
  code: string;
};
type CodeFormProps = { onSuccess(userId: string): void };

export function CodeForm({ onSuccess }: CodeFormProps) {
  const intl = useIntl();
  const [localUser, signoutLocalUser] = useLocalUserStore(
    (store) => [store.user, store.signOutLocalUser],
    shallow
  );
  const [referredByAffiliateId, , deleteReferredByAffiliateId] =
    useLocalStorage<string>(localStorageKeys.referredByAffiliateId, undefined, {
      raw: true,
    });
  const [
    setIsLoading,
    email,
    setCodeSent,
    setInvoice,
    setPaymentId,
    hasCreatedNewUser,
  ] = useLoginStore(
    (store) => [
      store.setIsLoading,
      store.email,
      store.setCodeSent,
      store.setInvoice,
      store.setPaymentId,
      store.hasCreatedNewUser,
    ],
    shallow
  );
  const [codeFormData] = React.useState<EnterCodeFormData>({
    code: '',
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EnterCodeFormData>({
    defaultValues: codeFormData,
    resolver: yupResolver(codeSchema),
    mode: 'onChange',
  });
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = React.useCallback(
    async (data: EnterCodeFormData) => {
      setIsLoading(true);
      if (process.env.REACT_APP_API_URL) {
        const loginResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/v1/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              code: data.code.toUpperCase(),
            }),
          }
        );

        if (loginResponse.ok) {
          if (!hasCreatedNewUser) {
            // reset the current user so that they pick up all settings from the database user
            // if a user registers and does not login in the same session, their local profile won't be synced.
            signoutLocalUser();
          }
          const loginToken: string = await loginResponse.json();
          const credential = await signInWithCustomToken(getAuth(), loginToken);

          if (referredByAffiliateId) {
            const conversionPath = getConversionPath(
              referredByAffiliateId,
              credential.user.uid
            );
            const conversion: IConversion = {
              created: false,
              userId: credential.user.uid,
            };

            console.log('Setting conversion ' + conversionPath, conversion);
            try {
              await setDoc(doc(getFirestore(), conversionPath), conversion);
            } catch (error) {
              console.error('Failed to create conversion', error);
            }
            deleteReferredByAffiliateId();
          }

          if (hasCreatedNewUser) {
            enqueueSnackbar(
              intl.formatMessage({
                defaultMessage: 'Your account is being created. Please wait...',
                description: 'Your account is being created toast message',
              }),
              {
                variant: 'info',
              }
            );
            // sync guest settings into newly created account
            console.log('Syncing account settings');
            try {
              const {
                appTheme,
                rendererType,
                rendererQuality,
                musicOn,
                sfxOn,
                sfxVolume,
                musicVolume,
                controls_keyboard,
                controls_gamepad,
                locale,
                preferredInputMethod,
                completedOfficialChallengeIds,
                unlockedFeatures,
                blockShadowType,
                gridLineType,
                showFaces,
                showNicknames,
                showPatterns,
              } = localUser;
              await updateDoc(
                doc(getFirestore(), getUserPath(credential.user.uid)),
                removeUndefinedValues({
                  musicOn,
                  sfxOn,
                  appTheme,
                  rendererType,
                  rendererQuality,
                  sfxVolume,
                  musicVolume,
                  controls_keyboard,
                  controls_gamepad,
                  locale,
                  preferredInputMethod,
                  completedOfficialChallengeIds,
                  unlockedFeatures,
                  blockShadowType,
                  gridLineType,
                  showFaces,
                  showNicknames,
                  showPatterns,
                })
              );
            } catch (error) {
              enqueueSnackbar(
                intl.formatMessage({
                  defaultMessage: 'Failed to sync user settings',
                  description:
                    'Failed to sync user settings on register toast message',
                }),
                {
                  variant: 'error',
                }
              );
            }

            if (localUser.nickname) {
              if (!(await setNickname(localUser.nickname))) {
                enqueueSnackbar(
                  intl.formatMessage({
                    defaultMessage: 'Failed to secure nickname.',
                    description:
                      'Failed to sync nickname on register toast message',
                  }),
                  {
                    variant: 'error',
                  }
                );
              }
            }

            for (const freeCharacterId of localUser.freeCharacterIds || []) {
              if (freeCharacterId !== DEFAULT_CHARACTER_ID) {
                await purchaseCharacter(freeCharacterId);
                // make sure not to trigger spam + give some time before changing the user's character
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }

            if (localUser.selectedCharacterId !== DEFAULT_CHARACTER_ID) {
              try {
                const { selectedCharacterId } = localUser;
                await updateDoc(
                  doc(getFirestore(), getUserPath(credential.user.uid)),
                  {
                    selectedCharacterId,
                  }
                );
              } catch (error) {
                console.error('Failed to set selected character', error);
              }
            }

            // after syncing all user settings to their account, delete the data stored in local storage
            // so that user gets correct view of new account
            signoutLocalUser();
          }

          enqueueSnackbar(
            intl.formatMessage({
              defaultMessage: 'Logged in successfully',
              description: 'Logged in successfully toast message',
            })
          );
          onSuccess(credential.user.uid);
        } else if (loginResponse.status === 409) {
          alert('Wrong code. Please try again.');
        } else if (loginResponse.status === 429) {
          alert('Please wait a minute and try again.');
        } else {
          alert(
            'Login failed: ' +
              loginResponse.status +
              ' ' +
              loginResponse.statusText +
              '\nPlease try again.'
          );
        }

        setIsLoading(false);
      }
    },
    [
      deleteReferredByAffiliateId,
      email,
      intl,
      onSuccess,
      referredByAffiliateId,
      setIsLoading,
      hasCreatedNewUser,
      signoutLocalUser,
      localUser,
      enqueueSnackbar,
    ]
  );

  return (
    <FlexBox mt={2}>
      <Typography variant="body2" align="center" mb={1}>
        <FormattedMessage
          defaultMessage="A 6-letter code has been sent to {email}"
          description="Login email code instructions"
          values={{ email }}
        />
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FlexBox width={300}>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <FormControl variant="standard" fullWidth>
                <InputLabel>XXXXXX</InputLabel>
                <Input {...field} autoFocus fullWidth />
                <p>{errors.code?.message}</p>
              </FormControl>
            )}
          />
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={!isValid}
          >
            <FormattedMessage
              defaultMessage="Next"
              description="Enter code next button"
            />
          </Button>
        </FlexBox>
      </form>
      <Typography variant="caption" align="center" mt={2}>
        <FormattedMessage
          defaultMessage="Didn't receive an email? Check your spam folder or {resend}"
          description="Login email code check email or resend"
          values={{
            resend: (
              <Link
                onClick={() => {
                  alert('Please note that only the latest code will work.');
                  setCodeSent(false);
                  setInvoice(undefined);
                  setPaymentId(undefined);
                }}
              >
                <FormattedMessage
                  defaultMessage="Resend Code"
                  description="Resend code next button"
                />
              </Link>
            ),
          }}
        />
      </Typography>
    </FlexBox>
  );
}
