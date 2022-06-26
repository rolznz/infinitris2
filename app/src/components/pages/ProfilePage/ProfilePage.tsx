import React from 'react';
import { Button } from '@mui/material';

import FlexBox from '../../ui/FlexBox';
import { FormattedMessage, useIntl } from 'react-intl';

import useAuthStore from '../../../state/AuthStore';
import { Page } from '../../ui/Page';
import { openLoginDialog } from '@/state/DialogStore';
import { ProfilePageCharacterCard } from './ProfilePageCharacterCard';
import { CharacterHabitatBackground } from '@/components/ui/CharacterHabitatBackground';
import { useDocument } from 'swr-firestore';
import { useUser } from '@/components/hooks/useUser';
import { DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';
import { getCharacterPath, ICharacter } from 'infinitris2-models';
import { UserNicknameForm } from '@/components/pages/ProfilePage/UserNicknameForm';

export default function ProfilePage() {
  const intl = useIntl();
  const userId = useAuthStore().user?.uid;
  const user = useUser();
  /*const { data: userChallenges } = useCollection<IChallenge>(
    userId ? challengesPath : null,
    {MEMO
      where: [['userId', '==', userId]],
    }
  );*/
  const characterId = user.selectedCharacterId || DEFAULT_CHARACTER_ID;
  const { data: character } = useDocument<ICharacter>(
    getCharacterPath(characterId)
  );

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Profile',
        description: 'Profile title',
      })}
      whiteTitle
      background={<CharacterHabitatBackground character={character} />}
    >
      {!userId && (
        <Button
          color="primary"
          variant="contained"
          onClick={() => openLoginDialog()}
        >
          <FormattedMessage
            defaultMessage="Log in"
            description="User Profile Page - login button"
          />
        </Button>
      )}

      <FlexBox py={2}>
        {/* force refresh on login/logout/signup */}
        <UserNicknameForm key={user?.id + '-' + user?.readOnly?.nickname} />
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
