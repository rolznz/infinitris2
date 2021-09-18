import React from 'react';
import { Box, Button, IconButton, Typography } from '@material-ui/core';

import { FormattedMessage, useIntl } from 'react-intl';

import { useDocument } from '@nandorojo/swr-firestore';
import { getAffiliatePath, IAffiliate } from 'infinitris2-models';
import useAuthStore from '../../state/AuthStore';
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard';
import { toast } from 'react-toastify';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { useUser } from '@/state/UserStore';
import { Page } from '../ui/Page';
import useDialogStore, { openLoginDialog } from '@/state/DialogStore';

export default function AffiliateProgramPage() {
  const intl = useIntl();
  const [, copy] = useCopyToClipboard();

  const user = useUser();
  const userId = useAuthStore().user?.uid;

  const affiliateId = user.readOnly?.affiliateId;

  const { data: affiliateDoc } = useDocument<IAffiliate>(
    affiliateId ? getAffiliatePath(affiliateId) : null
  );

  const affiliateLink = `${window.location.origin}${
    affiliateId ? `?ref=${affiliateId}` : ''
  }`;

  return (
    <Page
      title={
        <FormattedMessage
          defaultMessage="Share & earn"
          description="Affiliate Program page title - share and earn"
        />
      }
    >
      <Typography align="center">
        {userId ? (
          <FormattedMessage
            defaultMessage="Share the below link with your friends and you will both earn bonus coins when your friends sign up."
            description="Affiliate Program page title - invite your friends description"
          />
        ) : (
          <FormattedMessage
            defaultMessage="Share the below link with your friends"
            description="Affiliate Program page title - invite your friends description"
          />
        )}
      </Typography>
      {affiliateDoc && (
        <Typography align="center" variant="caption">
          <FormattedMessage
            defaultMessage="You and your next friend will both receive a bonus of {signupRewardCredits} coins"
            description="Affiliate Program Page - affiliate count statistic"
            values={{
              signupRewardCredits:
                (affiliateDoc.readOnly?.numConversions || 0) + 1,
            }}
          />
        </Typography>
      )}
      <Box mt={4} />
      {
        <>
          <IconButton
            onClick={() => {
              copy(affiliateLink);
              toast(
                intl.formatMessage({
                  defaultMessage: 'Link copied to clipboard',
                  description:
                    'Affiliate Link copied to clipboard toast message',
                })
              );
            }}
          >
            <FileCopyIcon fontSize="large" />
          </IconButton>
          <Box mt={4} />
          {userId ? (
            <Typography align="center" variant="caption">
              <FormattedMessage
                defaultMessage="So far {affiliateCount} friends have signed up"
                description="Affiliate Program Page - affiliate count statistic"
                values={{
                  affiliateCount: affiliateDoc?.readOnly.numConversions || 0,
                }}
              />
            </Typography>
          ) : (
            <Button
              color="primary"
              variant="contained"
              onClick={openLoginDialog}
            >
              <FormattedMessage
                defaultMessage="Log in to earn"
                description="Affiliate Program Page - affiliate count statistic"
                values={{
                  affiliateCount: affiliateDoc?.readOnly.numConversions || 0,
                }}
              />
            </Button>
          )}

          {/* TODO: OG images for sharing */}
        </>
      }
    </Page>
  );
}
