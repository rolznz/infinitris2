import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useAppStore from '../../state/AppStore';
import useAuthStore from '../../state/AuthStore';

export default function useLoggedInRedirect() {
  const history = useHistory();
  const user = useAuthStore((authStore) => authStore.user);
  const returnUrl = useAppStore((appStore) => appStore.returnToUrl);

  useEffect(() => {
    if (user) {
      history.replace(returnUrl || Routes.home);
    }
  }, [history, user, returnUrl]);
  return null;
}
