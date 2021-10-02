import { Page } from '@/components/ui/Page';
import { appName } from '@/utils/constants';
import { makeStyles, Typography, Box, Link } from '@material-ui/core';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles((theme) => ({
  shareButton: {
    display: 'flex',
  },
}));

export default function AboutPage() {
  const classes = useStyles();

  return (
    <Page
      title={
        <FormattedMessage
          defaultMessage="Donate"
          description="Donate page title"
        />
      }
      narrow
    >
      <Typography align="center" variant="body1">
        <FormattedMessage
          defaultMessage="{appName} is open source, ad-free, and will always be free to play. Donations will fund future development and operating costs."
          description="Donate page description"
          values={{ appName }}
        />
      </Typography>
      <Box mt={4} />
      <Typography align="center" variant="body1">
        <FormattedMessage
          defaultMessage="Please {email} if you would like to make a donation."
          description="Donate page contact info"
          values={{
            email: (
              <Link href="mailto:infinitris2@googlegroups.com">
                send an email
              </Link>
            ),
          }}
        />
      </Typography>
    </Page>
  );
}
