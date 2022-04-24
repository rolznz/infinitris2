import React from 'react';

import { FormattedMessage } from 'react-intl';
import FlexBox from '../FlexBox';

import { getPaymentPath, IPayment } from 'infinitris2-models';
import Typography from '@mui/material/Typography';
import { LightningQR } from '@/components/ui/LightningQR';
import { useDocument, UseDocumentOptions } from 'swr-firestore';
import useLoginStore from '@/state/LoginStore';
import shallow from 'zustand/shallow';
import Link from '@mui/material/Link';
import { appName } from '@/utils/constants';

const paymentDocumentOptions: UseDocumentOptions = {
  listen: true,
};

export function PaymentStep() {
  const [invoice, paymentId, setCodeSent, setHasCreatedNewUser] = useLoginStore(
    (store) => [
      store.invoice!,
      store.paymentId,
      store.setCodeSent,
      store.setHasCreatedNewUser,
    ],
    shallow
  );

  const { data: payment } = useDocument<IPayment>(
    paymentId ? getPaymentPath(paymentId) : null,
    paymentDocumentOptions
  );

  React.useEffect(() => {
    if (payment?.data()?.status === 'completed') {
      setHasCreatedNewUser(true);
      setCodeSent(true);
    }
  }, [payment, setCodeSent, setHasCreatedNewUser]);

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
