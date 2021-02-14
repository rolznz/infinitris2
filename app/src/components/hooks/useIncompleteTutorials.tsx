import { tutorials } from 'infinitris2-models';
import { useUser } from '../../state/UserStore';

export default function useIncompleteTutorials() {
  const user = useUser();
  const incompleteTutorials = tutorials.filter(
    (tutorial) =>
      tutorial.isMandatory && user.completedTutorialIds.indexOf(tutorial.id) < 0
  );
  return incompleteTutorials;
}
