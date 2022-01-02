import React from 'react';
import { Box, Button, SvgIcon, Typography } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import { useDocument } from 'swr-firestore';
import { getAffiliatePath, IAffiliate } from 'infinitris2-models';
import useAuthStore from '../../../state/AuthStore';
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard';
import { toast } from 'react-toastify';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { useUser } from '@/state/UserStore';
import { Page } from '../../ui/Page';
import { openLoginDialog } from '@/state/DialogStore';
import { appName } from '@/utils/constants';
import FlexBox from '../../ui/FlexBox';
import MailIcon from '@mui/icons-material/Mail';
import { ReactComponent as FacebookIcon } from '@/icons/facebook2.svg';

import { EmailShareButton, FacebookShareButton } from 'react-share';
import { RingIconButton } from '../../ui/RingIconButton';
import { borderColorLight, boxShadows } from '@/theme/theme';
import { CharacterImage } from '../Characters/CharacterImage';
import { AffiliatePageCharacter } from './AffiliatePageCharacter';

import friendImage from './assets/friend.svg';

/*const useStyles = makeStyles((theme) => ({
  shareButton: {
    display: 'flex',
  },
}));*/

const characterSize = 185;

export default function AffiliateProgramPage() {
  const classes = { shareButton: '' }; //useStyles();
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
      <Typography align="center" variant="body1">
        {userId ? (
          <FormattedMessage
            defaultMessage="Share {appName} with your friends to earn coins when they sign up!"
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
      <Box mt={2} />
      {(!userId || affiliateDoc) && (
        <FlexBox flexDirection="row" flexWrap="wrap" gap={1}>
          <RingIconButton
            padding="large"
            onClick={() => {
              //console.log(affiliateLink);
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
      <Box mt={2} />

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
