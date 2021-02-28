import { challenges } from 'infinitris2-models';
import { useUser } from '../../state/UserStore';

export default function useIncompleteChallenges() {
  const user = useUser();
  const incompleteChallenges = challenges.filter(
    (challenge) =>
      challenge.isMandatory &&
      user.completedChallengeIds.indexOf(challenge.id) < 0
  );
  return incompleteChallenges;
}
