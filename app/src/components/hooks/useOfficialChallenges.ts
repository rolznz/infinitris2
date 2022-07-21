import { useCollection, UseCollectionOptions } from 'swr-firestore';
import {
  challengesPath,
  IChallenge,
  WorldType,
  WorldTypeValues,
  WorldVariationValues,
} from 'infinitris2-models';
import { where } from 'firebase/firestore';
import React from 'react';

export default function useOfficialChallenges(worldType?: WorldType) {
  const useOfficialChallengesOptions: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('isOfficial', '==', true),
        ...(worldType ? [where('worldType', '==', worldType)] : []),
      ],
    }),
    [worldType]
  );

  return useCollection<IChallenge>(
    challengesPath,
    useOfficialChallengesOptions
  );
}

export function getChallengePriority(challenge: IChallenge): number {
  const worldType = challenge.worldType || 'grass';
  const worldVariation = challenge.worldVariation || '0';

  return -(
    WorldTypeValues.indexOf(worldType) * WorldVariationValues.length +
    WorldVariationValues.indexOf(worldVariation)
  );
}
