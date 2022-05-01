import { FormattedMessage } from 'react-intl';
import FlexBox from '../FlexBox';
import LoadingSpinner from '../LoadingSpinner';
import Typography from '@mui/material/Typography';
import { CodeForm } from '@/components/ui/Login/CodeForm';
import { EmailForm } from '@/components/ui/Login/EmailForm';
import useLoginStore from '@/state/LoginStore';
import shallow from 'zustand/shallow';
import { PaymentStep } from '@/components/ui/Login/PaymentStep';
import { NewUserStep } from '@/components/ui/Login/NewUserStep';
import React from 'react';

export interface LoginProps {
  onLogin?(userId: string): void;
  onClose?(): void;
}

export default function Login({ onLogin, onClose }: LoginProps) {
  const [isLoading, invoice, codeSent, isViewingBenefits] = useLoginStore(
    (store) => [
      store.isLoading,
      store.invoice,
      store.codeSent,
      store.viewingBenefits,
    ],
    shallow
  );

  const handleSuccess = React.useCallback(
    (userId: string) => {
      onLogin?.(userId);
      onClose?.();
    },
    [onLogin, onClose]
  );

  return (
    <FlexBox flex={1} pt={8} px={8}>
      <Typography variant="h5" align="center">
        {isViewingBenefits ? (
          <FormattedMessage
            defaultMessage="Infinitris Premium"
            description="Login page create new account (Infinitris Premium)"
          />
        ) : codeSent ? (
          <FormattedMessage
            defaultMessage="Email Verification"
            description="Login page Email Verification"
          />
        ) : invoice ? (
          <FormattedMessage
            defaultMessage="Payment"
            description="Login page pay invoice"
          />
        ) : (
          <FormattedMessage
            defaultMessage="Login"
            description="Login page title"
          />
        )}
      </Typography>

      {isLoading ? (
        <FlexBox flex={1} py={4}>
          <LoadingSpinner />
        </FlexBox>
      ) : codeSent ? (
        <CodeForm onSuccess={handleSuccess} />
      ) : isViewingBenefits ? (
        <NewUserStep />
      ) : invoice ? (
        <PaymentStep />
      ) : (
        <EmailForm />
      )}
    </FlexBox>
  );
}
