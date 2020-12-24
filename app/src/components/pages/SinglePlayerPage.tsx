import { useEffect, useState } from 'react';
import useAppStore from '../../state/AppStore';
import useReleaseClient from '../hooks/useReleaseClient';
import useWelcomeRedirect from '../hooks/useWelcomeRedirect';

export default function SinglePlayerPage() {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const user = appStore.user;
  const requiresRedirect = useWelcomeRedirect();
  const launchSinglePlayer = client?.launchSinglePlayer;
  const [hasLaunched, setLaunched] = useState(false);

  useEffect(() => {
    if (!requiresRedirect && launchSinglePlayer && !hasLaunched) {
      setLaunched(true);
      launchSinglePlayer();
    }
  }, [launchSinglePlayer, user.hasSeenWelcome, requiresRedirect, hasLaunched]);

  useReleaseClient();

  return null;
}
