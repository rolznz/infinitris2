import FlexBox from '@/components/ui/FlexBox';
import { Page } from '@/components/ui/Page';
import { appName } from '@/utils/constants';
import { Typography, Box, Link, LinearProgress, SvgIcon } from '@mui/material';

import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import QRCode from 'react-qr-code';
import { useTheme } from '@mui/material/styles';
import { colors, zIndexes } from '@/theme/theme';
import { toast } from 'react-toastify';
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard';
import { Timestamp } from 'infinitris2-models';
import { donationTarget, useDonations } from '@/components/hooks/useDonations';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function AboutPage() {
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
      <Typography align="center" variant="body2">
        <FormattedMessage
          defaultMessage="{appName} is open source and ad-free. Donations will fund future development and operating costs."
          description="Donate page description"
          values={{ appName }}
        />
      </Typography>
      <Box mt={2} />
      <Typography align="center" variant="body2">
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
        <FlexBox width={400} my={4} maxWidth="100%">
          <QRCode
            value={process.env.REACT_APP_LIGHTNING_DONATION}
            level="L"
            fgColor={colors.white}
            bgColor={theme.palette.text.secondary}
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
          />
          <Typography align="center" variant="caption" mt={1}>
            Payments powered by <Link href="https://lnbits.com/">lnbits</Link>
          </Typography>
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
          <FlexBox alignItems="flex-start" position="relative">
            <FlexBox
              height="100%"
              flexDirection="row"
              position="absolute"
              style={{ zIndex: zIndexes.above }}
              pl={1}
            >
              <SvgIcon sx={{ color: colors.white, fontSize: '12px' }}>
                <FavoriteIcon />
              </SvgIcon>
              {/* <Typography align="center" variant="caption" color="primary">
                {(monthDonationSum * 100) / donationTarget}%
              </Typography> */}
            </FlexBox>
            <LinearProgress
              value={Math.min(monthDonationSum / donationTarget, 1) * 100}
              style={{
                height: '19px',
                width: '200px',
                opacity: 0.3,
              }}
              color="primary"
              variant="determinate"
            />
          </FlexBox>
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
