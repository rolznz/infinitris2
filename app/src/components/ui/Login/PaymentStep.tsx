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
  signInWithCustomToken,
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
import { useDocument, UseDocumentOptions } from 'swr-firestore';
import { CodeForm } from '@/components/ui/Login/CodeForm';
import { EmailForm } from '@/components/ui/Login/EmailForm';
import useLoginStore from '@/state/LoginStore';
import shallow from 'zustand/shallow';
import Link from '@mui/material/Link';
import { appName } from '@/utils/constants';

const paymentDocumentOptions: UseDocumentOptions = {
  listen: true,
};

export function PaymentStep() {
  const [invoice, paymentId, setCodeSent] = useLoginStore(
    (store) => [store.invoice!, store.paymentId, store.setCodeSent],
    shallow
  );

  const { data: payment } = useDocument<IPayment>(
    paymentId ? getPaymentPath(paymentId) : null,
    paymentDocumentOptions
  );

  React.useEffect(() => {
    if (payment?.data()?.status === 'completed') {
      setCodeSent(true);
    }
  }, [payment, setCodeSent]);

  return (
    <FlexBox width={400} my={4} maxWidth="100%">
      <Typography variant="body2" align="center" mb={2}>
        <FormattedMessage
          defaultMessage="We require a small payment in Satoshis to prevent spam and support the creators of {appName}."
          description="Prove humanity reason"
          values={{ appName }}
        />
      </Typography>

      <Typography align="center" variant="body2" mb={2}>
        <FormattedMessage
          defaultMessage="To pay, scan the below address with a Lightning Wallet. An easy way to get started is with the {walletOfSatoshi}."
          description="Payment step instructions"
          values={{
            walletOfSatoshi: (
              <Link href="https://www.walletofsatoshi.com/">
                Wallet of Satoshi
              </Link>
            ),
          }}
        />
      </Typography>

      <LightningQR value={invoice} />
    </FlexBox>
  );
}
