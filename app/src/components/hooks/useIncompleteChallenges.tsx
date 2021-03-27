import { useCollection } from '@nandorojo/swr-firestore';
import { IChallenge } from 'infinitris2-models';
import { challengesPath } from '../../firebase';
import { useUser } from '../../state/UserStore';

export default function useIncompleteChallenges() {
  const { data: officialChallenges } = useCollection<IChallenge>(
    challengesPath,
    {
      where: [['isOfficial', '==', true]],
    }
  );

  const isLoadingOfficialChallenges = !officialChallenges?.length;

  const user = useUser();
  const incompleteChallenges =
    officialChallenges?.filter(
      (challenge) =>
        challenge.isMandatory &&
        user.completedChallengeIds.indexOf(challenge.id) < 0
    ) || [];
  return { incompleteChallenges, isLoadingOfficialChallenges };
}
