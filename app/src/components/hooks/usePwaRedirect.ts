import Routes from '@/models/Routes';
import { requiresPwa } from '@/utils/isMobile';
import { useHistory } from 'react-router-dom';

export default function usePwaRedirect() {
  const history = useHistory();
  if (requiresPwa()) {
    history.replace(Routes.pwa);
  }
  return null;
}
