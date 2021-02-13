import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useAuthStore from '../../state/AuthStore';

export default function useProfileRedirect() {
  const history = useHistory();
  const user = useAuthStore((authStore) => authStore.user);

  useEffect(() => {
    if (user) {
      history.replace(Routes.profile);
    }
  }, [history, user]);
  return null;
}
