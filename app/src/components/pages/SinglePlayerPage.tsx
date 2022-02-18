import { GameUI } from '@/components/game/GameUI';
import usePwaRedirect from '@/components/hooks/usePwaRedirect';
import { useReleaseClientOnExitPage } from '@/components/hooks/useReleaseClientOnExitPage';
import useIngameStore from '@/state/IngameStore';
import useLoaderStore from '@/state/LoaderStore';
import { LocalUser } from '@/state/LocalUserStore';
import {
  GameModeType,
  getCharacterPath,
  hexToString,
  IBlock,
  ICharacter,
  stringToHex,
  WorldType,
  IPlayer,
  RoundLength,
} from 'infinitris2-models';
import { useEffect, useState } from 'react';
import useSearchParam from 'react-use/lib/useSearchParam';
import { useDocument } from 'swr-firestore';
import useAppStore from '../../state/AppStore';
import { useUser, useUserStore } from '../../state/UserStore';
//import useForcedRedirect from '../hooks/useForcedRedirect';
import { playGameMusic, playSound, SoundKey } from '../sound/MusicPlayer';

export default function SinglePlayerPage() {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const { controls_keyboard, controls_gamepad, rendererQuality, rendererType } =
    useUser();

  usePwaRedirect();
  //const requiresRedirect = useForcedRedirect();
  const launchSinglePlayer = client?.launchSinglePlayer;
  const [hasLaunched, setLaunched] = useState(false);
  const userStore = useUserStore();
  const musicOn =
    userStore.user.musicOn !== undefined ? userStore.user.musicOn : true;

  const requiresRedirect = false;
  const numBots = parseInt(useSearchParam('numBots') || '0');
  const botReactionDelay = parseInt(useSearchParam('botReactionDelay') || '30');
  const botRandomReactionDelay = parseInt(
    useSearchParam('botRandomReactionDelay') || '30'
  );
  const gridNumRows = parseInt(useSearchParam('gridNumRows') || '20');
  const gridNumColumns = parseInt(useSearchParam('gridNumColumns') || '10');
  const dayLength = parseInt(useSearchParam('dayLength') || '2000');
  const gameModeType: GameModeType =
    (useSearchParam('gameModeType') as GameModeType) || 'infinity';
  const worldType: WorldType =
    (useSearchParam('worldType') as WorldType) || 'grass';
  const roundLength: RoundLength =
    (useSearchParam('roundLength') as RoundLength) || 'medium';
  const spectate = useSearchParam('spectate') === 'true';
  const mistakeDetection = useSearchParam('mistakeDetection') === 'true';
  const calculateSpawnDelays =
    useSearchParam('calculateSpawnDelays') === 'true';
  const preventTowers = useSearchParam('preventTowers') === 'true';

  const user = useUser();
  const nickname = (user as LocalUser).nickname;
  const characterId = (user as LocalUser).characterId;
  const { data: character } = useDocument<ICharacter>(
    getCharacterPath(characterId)
  );

  const hasLoaded = useLoaderStore((store) => store.hasFinished) && !!character;

  useReleaseClientOnExitPage();

  useEffect(() => {
    if (!requiresRedirect && launchSinglePlayer && !hasLaunched && hasLoaded) {
      setLaunched(true);
      launchSinglePlayer({
        player: {
          nickname,
          color:
            character.data()?.color !== undefined
              ? stringToHex(character?.data()?.color!)
              : undefined,
          patternFilename: character.data()?.patternFilename,
          characterId,
        },
        worldType,
        controls_keyboard,
        controls_gamepad,
        numBots,
        botReactionDelay,
        botRandomReactionDelay,
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
          gameModeType,
          roundLength,
        },
        // TODO: support multiple listeners, extract SFX listener
        listener: {
          onSimulationInit() {},
          onSimulationStep() {},
          onSimulationNextDay() {},
          onSimulationNextRound() {},

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
          onPlayerToggleSpectating() {},
          onPlayerToggleChat(player: IPlayer, cancel: boolean) {
            if (player.isHuman) {
              if (!cancel && useIngameStore.getState().isChatOpen) {
                const message = useIngameStore.getState().chatMessage?.trim();
                if (message?.length) {
                  useIngameStore.getState().addToMessageLog({
                    createdTime: Date.now(),
                    message,
                    nickname: player.nickname,
                    color: hexToString(player.color),
                  });
                }

                useIngameStore.getState().setChatMessage('');
              }
              useIngameStore.getState().setChatOpen(player.isChatting);
            }
          },
          onLineCleared() {},
          onCellBehaviourChanged() {},
          onCellIsEmptyChanged() {},
          onGridCollapsed() {},
          onGridReset() {},
        },
      });
      playGameMusic();
    }
  }, [
    launchSinglePlayer,
    requiresRedirect,
    hasLaunched,
    controls_keyboard,
    controls_gamepad,
    musicOn,
    hasLoaded,
    numBots,
    botReactionDelay,
    botRandomReactionDelay,
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
    gameModeType,
    character,
    nickname,
    roundLength,
    characterId,
  ]);

  return <GameUI />;
}
