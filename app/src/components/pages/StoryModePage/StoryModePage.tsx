import { useHistory } from 'react-router-dom';
import Routes from '../../../models/Routes';

import { RoomCarouselSlideProps } from '@/components/ui/RoomCarousel/RoomCarouselSlide';
import { RoomCarousel } from '@/components/ui/RoomCarousel/RoomCarousel';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import useOfficialChallenges, {
  getChallengePriority,
} from '@/components/hooks/useOfficialChallenges';
import { useUser } from '@/components/hooks/useUser';
import { IChallenge, WorldVariationValues } from 'infinitris2-models';
import FlexBox from '@/components/ui/FlexBox';
import Typography from '@mui/material/Typography';
import { ChallengeTopAttempts } from '@/components/pages/ChallengePage/ChallengeTopAttempts';
import { MobileRotateDevice } from '@/components/game/GameUI';

export function StoryModePage() {
  const history = useHistory();
  const completedOfficialChallengeIds = useUser().completedOfficialChallengeIds;
  const officialChallenges = useOfficialChallenges().data;
  const sortedOfficialChallenges = React.useMemo(
    () =>
      officialChallenges?.sort(
        (a, b) =>
          getChallengePriority(b.data()!) - getChallengePriority(a.data()!)
      ),
    [officialChallenges]
  );

  const slides: RoomCarouselSlideProps[] = React.useMemo(
    () =>
      sortedOfficialChallenges?.map(
        (challengeDoc, index) =>
          ({
            id: challengeDoc.id,
            customText: (
              <FlexBox alignItems="flex-start" mb={1}>
                <Typography variant="h1">
                  {getOfficialChallengeTitle(challengeDoc.data())}
                </Typography>
                <ChallengeTopAttempts
                  challengeId={challengeDoc.id}
                  challenge={challengeDoc.data()}
                />
              </FlexBox>
            ),
            worldType: challengeDoc.data().worldType || 'grass',
            worldVariation: challengeDoc.data().worldVariation || '0',
            isLocked: index > (completedOfficialChallengeIds?.length || 0),
            grid: challengeDoc.data().grid,
            gameModeType: challengeDoc.data().simulationSettings?.gameModeType,
          } as RoomCarouselSlideProps)
      ) || [],
    [sortedOfficialChallenges, completedOfficialChallengeIds]
  );

  const onSubmit = (slideIndex: number) => {
    const challenge = sortedOfficialChallenges?.[slideIndex];
    if (challenge) {
      history.push(`${Routes.challenges}/${challenge.id}`);
    }
  };

  if (!slides || !sortedOfficialChallenges) {
    return null;
  }

  const firstIncompletedChallengeIndex = sortedOfficialChallenges?.findIndex(
    (challenge) =>
      (completedOfficialChallengeIds || []).indexOf(challenge.id) < 0
  );

  // TODO: this should not be called "RoomCarousel"
  return (
    <>
      <MobileRotateDevice />
      <RoomCarousel
        title={
          <FormattedMessage
            defaultMessage="Story Mode"
            description="Story mode page title"
          />
        }
        //secondaryIcon={<SettingsIcon />}
        //secondaryIconLink={Routes.singlePlayerOptions}
        onPlay={onSubmit}
        slides={slides}
        initialStep={
          firstIncompletedChallengeIndex >= 0
            ? firstIncompletedChallengeIndex
            : 0
        }
      />
    </>
  );
}
export function getOfficialChallengeTitle(challenge: IChallenge): string {
  const worldVariation = challenge.worldVariation || '0';
  const stageNumber = WorldVariationValues.indexOf(worldVariation) + 1;

  return (
    (challenge.worldType || 'grass') + ' ' + romanizeChallengeStage(stageNumber)
  );
}

function romanizeChallengeStage(num: number) {
  switch (num) {
    case 1:
      return 'I';
    case 2:
      return 'II';
    case 3:
      return 'III';
    case 4:
      return 'IV';
    case 5:
      return 'V';
    default:
      throw new Error('Unsupported challenge stage number');
  }
}
