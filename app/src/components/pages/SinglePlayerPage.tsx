import useLoaderStore from '@/state/LoaderStore';
import { useEffect, useState } from 'react';
import useAppStore from '../../state/AppStore';
import { useUser, useUserStore } from '../../state/UserStore';
//import useForcedRedirect from '../hooks/useForcedRedirect';
import { playGameMusic } from '../sound/MusicPlayer';

export default function SinglePlayerPage() {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const controls = useUser().controls;
  //const requiresRedirect = useForcedRedirect();
  const launchSinglePlayer = client?.launchSinglePlayer;
  const [hasLaunched, setLaunched] = useState(false);
  const userStore = useUserStore();
  const musicOn =
    userStore.user.musicOn !== undefined ? userStore.user.musicOn : true;
  const hasLoaded = useLoaderStore((store) => store.hasFinished);
  const requiresRedirect = false;

  useEffect(() => {
    if (!requiresRedirect && launchSinglePlayer && !hasLaunched && hasLoaded) {
      setLaunched(true);
      launchSinglePlayer({ controls });
      if (musicOn) {
        playGameMusic();
      }
    }
  }, [
    launchSinglePlayer,
    requiresRedirect,
    hasLaunched,
    controls,
    musicOn,
    hasLoaded,
  ]);

  return null;
}
