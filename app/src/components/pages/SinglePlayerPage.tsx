import { useEffect, useState } from 'react';
import useAppStore from '../../state/AppStore';
import { useUser } from '../../state/UserStore';
import useWelcomeRedirect from '../hooks/useWelcomeRedirect';

export default function SinglePlayerPage() {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const controls = useUser().controls;
  const setIsDemo = appStore.setIsDemo;
  const requiresRedirect = useWelcomeRedirect();
  const launchSinglePlayer = client?.launchSinglePlayer;
  const [hasLaunched, setLaunched] = useState(false);

  useEffect(() => {
    if (!requiresRedirect && launchSinglePlayer && !hasLaunched) {
      setLaunched(true);
      launchSinglePlayer(controls);
      setIsDemo(false);
    }
  }, [launchSinglePlayer, requiresRedirect, hasLaunched, controls, setIsDemo]);

  return null;
}
