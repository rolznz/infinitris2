import { GameUI } from '@/components/game/GameUI';
import useIngameStore from '@/state/IngameStore';
import useLoaderStore from '@/state/LoaderStore';
import useLocalUserStore from '@/state/LocalUserStore';
import { WorldType } from 'infinitris2-models';
import { IPlayer } from 'infinitris2-models';
import { useEffect, useState } from 'react';
import useSearchParam from 'react-use/lib/useSearchParam';
import useAppStore from '../../state/AppStore';
import { useUser, useUserStore } from '../../state/UserStore';
//import useForcedRedirect from '../hooks/useForcedRedirect';
import { playGameMusic, playMenuTheme } from '../sound/MusicPlayer';

export default function SinglePlayerPage() {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const { controls, rendererQuality, rendererType } = useUser();
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
  const dayLength = parseInt(useSearchParam('dayLength') || '2000');
  const worldType: WorldType =
    (useSearchParam('worldType') as WorldType) || 'grass';
  const spectate = useSearchParam('spectate') === 'true';
  const mistakeDetection = useSearchParam('mistakeDetection') === 'true';
  const calculateSpawnDelays =
    useSearchParam('calculateSpawnDelays') === 'true';
  const preventTowers = useSearchParam('preventTowers') === 'true';

  useEffect(() => {
    return () => {
      useAppStore.getState().clientApi?.releaseClient();
      // FIXME: need a better way to access isMusicOn - store in music player
      if (useLocalUserStore.getState().user.musicOn) {
        playMenuTheme();
      }
    };
  }, []);

  useEffect(() => {
    if (!requiresRedirect && launchSinglePlayer && !hasLaunched && hasLoaded) {
      setLaunched(true);
      launchSinglePlayer({
        worldType,
        controls,
        numBots,
        botReactionDelay,
        gridNumRows,
        gridNumColumns,
        rendererQuality,
        rendererType,
        spectate,
        simulationSettings: {
          mistakeDetection,
          calculateSpawnDelays,
          preventTowers,
          dayLength,
        },
        listener: {
          onSimulationInit() {},
          onSimulationStep() {},
          onSimulationNextDay() {},

          onBlockCreated() {},
          onBlockCreateFailed() {},

          onBlockPlaced() {},
          onBlockDied() {},
          onBlockMoved() {},
          onBlockDropped() {},
          onBlockDestroyed() {},
          /*onPlayerCreated(player: IPlayer) {
            useIngameStore.getState().setPlayer(player);
          },*/
          onPlayerCreated() {},
          onPlayerDestroyed() {},
          onPlayerToggleChat(player: IPlayer) {},
          onLineCleared() {},
          onCellBehaviourChanged() {},
          onGridCollapsed() {},
        },
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
    rendererQuality,
    rendererType,
    spectate,
    mistakeDetection,
    calculateSpawnDelays,
    preventTowers,
    dayLength,
    worldType,
  ]);

  return <GameUI />;
}
