import useLoaderStore from '@/state/LoaderStore';
import { useEffect, useState } from 'react';
import useSearchParam from 'react-use/lib/useSearchParam';
import useAppStore from '../../state/AppStore';
import { useUser, useUserStore } from '../../state/UserStore';
//import useForcedRedirect from '../hooks/useForcedRedirect';
import { playGameMusic, playMenuTheme } from '../sound/MusicPlayer';

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
  const numBots = parseInt(useSearchParam('numBots') || '0');
  const botReactionDelay = parseInt(useSearchParam('botReactionDelay') || '30');
  const gridNumRows = parseInt(useSearchParam('gridNumRows') || '20');
  const gridNumColumns = parseInt(useSearchParam('gridNumColumns') || '10');

  useEffect(() => {
    return () => {
      useAppStore.getState().clientApi?.releaseClient();
      playMenuTheme();
    };
  }, []);

  useEffect(() => {
    if (!requiresRedirect && launchSinglePlayer && !hasLaunched && hasLoaded) {
      setLaunched(true);
      launchSinglePlayer({
        controls,
        numBots,
        botReactionDelay,
        gridNumRows,
        gridNumColumns,
      });
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
    numBots,
    botReactionDelay,
    client,
    gridNumRows,
    gridNumColumns,
  ]);

  return null;
}
