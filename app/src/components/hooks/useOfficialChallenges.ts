import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { challengesPath, IChallenge, WorldType } from 'infinitris2-models';
import { orderBy, where } from 'firebase/firestore';
import React from 'react';

export default function useOfficialChallenges(worldType?: WorldType) {
  const useIncompleteChallengesOptions: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('isOfficial', '==', true),
        orderBy('priority', 'desc'),
        ...(worldType ? [where('worldType', '==', worldType)] : []),
      ],
    }),
    [worldType]
  );

  return useCollection<IChallenge>(
    challengesPath,
    useIncompleteChallengesOptions
  );
}
