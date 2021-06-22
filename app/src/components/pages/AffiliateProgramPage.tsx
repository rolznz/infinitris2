import React, { useState } from 'react';
import { Box, Button, Typography } from '@material-ui/core';

import FlexBox from '../ui/FlexBox';
import { FormattedMessage, useIntl } from 'react-intl';

import useLoginRedirect from '../hooks/useLoginRedirect';
import {
  revalidateDocument,
  useCollection,
  useDocument,
} from '@nandorojo/swr-firestore';
import { IAffiliate, IUser } from 'infinitris2-models';
import useAuthStore from '../../state/AuthStore';
import { affiliatesPath, getAffiliatePath, getUserPath } from '../../firebase';
import LoadingSpinner from '../LoadingSpinner';
import { useCopyToClipboard } from 'react-use';
import { toast } from 'react-toastify';
import FileCopyIcon from '@material-ui/icons/FileCopy';

export default function AffiliateProgramPage() {
  useLoginRedirect();
  const intl = useIntl();
  const [, copy] = useCopyToClipboard();

  //const [userStore, user] = useUserStore((store) => [store, store.user]);
  const userId = useAuthStore().user?.uid;

  const { data: fireStoreUserDoc } = useDocument<IUser>(
    userId ? getUserPath(userId) : null
  );

  var { add: addAffiliate } = useCollection<IAffiliate>(affiliatesPath);

  const affiliateId = fireStoreUserDoc?.readOnly.affiliateId;

  const { data: affiliateDoc } = useDocument<IAffiliate>(
    affiliateId ? getAffiliatePath(affiliateId) : null
  );

  const affiliateLink = `${process.env.REACT_APP_URL}?ref=${affiliateId}`;

  if (!fireStoreUserDoc?.id || fireStoreUserDoc.id !== userId) {
    // wait for the user profile to load
    return (
      <FlexBox flex={1}>
        <LoadingSpinner />
      </FlexBox>
    );
  }

  return (
    <FlexBox flex={1}>
      <Typography variant="h1" align="center">
        <FormattedMessage
          defaultMessage="Invite your Friends"
          description="Affiliate Program page title - invite your friends"
        />
      </Typography>
      <Box mt={4} />
      <Typography align="center">
        <FormattedMessage
          defaultMessage="Share the below link with your friends and you will both earn bonus credits when your friends sign up."
          description="Affiliate Program page title - invite your friends description"
        />
      </Typography>
      {affiliateDoc && (
        <Typography align="center" variant="caption">
          <FormattedMessage
            defaultMessage="Your next friend will receive a bonus of {signupRewardCredits} credits"
            description="Affiliate Program Page - affiliate count statistic"
            values={{
              signupRewardCredits:
                (affiliateDoc.readOnly?.referralCount || 0) + 3,
            }}
          />
        </Typography>
      )}
      <Box mt={4} />
      {!fireStoreUserDoc || !affiliateDoc ? (
        <FlexBox>
          <LoadingSpinner />
        </FlexBox>
      ) : (
        <>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileCopyIcon />}
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
            {affiliateLink.substring(affiliateLink.indexOf('://') + 3)}
          </Button>
          <Box mt={4} />
          <Typography align="center" variant="caption">
            <FormattedMessage
              defaultMessage="So far {affiliateCount} friends have signed up"
              description="Affiliate Program Page - affiliate count statistic"
              values={{
                affiliateCount: affiliateDoc.readOnly?.referralCount || 0,
              }}
            />
          </Typography>

          {/* TODO: OG images for sharing */}
        </>
      )}
    </FlexBox>
  );
}
