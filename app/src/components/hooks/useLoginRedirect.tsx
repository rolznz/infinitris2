import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Routes from '../../models/Routes';
import useAppStore from '../../state/AppStore';
import useAuthStore from '../../state/AuthStore';

export default function useLoginRedirect() {
  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;
  const setReturnToUrl = useAppStore((appStore) => appStore.setReturnToUrl);
  const user = useAuthStore((authStore) => authStore.user);

  useEffect(() => {
    if (!user) {
      setReturnToUrl(pathname);
      history.replace(Routes.login);
    }
  }, [history, user, pathname, setReturnToUrl]);
  return null;
}
