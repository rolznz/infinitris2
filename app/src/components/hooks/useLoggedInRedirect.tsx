import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useAppStore from '../../state/AppStore';
import useAuthStore from '../../state/AuthStore';

export default function useLoggedInRedirect() {
  const history = useHistory();
  const authUser = useAuthStore((authStore) => authStore.user);
  const returnUrl = useAppStore((appStore) => appStore.returnToUrl);

  useEffect(() => {
    if (authUser) {
      const redirectUrl = returnUrl || Routes.home;
      console.log('Already logged in, redirecting to', redirectUrl);
      history.replace(redirectUrl);
    }
  }, [history, authUser, returnUrl]);
  return null;
}
