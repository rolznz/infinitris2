import React from 'react';
import { Button } from '@material-ui/core';

import FlexBox from '../../ui/FlexBox';
import { FormattedMessage, useIntl } from 'react-intl';

import { useUserStore } from '../../../state/UserStore';
import { useCollection } from 'swr-firestore';
import { challengesPath, IChallenge } from 'infinitris2-models';
import useAuthStore from '../../../state/AuthStore';
import { Page } from '../../ui/Page';
import { openLoginDialog } from '@/state/DialogStore';
import { ProfilePageCharacterCard } from './ProfilePageCharacterCard';

export default function ProfilePage() {
  const intl = useIntl();
  const [userStore, user] = useUserStore((store) => [store, store.user]);
  const userId = useAuthStore().user?.uid;
  /*const { data: userChallenges } = useCollection<IChallenge>(
    userId ? challengesPath : null,
    {
      where: [['userId', '==', userId]],
    }
  );*/

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Profile',
        description: 'Profile title',
      })}
      useGradient
    >
      {!userId && (
        <Button color="primary" variant="contained" onClick={openLoginDialog}>
          <FormattedMessage
            defaultMessage="Log in"
            description="User Profile Page - login button"
          />
        </Button>
      )}

      <FlexBox py={2}>
        <ProfilePageCharacterCard />
      </FlexBox>

      {/* <Typography align="center">
        <FormattedMessage
          defaultMessage="{count} challenges completed"
          description="Completed challenges statistic"
          values={{
            count: 0,//FIXME: add backend counter user.completedChallengeIds.length
          }}
        />
      </Typography>

      <Typography align="center">
        <FormattedMessage
          defaultMessage="{count} challenges created"
          description="Created challenges statistic"
          values={{ count: userChallenges?.length || 0 }}
        />
      </Typography>

      <FlexBox flexDirection="row">
        <Typography align="center">
          <FormattedMessage
            defaultMessage="{count} coins available"
            description="User coins statistic"
            values={{ count: user.readOnly?.coins || 0 }}
          />
        </Typography>
        <Box ml={1} />
        <Link component={RouterLink} underline="none" to={Routes.earnCoins}>
          <Typography align="center">
            <FormattedMessage
              defaultMessage="Earn coins"
              description="Earn coins link"
            />
          </Typography>
        </Link>
      </FlexBox>
      <Typography align="center">
        <FormattedMessage
          defaultMessage="Network impact: {networkImpact}"
          description="Network impact statistic"
          values={{ networkImpact: user.readOnly?.networkImpact || 0 }}
        />
      </Typography> */}
    </Page>
  );
}
