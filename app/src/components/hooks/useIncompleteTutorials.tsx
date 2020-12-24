import { tutorials } from 'infinitris2-models';
import useAppStore from '../../state/AppStore';

export default function useIncompleteTutorials() {
  const user = useAppStore((appStore) => appStore.user);
  const incompleteTutorials = tutorials.filter(
    (tutorial) =>
      tutorial.mandatory && user.completedTutorialIds.indexOf(tutorial.id) < 0
  );
  return incompleteTutorials;
}
