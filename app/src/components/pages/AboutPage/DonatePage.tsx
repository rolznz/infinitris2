import FlexBox from '@/components/ui/FlexBox';
import { Page } from '@/components/ui/Page';
import { appName } from '@/utils/constants';
import { Typography, Box, Link, LinearProgress } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import QRCode from 'react-qr-code';
import { useTheme } from '@mui/material/styles';
import { white } from '@/theme';
import { toast } from 'react-toastify';
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard';
import { Timestamp } from 'infinitris2-models';
import { donationTarget, useDonations } from '@/components/hooks/useDonations';

const useStyles = makeStyles((theme) => ({}));

export default function AboutPage() {
  const classes = useStyles();
  const [, copy] = useCopyToClipboard();
  const intl = useIntl();
  const theme = useTheme();

  const { donations, monthDonationSum } = useDonations();

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Donate',
        description: 'Donate page title',
      })}
      narrow
    >
      <Typography align="center" variant="body1">
        <FormattedMessage
          defaultMessage="{appName} is open source and ad-free. Donations will fund future development and operating costs."
          description="Donate page description"
          values={{ appName }}
        />
      </Typography>
      <Box mt={2} />
      <Typography align="center" variant="body1">
        <FormattedMessage
          defaultMessage="You can send Bitcoin via the {lightningNetwork} to the below address. An easy way to get started is with the {walletOfSatoshi}."
          description="Donate page lightning QR info"
          values={{
            lightningNetwork: (
              <Link href="https://lightning.network/">Lightning Network</Link>
            ),
            walletOfSatoshi: (
              <Link href="https://www.walletofsatoshi.com/">
                Wallet of Satoshi
              </Link>
            ),
          }}
        />
      </Typography>
      {process.env.REACT_APP_LIGHTNING_DONATION && (
        <FlexBox
          width={400}
          my={4}
          maxWidth="100%"
          onClick={() => {
            copy(process.env.REACT_APP_LIGHTNING_DONATION!);
            toast(
              intl.formatMessage({
                defaultMessage: 'Address copied to clipboard',
                description:
                  'Lightning Donation Address copied to clipboard toast message',
              })
            );
          }}
        >
          <QRCode
            value={process.env.REACT_APP_LIGHTNING_DONATION}
            level="L"
            fgColor={white}
            bgColor={theme.palette.text.secondary}
          />
          <Box mt={4} />

          <Typography align="center" variant="body1">
            <FormattedMessage
              defaultMessage="This month's target: {monthDonationSum} / {donationTarget} sats"
              description="This month's donations progress"
              values={{
                monthDonationSum,
                donationTarget,
              }}
            />
          </Typography>
          <LinearProgress
            value={Math.min(monthDonationSum / donationTarget, 1) * 100}
            style={{ height: '19px', width: '200px' }}
            color="primary"
            variant="determinate"
          />
        </FlexBox>
      )}
      {donations && (
        <FlexBox>
          <Typography align="center" variant="h4">
            <FormattedMessage
              defaultMessage="Latest Donations"
              description="Latest Donations title"
            />
          </Typography>
          {donations.map((donation) => (
            <FlexBox key={donation.id}>
              <Typography variant="body1">
                {getTime(donation.data()!.createdTimestamp)} -{' '}
                <strong>{donation.data()!.amount} sats</strong> -{' '}
                {donation.data()!.comment || 'No comment'}
              </Typography>
            </FlexBox>
          ))}
        </FlexBox>
      )}
    </Page>
  );
}

function getTime(timestamp: Timestamp) {
  const date = new Date(0);
  date.setSeconds(timestamp.seconds);
  return date.toDateString();
}
