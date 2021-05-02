import React, { useState } from 'react';
import { Box, Button, Typography } from '@material-ui/core';

import FlexBox from '../layout/FlexBox';
import { FormattedMessage, useIntl } from 'react-intl';

import useLoginRedirect from '../hooks/useLoginRedirect';
import {
  revalidateDocument,
  useCollection,
  useDocument,
} from '@nandorojo/swr-firestore';
import { IAffiliate, IUser } from 'infinitris2-models';
import useAuthStore from '../../state/AuthStore';
import { affiliatesPath, getUserPath } from '../../firebase';
import LoadingSpinner from '../LoadingSpinner';
import { useCopyToClipboard } from 'react-use';
import { toast } from 'react-toastify';
import FileCopyIcon from '@material-ui/icons/FileCopy';

export default function AffiliateProgramPage() {
  useLoginRedirect();
  const intl = useIntl();
  const [, copy] = useCopyToClipboard();
  const [isCreatingAffiliate, setIsCreatingAffiliate] = useState(false);

  //const [userStore, user] = useUserStore((store) => [store, store.user]);
  const userId = useAuthStore().user?.uid;

  const { data: fireStoreUserDoc } = useDocument<IUser>(
    userId ? getUserPath(userId) : null
  );

  var { add: addAffiliate } = useCollection<IAffiliate>(affiliatesPath);

  const affiliateId = fireStoreUserDoc?.affiliateId;

  /*const { data: affiliateDoc } = useDocument<IAffiliate>(
    affiliateId ? getAffiliatePath(affiliateId) : null
  );*/

  const affiliateLink = `${process.env.REACT_APP_URL}?ref=${affiliateId}`;

  /*useEffect(() => {

  }, [])*/

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
      <Box mt={4} />
      {isCreatingAffiliate || !fireStoreUserDoc ? (
        <FlexBox>
          <LoadingSpinner />
        </FlexBox>
      ) : fireStoreUserDoc && !affiliateId ? (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              setIsCreatingAffiliate(true);
              await addAffiliate({
                userId,
              });
              // wait for the firebase onCreateAffiliate function to run
              await new Promise((resolve) => setTimeout(resolve, 3000));
              // re-retrieve the user with updated affiliate ID
              await revalidateDocument(getUserPath(userId));
              setIsCreatingAffiliate(false);
            }}
          >
            <FormattedMessage
              defaultMessage="Generate Unique Link"
              description="Affiliate Program Page - Generate Unique Link"
            />
          </Button>
        </>
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
            {affiliateLink}
          </Button>

          {/* TODO: your link is: <copy> <share on> Facebook, Twitter */}
          {/* TODO: OG images for sharing */}
          {/* TODO: show number of conversions */}
          {/* TODO: show number of credits received */}
          {/* TODO: show next conversion will give you X credits */}
          {/* TODO: show next conversion will receive X credits */}
        </>
      )}
    </FlexBox>
  );
}
