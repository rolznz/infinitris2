import React from 'react';
import { Link, SvgIcon, Typography } from '@mui/material';

import FlexBox from '../../ui/FlexBox';
import { FormattedMessage, useIntl } from 'react-intl';

import useAuthStore from '../../../state/AuthStore';
import { Page } from '../../ui/Page';
import { ProfilePageCharacterCard } from './ProfilePageCharacterCard';
import { CharacterHabitatBackground } from '@/components/ui/CharacterHabitatBackground';
import {
  useCollection,
  UseCollectionOptions,
  useDocument,
} from 'swr-firestore';
import { useUser } from '@/components/hooks/useUser';
import { DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';
import {
  challengesPath,
  getCharacterPath,
  IChallenge,
  ICharacter,
} from 'infinitris2-models';
import { UserNicknameForm } from '@/components/pages/ProfilePage/UserNicknameForm';
import { ReactComponent as PremiumPlayerIcon } from '@/icons/premium_player.svg';
import { ReactComponent as ImpactIcon } from '@/icons/impact.svg';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import { where } from 'firebase/firestore';
import { borderColorLight, borderRadiuses, colors } from '@/theme/theme';
import { CommunityChallengeCard } from '@/components/pages/ChallengesPage/ChallengeCard';

export default function ProfilePage() {
  const intl = useIntl();
  const userId = useAuthStore().user?.uid;
  const user = useUser();

  const userChallengesFilter: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [where('userId', '==', userId)],
    }),
    [userId]
  );

  const { data: userChallenges } = useCollection<IChallenge>(
    userId ? challengesPath : null,
    userChallengesFilter
  );
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
      {/* force refresh on login/logout/signup */}
      <UserNicknameForm key={user?.id + '-' + user?.readOnly?.nickname} />
      <FlexBox py={2}>
        <Link component={RouterLink} underline="none" to={Routes.premium}>
          <FlexBox flexDirection="row" gap={1}>
            <Typography sx={{ color: userId ? colors.premium : colors.guest }}>
              {userId ? (
                <FormattedMessage
                  defaultMessage="Premium Player"
                  description="Premium Player text"
                />
              ) : (
                <FormattedMessage
                  defaultMessage="Guest"
                  description="Guest text"
                />
              )}
            </Typography>
            <FlexBox
              sx={{ backgroundColor: borderColorLight }}
              borderRadius={borderRadiuses.full}
              p={0.5}
            >
              <SvgIcon fontSize="small">
                {userId ? <PremiumPlayerIcon /> : <ImpactIcon />}
              </SvgIcon>
            </FlexBox>
          </FlexBox>
        </Link>
      </FlexBox>
      <ProfilePageCharacterCard />

      {userChallenges?.length && (
        <FlexBox mt={2}>
          <Typography align="center">
            <FormattedMessage
              defaultMessage="{count} challenges created"
              description="Created challenges statistic"
              values={{ count: userChallenges?.length || 0 }}
            />
          </Typography>
          <FlexBox
            width="100%"
            flexWrap="wrap"
            flexDirection="row"
            justifyContent="flex-start"
          >
            {userChallenges.map((challenge) => (
              <FlexBox key={challenge.id} margin={4}>
                <CommunityChallengeCard challenge={challenge} />
              </FlexBox>
            ))}
          </FlexBox>
        </FlexBox>
      )}

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
