import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { challengesPath, IChallenge } from 'infinitris2-models';
import { where } from 'firebase/firestore';
//import { useUser } from '../../state/UserStore';

const useIncompleteChallengesOptions: UseCollectionOptions = {
  constraints: [where('isOfficial', '==', true)],
};

export default function useIncompleteChallenges() {
  const { data: officialChallenges } = useCollection<IChallenge>(
    challengesPath,
    useIncompleteChallengesOptions
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
