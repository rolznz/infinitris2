import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { challengesPath, IChallenge } from 'infinitris2-models';
import React from 'react';

import FlexBox from '../../ui/FlexBox';
import ChallengeCard from './ChallengeCard';
import { where } from 'firebase/firestore';

// TODO: support multiple filter types
const challengesFilter: UseCollectionOptions = {
  constraints: [where('isOfficial', '==', false)],
};

export function ChallengesPage() {
  const { data: challenges } = useCollection<IChallenge>(
    challengesPath,
    challengesFilter
  );
  return (
    <FlexBox flex={1} padding={10} flexWrap="wrap" flexDirection="row">
      {challenges
        ?.filter((challenge) => challenge.data()!.isPublished)
        .sort((a, b) => (b.data()!.priority || 0) - (a.data()!.priority || 0))
        .map((challenge) => (
          <FlexBox key={challenge.id} margin={4}>
            <ChallengeCard challenge={challenge} />
          </FlexBox>
        ))}
    </FlexBox>
  );
}
