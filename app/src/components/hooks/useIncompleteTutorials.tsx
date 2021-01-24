import { tutorials } from 'infinitris2-models';
import useUserStore from '../../state/UserStore';

export default function useIncompleteTutorials() {
  const user = useUserStore((userStore) => userStore.user);
  const incompleteTutorials = tutorials.filter(
    (tutorial) =>
      tutorial.mandatory && user.completedTutorialIds.indexOf(tutorial.id) < 0
  );
  return incompleteTutorials;
}
