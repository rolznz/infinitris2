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
import { setDoc, getFirestore, doc } from 'firebase/firestore';
import { getConversionPath, IConversion } from 'infinitris2-models';
import { toast } from 'react-toastify';
import Link from '@mui/material/Link';

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
  const [referredByAffiliateId, , deleteReferredByAffiliateId] =
    useLocalStorage<string>(localStorageKeys.referredByAffiliateId, undefined, {
      raw: true,
    });
  const [setIsLoading, email, setCodeSent, setInvoice, setPaymentId] =
    useLoginStore(
      (store) => [
        store.setIsLoading,
        store.email,
        store.setCodeSent,
        store.setInvoice,
        store.setPaymentId,
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
              code: data.code,
            }),
          }
        );

        if (loginResponse.ok) {
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

          toast(
            intl.formatMessage({
              defaultMessage: 'Logged in successfully',
              description: 'Thanks for rating toast message',
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
            sx={{ width: '100%' }}
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
