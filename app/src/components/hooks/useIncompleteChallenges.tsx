import { WorldType } from 'infinitris2-models';
import { useUser } from '@/components/hooks/useUser';
import useOfficialChallenges, {
  getChallengePriority,
} from '@/components/hooks/useOfficialChallenges';
import React from 'react';

export default function useIncompleteChallenges(
  worldType: WorldType | undefined
) {
  const { data: officialChallenges, isValidating } =
    useOfficialChallenges(worldType);

  const isLoadingOfficialChallenges =
    !officialChallenges?.length && isValidating;

  const officialChallengesCount = officialChallenges?.length || 0;

  const user = useUser();
  const incompleteChallenges = React.useMemo(
    () =>
      (
        officialChallenges?.filter(
          (challenge) =>
            (user.completedOfficialChallengeIds || []).indexOf(challenge.id) < 0
        ) || []
      ).sort(
        (a, b) =>
          getChallengePriority(b.data()!) - getChallengePriority(a.data()!)
      ),
    [officialChallenges, user.completedOfficialChallengeIds]
  );
  return {
    incompleteChallenges,
    isLoadingOfficialChallenges,
    officialChallengesCount,
  };
}
