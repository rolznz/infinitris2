import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import FlexBox from '../../FlexBox';
import { InfoSlide } from '../InfoSlide';
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { useUser } from '@/components/hooks/useUser';
import { BuyCoinsResponse, getPaymentPath, IPayment } from 'infinitris2-models';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import Typography from '@mui/material/Typography/Typography';
import Box from '@mui/material/Box/Box';
import FormControl from '@mui/material/FormControl/FormControl';
import InputLabel from '@mui/material/InputLabel/InputLabel';
import Button from '@mui/material/Button/Button';
import Input from '@mui/material/Input/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { LightningQR } from '@/components/ui/LightningQR';
import useAuthStore from '@/state/AuthStore';
import { useDocument, UseDocumentOptions } from 'swr-firestore';

const schema = yup
  .object({
    amount: yup.number().positive().required(),
  })
  .required();

type BuyCoinsFormData = {
  amount: number | undefined;
};

const paymentDocumentOptions: UseDocumentOptions = {
  listen: true,
};

export function CoinInfoBuyCoinsSlide() {
  const [isLoading, setIsLoading] = React.useState(false);
  const authUserId = useAuthStore((authStore) => authStore.user?.uid);
  const [invoice, setInvoice] = React.useState<string | undefined>();
  const [paymentId, setPaymentId] = React.useState<string | undefined>();
  const { data: payment } = useDocument<IPayment>(
    paymentId ? getPaymentPath(paymentId) : null,
    paymentDocumentOptions
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<BuyCoinsFormData>({
    defaultValues: {},
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = React.useCallback(
    async (data: BuyCoinsFormData) => {
      if (!authUserId) {
        alert('Please login');
        return;
      }
      if (process.env.REACT_APP_API_URL) {
        setIsLoading(true);
        const buyCoinsResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/v1/coins`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Origin: window.location.origin,
            },
            body: JSON.stringify({
              ...data,
              userId: authUserId,
            }),
          }
        );

        if (buyCoinsResponse.ok) {
          const responseData: BuyCoinsResponse = await buyCoinsResponse.json();
          setInvoice(responseData.invoice);
          setPaymentId(responseData.paymentId);
        } else if (buyCoinsResponse.status === 429) {
          alert('Please try again in a minute.');
        } else {
          alert(
            'Failed to create invoice: ' +
              buyCoinsResponse.status +
              ' ' +
              buyCoinsResponse.statusText +
              '\nPlease try again.'
          );
        }
        setIsLoading(false);
      }
    },
    [setIsLoading, setInvoice, setPaymentId, authUserId]
  );

  const coins = useUser().readOnly?.coins || 0;
  return (
    <InfoSlide
      title={
        <FormattedMessage
          defaultMessage="Buy coins"
          description="Coin info buy coins slide title"
        />
      }
      titleAppend={
        <SvgIcon style={{ fontSize: '60px' }}>
          <CoinIcon />
        </SvgIcon>
      }
      content={
        <FlexBox height="100%">
          <Typography variant="body2">
            <FormattedMessage
              defaultMessage="You currently have {coins} coins"
              description="Coin info buy slide - your amount"
              values={{ coins }}
            />
          </Typography>
          <Box mt={2} />
          {isLoading ? (
            <LoadingSpinner />
          ) : payment?.data()?.status === 'completed' ? (
            <FlexBox>
              <Typography variant="body2" mb={1}>
                <FormattedMessage
                  defaultMessage="Payment successful"
                  description="Coin info buy slide - Payment successful"
                  values={{ coins }}
                />
              </Typography>
            </FlexBox>
          ) : invoice ? (
            <FlexBox>
              <Typography variant="body2" mb={1}>
                <FormattedMessage
                  defaultMessage="Scan the below code to pay"
                  description="Coin info buy slide - pay instructions"
                  values={{ coins }}
                />
              </Typography>
              <FlexBox width={100} p={1}>
                <LightningQR value={invoice} />
              </FlexBox>
            </FlexBox>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <FlexBox width={240}>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <FormControl variant="standard" fullWidth>
                      <InputLabel>Coins</InputLabel>
                      <Input {...field} fullWidth />
                      <p>{errors.amount?.message}</p>
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
                    defaultMessage="Buy"
                    description="Purchase coins buy button text"
                  />
                </Button>
              </FlexBox>
            </form>
          )}
          <Box flex={1} />
        </FlexBox>
      }
    />
  );
}
