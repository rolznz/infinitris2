import FlexBox from '@/components/ui/FlexBox';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import useLoginStore from '@/state/LoginStore';
import shallow from 'zustand/shallow';
// import { CreateUserResponse } from 'infinitris2-models';
import { keepUnderlineClassName } from '@/theme/theme';

const schema = yup
  .object({
    email: yup.string().email().required(),
  })
  .required();

type LoginFormData = {
  email: string;
};

export function EmailForm() {
  const [setIsLoading, setCodeSent, setPaymentId, setInvoice, setEmail, email] =
    useLoginStore(
      (store) => [
        store.setIsLoading,
        store.setCodeSent,
        store.setPaymentId,
        store.setInvoice,
        store.setEmail,
        store.email,
      ],
      shallow
    );
  const [formData, setFormData] = React.useState<LoginFormData>({
    email,
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    defaultValues: formData,
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = React.useCallback(
    async (data: LoginFormData) => {
      setEmail(data.email);
      setFormData(data);
      setIsLoading(true);
      if (process.env.REACT_APP_API_URL) {
        const loginResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/v1/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Origin: window.location.origin,
            },
            body: JSON.stringify(data),
          }
        );

        if (loginResponse.ok) {
          setCodeSent(true);
        } else if (loginResponse.status === 429) {
          alert('Please try again in a minute.');
        } else if (loginResponse.status === 404) {
          const createUserResponse = (await (
            await fetch(`${process.env.REACT_APP_API_URL}/v1/users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
          ).json()) as any;
          console.log('Create user response', createUserResponse);
          if (createUserResponse.invoice) {
            setPaymentId(createUserResponse.paymentId);
            setInvoice(createUserResponse.invoice);
          } else {
            alert('Failed to request invoice');
          }
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
    [setEmail, setIsLoading, setCodeSent, setPaymentId, setInvoice]
  );

  return (
    <FlexBox>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FlexBox width={300}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormControl variant="standard" fullWidth>
                <InputLabel>Email</InputLabel>
                <Input
                  {...field}
                  autoFocus
                  fullWidth
                  className={keepUnderlineClassName}
                />
                <p>{errors.email?.message}</p>
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
              description="login with email next button text"
            />
          </Button>
        </FlexBox>
      </form>
    </FlexBox>
  );
}
