import React from 'react';
import { Box, Button, Link, SvgIcon, Typography } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import { useDocument } from 'swr-firestore';
import { getAffiliatePath, IAffiliate } from 'infinitris2-models';
import useAuthStore from '../../../state/AuthStore';
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard';
import { toast } from 'react-toastify';
import ShareIcon from '@mui/icons-material/Share';
import { useUser } from '@/state/UserStore';
import { Page } from '../../ui/Page';
import { openLoginDialog } from '@/state/DialogStore';
import { appName } from '@/utils/constants';
import FlexBox from '../../ui/FlexBox';
import { borderColorLight, boxShadows } from '@/theme/theme';
import { CharacterImage } from '../Characters/CharacterImage';
import { AffiliatePageCharacter } from './AffiliatePageCharacter';

import friendImage from './assets/friend.svg';

const characterSize = 185;

export default function AffiliateProgramPage() {
  const intl = useIntl();
  const [, copy] = useCopyToClipboard();

  const user = useUser();
  const userId = useAuthStore().user?.uid;

  const affiliateId = user.readOnly?.affiliateId;

  const { data: affiliateDoc } = useDocument<IAffiliate>(
    affiliateId ? getAffiliatePath(affiliateId) : null
  );

  console.log('Affiliate doc: ', affiliateDoc, affiliateId, user);

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
      {userId && (
        <Typography align="center" variant="body1">
          <FormattedMessage
            defaultMessage="Share {appName} with your friends to earn coins when they sign up!"
            description="Affiliate Program page title - invite your friends logged in description"
            values={{ appName }}
          />
        </Typography>
      )}
      <Box mt={2} />
      {(!userId || affiliateDoc) && (
        <FlexBox flexDirection="row" flexWrap="wrap" gap={1}>
          <Button
            sx={{ p: 2, gap: 1 }}
            variant="contained"
            onClick={() => {
              //console.log(affiliateLink);
              try {
                navigator.share({
                  title: appName,
                  url: affiliateLink,
                });
              } catch (error) {
                console.error('Failed to use native share', error);
                copy(affiliateLink);
                toast(
                  intl.formatMessage({
                    defaultMessage: 'Link copied to clipboard',
                    description:
                      'Affiliate Link copied to clipboard toast message',
                  })
                );
              }
            }}
          >
            <ShareIcon color="primary" />
            <Typography align="center" variant="body1">
              <FormattedMessage
                defaultMessage="Share"
                description="Affiliate Program page - share button text"
              />
            </Typography>
          </Button>
        </FlexBox>
      )}

      {!userId ? (
        <Typography textAlign="center" mt={4} variant="caption">
          <FormattedMessage
            defaultMessage="{login} to earn impact points and coins when your friends sign up."
            description="Affiliate Program page title - invite your friends logged out description"
            values={{
              login: (
                <Link onClick={openLoginDialog}>
                  <FormattedMessage
                    defaultMessage="Log in"
                    description="Affiliate Program Page - login button"
                  />
                </Link>
              ),
            }}
          />
        </Typography>
      ) : (
        <Box mt={2} />
      )}

      {affiliateDoc && (
        <>
          <FlexBox
            borderRadius={20}
            paddingX={2}
            paddingY={0.5}
            gap={0.5}
            flexDirection="row"
            style={{
              backgroundColor: borderColorLight,
              boxShadow: boxShadows.small,
            }}
            mb={1}
            mt={2}
          >
            <Typography align="center" variant="h4">
              <FormattedMessage
                defaultMessage="Next Signup"
                description="Affiliate Program Page - your next share"
              />
            </Typography>
          </FlexBox>
          <FlexBox flexDirection="row" mt={2} mx={-20}>
            <AffiliatePageCharacter
              title={
                <FormattedMessage
                  defaultMessage="You"
                  description="Affiliate Program Page - you header"
                />
              }
              characterImage={
                <CharacterImage characterId="0" width={characterSize} />
              }
              coins={1}
              impact={1}
              plus
            />
            <AffiliatePageCharacter
              title={
                <FormattedMessage
                  defaultMessage="Friend"
                  description="Affiliate Program Page - friend header"
                />
              }
              characterImage={
                <img src={friendImage} alt="friend" width={characterSize} />
              }
              coins={3}
            />
          </FlexBox>
          <Box mt={4} />
          <Typography align="center" variant="caption">
            <FormattedMessage
              defaultMessage="So far {affiliateCount} friends have signed up"
              description="Affiliate Program Page - affiliate count statistic"
              values={{
                affiliateCount:
                  affiliateDoc.data()?.readOnly.numConversions || 0,
              }}
            />
          </Typography>
        </>
      )}
    </Page>
  );
}
