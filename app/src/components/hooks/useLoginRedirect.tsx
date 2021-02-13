import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useAuthStore from '../../state/AuthStore';

export default function useLoginRedirect() {
  const history = useHistory();
  const user = useAuthStore((authStore) => authStore.user);

  useEffect(() => {
    if (!user) {
      history.replace(Routes.login);
    }
  }, [history, user]);
  return null;
}
