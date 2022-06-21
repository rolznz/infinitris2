import { useHistory } from 'react-router-dom';
import Routes from '../../../models/Routes';

import { RoomCarouselSlideProps } from '@/components/ui/RoomCarousel/RoomCarouselSlide';
import { RoomCarousel } from '@/components/ui/RoomCarousel/RoomCarousel';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import useOfficialChallenges from '@/components/hooks/useOfficialChallenges';
import { useUser } from '@/components/hooks/useUser';

export function StoryModePage() {
  const history = useHistory();
  const completedOfficialChallengeIds = useUser().completedOfficialChallengeIds;
  const officialChallenges = useOfficialChallenges().data;

  const slides: RoomCarouselSlideProps[] = React.useMemo(
    () =>
      officialChallenges?.map((challengeDoc, index) => ({
        key: challengeDoc.id,
        customText:
          (challengeDoc.data().worldType || 'grass') +
            ' ' +
            challengeDoc.data().title || 'Untitled',
        worldType: challengeDoc.data().worldType || 'grass',
        worldVariation: challengeDoc.data().worldVariation || '0',
        isLocked: index > (completedOfficialChallengeIds?.length || 0),
      })) || [],
    [officialChallenges, completedOfficialChallengeIds]
  );

  const onSubmit = (slideIndex: number) => {
    const challenge = officialChallenges?.[slideIndex];
    if (challenge) {
      history.push(`${Routes.challenges}/${challenge.id}`);
    }
  };

  if (!slides || !officialChallenges) {
    return null;
  }

  const firstIncompletedChallengeIndex = officialChallenges?.findIndex(
    (challenge) =>
      (completedOfficialChallengeIds || []).indexOf(challenge.id) < 0
  );

  // TODO: this should not be called "RoomCarousel"
  return (
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
        firstIncompletedChallengeIndex >= 0 ? firstIncompletedChallengeIndex : 0
      }
    />
  );
}
