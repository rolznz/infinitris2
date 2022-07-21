import { WorldType } from 'infinitris2-models';
import { useUser } from '@/components/hooks/useUser';
import useOfficialChallenges, {
  getChallengePriority,
} from '@/components/hooks/useOfficialChallenges';

export default function useIncompleteChallenges(
  worldType: WorldType | undefined
) {
  const { data: officialChallenges, isValidating } =
    useOfficialChallenges(worldType);

  const isLoadingOfficialChallenges =
    !officialChallenges?.length && isValidating;

  const user = useUser();
  const incompleteChallenges = (
    officialChallenges?.filter(
      (challenge) =>
        (user.completedOfficialChallengeIds || []).indexOf(challenge.id) < 0
    ) || []
  ).sort(
    (a, b) => getChallengePriority(b.data()!) - getChallengePriority(a.data()!)
  );
  return { incompleteChallenges, isLoadingOfficialChallenges };
}
