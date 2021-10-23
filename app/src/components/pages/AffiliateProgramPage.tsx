import React from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  makeStyles,
  SvgIcon,
  Typography,
} from '@material-ui/core';

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
import { appName } from '@/utils/constants';
import FlexBox from '../ui/FlexBox';
import MailIcon from '@material-ui/icons/Mail';
import { ReactComponent as FacebookIcon } from '@/icons/facebook2.svg';

import { EmailShareButton, FacebookShareButton } from 'react-share';
import { RingIconButton } from '../ui/RingIconButton';

const useStyles = makeStyles((theme) => ({
  shareButton: {
    display: 'flex',
  },
}));

export default function AffiliateProgramPage() {
  const classes = useStyles();
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
      title={intl.formatMessage({
        defaultMessage: 'Share & earn',
        description: 'Affiliate Program page title - share and earn',
      })}
      narrow
    >
      <Typography align="center" variant="body1">
        {userId ? (
          <FormattedMessage
            defaultMessage="Share {appName} with your friends and you will both earn rewards when they sign up."
            description="Affiliate Program page title - invite your friends logged in description"
            values={{ appName }}
          />
        ) : (
          <FormattedMessage
            defaultMessage="You're not logged in. You can still share {appName} with your friends, but you won't receive any rewards."
            description="Affiliate Program page title - invite your friends logged out description"
            values={{ appName }}
          />
        )}
      </Typography>
      {!userId && (
        <>
          <Box mt={2} />
          <Button color="primary" variant="contained" onClick={openLoginDialog}>
            <FormattedMessage
              defaultMessage="Log in"
              description="Affiliate Program Page - login button"
            />
          </Button>
        </>
      )}
      <Box mt={4} />
      {(!userId || affiliateDoc) && (
        <FlexBox flexDirection="row" flexWrap="wrap" gridGap={10}>
          <RingIconButton
            padding="large"
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
            <FileCopyIcon color="primary" fontSize="large" />
          </RingIconButton>
          <RingIconButton padding="large">
            <EmailShareButton
              className={classes.shareButton}
              url={affiliateLink}
              subject={intl.formatMessage(
                {
                  defaultMessage: 'Join me on {appName}',
                  description: 'email share button subject',
                },
                { appName }
              )}
            >
              <MailIcon color="primary" fontSize="large" />
            </EmailShareButton>
          </RingIconButton>
          <RingIconButton padding="large">
            <FacebookShareButton url={affiliateLink}>
              <SvgIcon
                color="primary"
                fontSize="large"
                className={classes.shareButton}
              >
                <FacebookIcon />
              </SvgIcon>
            </FacebookShareButton>
          </RingIconButton>
        </FlexBox>
      )}
      <Box mt={4} />

      {affiliateDoc && (
        <>
          <Typography align="center" variant="h4">
            <FormattedMessage
              defaultMessage="Next Signup"
              description="Affiliate Program Page - your next share"
            />
          </Typography>
          <FlexBox flexDirection="row" mt={2}>
            <Typography align="center" variant="h6">
              <FormattedMessage
                defaultMessage="You: {referralRewardCredits}"
                description="Affiliate Program Page - referral reward statistic"
                values={{
                  referralRewardCredits:
                    (affiliateDoc.readOnly?.numConversions || 0) + 3,
                  signupRewardCredits: 3,
                }}
              />
            </Typography>
            <Box mx={2} />
            <Divider orientation="vertical" />
            <Box mx={2} />
            <Typography align="center" variant="h6">
              <FormattedMessage
                defaultMessage="Friend: {signupRewardCredits}"
                description="Affiliate Program Page - referral reward statistic"
                values={{
                  referralRewardCredits:
                    (affiliateDoc.readOnly?.numConversions || 0) + 3,
                  signupRewardCredits: 3,
                }}
              />
            </Typography>
          </FlexBox>
          <Box mt={4} />
          <Typography align="center" variant="caption">
            <FormattedMessage
              defaultMessage="So far {affiliateCount} friends have signed up"
              description="Affiliate Program Page - affiliate count statistic"
              values={{
                affiliateCount: affiliateDoc?.readOnly.numConversions || 0,
              }}
            />
          </Typography>
        </>
      )}

      {/* TODO: OG images for sharing */}
    </Page>
  );
}
