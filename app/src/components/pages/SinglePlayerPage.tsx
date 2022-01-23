import { GameUI } from '@/components/game/GameUI';
import { useReleaseClientOnExitPage } from '@/components/hooks/useReleaseClientOnExitPage';
import useIngameStore from '@/state/IngameStore';
import useLoaderStore from '@/state/LoaderStore';
import { IBlock, WorldType } from 'infinitris2-models';
import { IPlayer } from 'infinitris2-models';
import { useEffect, useState } from 'react';
import useSearchParam from 'react-use/lib/useSearchParam';
import useAppStore from '../../state/AppStore';
import { useUser, useUserStore } from '../../state/UserStore';
//import useForcedRedirect from '../hooks/useForcedRedirect';
import { playGameMusic, playSound, SoundKey } from '../sound/MusicPlayer';

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

  useReleaseClientOnExitPage();

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
        // TODO: support multiple listeners, extract SFX listener
        listener: {
          onSimulationInit() {},
          onSimulationStep() {},
          onSimulationNextDay() {},

          onBlockCreated(block: IBlock) {
            if (block.player.isHuman) {
              playSound(SoundKey.spawn);
            }
          },
          onBlockCreateFailed() {},

          onBlockPlaced(block: IBlock) {
            if (block.player.isHuman) {
              playSound(SoundKey.place);
            }
          },
          onBlockDied(block: IBlock) {
            if (block.player.isHuman) {
              playSound(SoundKey.death);
            }
          },
          onBlockMoved(block: IBlock, dx: number, dy: number, dr: number) {
            if (block.player.isHuman && !block.isDropping) {
              if (dr !== 0) {
                console.log('Move: ', dx, dy, dr);
                playSound(SoundKey.rotate);
              } else if (dx !== 0 || dy !== 0) {
                playSound(SoundKey.move);
              }
            }
          },
          onBlockDropped(block: IBlock) {
            if (block.player.isHuman) {
              playSound(SoundKey.drop);
            }
          },
          onBlockDestroyed() {},
          /*onPlayerCreated(player: IPlayer) {
            useIngameStore.getState().setPlayer(player);
          },*/
          onPlayerCreated() {},
          onPlayerDestroyed() {},
          onPlayerToggleChat(player: IPlayer, cancel: boolean) {
            if (player.isHuman) {
              if (!cancel && useIngameStore.getState().isChatOpen) {
                useIngameStore.getState().setChatMessage('');
              }
              useIngameStore.getState().setChatOpen(player.isChatting);
            }
          },
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
