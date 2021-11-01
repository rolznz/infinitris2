import FlexBox from '@/components/ui/FlexBox';
import { Page } from '@/components/ui/Page';
import { appName } from '@/utils/constants';
import { makeStyles, Typography, Box, Link } from '@material-ui/core';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import QRCode from 'react-qr-code';
import { useTheme } from '@material-ui/core/styles';
import { white } from '@/theme';

const useStyles = makeStyles((theme) => ({}));

export default function AboutPage() {
  const classes = useStyles();
  const intl = useIntl();
  const theme = useTheme();

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
        <FlexBox width={400} my={4} maxWidth="100%">
          <QRCode
            value={process.env.REACT_APP_LIGHTNING_DONATION}
            level="L"
            fgColor={white}
            bgColor={theme.palette.text.secondary}
          />
        </FlexBox>
      )}
    </Page>
  );
}
