import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';

export default function useComingSoonRedirect() {
  const history = useHistory();
  history.replace(Routes.comingSoon);
  return null;
}
