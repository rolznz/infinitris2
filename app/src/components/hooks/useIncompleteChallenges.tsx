import { useCollection } from 'swr-firestore';
import { challengesPath, IChallenge } from 'infinitris2-models';
import { where } from 'firebase/firestore';
//import { useUser } from '../../state/UserStore';

export default function useIncompleteChallenges() {
  const { data: officialChallenges } = useCollection<IChallenge>(
    challengesPath,
    {
      constraints: [where('isOfficial', '==', true)],
    }
  );

  const isLoadingOfficialChallenges = !officialChallenges?.length;

  // FIXME: use user challenge attempts
  //const user = useUser();
  const incompleteChallenges =
    officialChallenges?.filter(
      (challenge) => challenge.data()!.isMandatory /* &&
        user.completedChallengeIds.indexOf(challenge.id) < 0*/
    ) || [];
  return { incompleteChallenges, isLoadingOfficialChallenges };
}
