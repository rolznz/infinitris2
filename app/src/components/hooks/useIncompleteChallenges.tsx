import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { challengesPath, IChallenge, WorldType } from 'infinitris2-models';
import { where } from 'firebase/firestore';
import { useUser } from '@/components/hooks/useUser';
import React from 'react';
//import { useUser } from '../../state/UserStore';

export default function useIncompleteChallenges(
  worldType: WorldType | undefined
) {
  const useIncompleteChallengesOptions: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('isOfficial', '==', true) /*, orderBy('priority', 'desc')*/,
        where('worldType', '==', worldType), // TODO: accept as argument
      ],
    }),
    [worldType]
  );

  const { data: officialChallenges, isValidating } = useCollection<IChallenge>(
    worldType ? challengesPath : null,
    useIncompleteChallengesOptions
  );

  const isLoadingOfficialChallenges =
    !officialChallenges?.length && isValidating;

  const user = useUser();
  const incompleteChallenges = (
    officialChallenges?.filter(
      (challenge) =>
        (user.completedOfficialChallengeIds || []).indexOf(challenge.id) < 0
    ) || []
  ).sort((a, b) => (b.data()!.priority || 0) - (a.data()!.priority || 0));
  return { incompleteChallenges, isLoadingOfficialChallenges };
}
