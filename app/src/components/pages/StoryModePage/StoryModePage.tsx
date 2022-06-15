import { useHistory } from 'react-router-dom';
import Routes from '../../../models/Routes';

import { RoomCarouselSlideProps } from '@/components/ui/RoomCarousel/RoomCarouselSlide';
import { RoomCarousel } from '@/components/ui/RoomCarousel/RoomCarousel';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import useOfficialChallenges from '@/components/hooks/useOfficialChallenges';

export function StoryModePage() {
  const history = useHistory();
  const officialChallenges = useOfficialChallenges().data;
  const [selectedSlide, setSelectedSlide] = React.useState(0);

  const slides: RoomCarouselSlideProps[] = React.useMemo(
    () =>
      officialChallenges?.map((challengeDoc) => ({
        key: challengeDoc.id,
        customText: challengeDoc.data().title || 'Untitled',
        worldType: challengeDoc.data().worldType || 'grass',
        worldVariation: challengeDoc.data().worldVariation || '0',
      })) || [],
    [officialChallenges]
  );

  const onSubmit = () => {
    const challenge = officialChallenges?.[selectedSlide];
    if (challenge) {
      history.push(`${Routes.challenges}/${challenge.id}`);
    }
  };

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
        0 // TODO: use first incompleted challenge
      }
      onChangeSlide={setSelectedSlide}
    />
  );
}
