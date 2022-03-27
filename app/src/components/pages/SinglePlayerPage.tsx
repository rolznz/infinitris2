import { GameUI } from '@/components/game/GameUI';
import usePwaRedirect from '@/components/hooks/usePwaRedirect';
import { useReleaseClientOnExitPage } from '@/components/hooks/useReleaseClientOnExitPage';
import { coreGameListeners } from '@/game/listeners/coreListeners';
import useIngameStore from '@/state/IngameStore';
import useLoaderStore from '@/state/LoaderStore';
import { LocalUser } from '@/state/LocalUserStore';
import {
  GameModeType,
  getCharacterPath,
  hexToString,
  ICharacter,
  stringToHex,
  WorldType,
  IPlayer,
  RoundLength,
  ISimulation,
  charactersPath,
} from 'infinitris2-models';
import { useEffect, useState } from 'react';
import useSearchParam from 'react-use/lib/useSearchParam';
import { useCollection, useDocument } from 'swr-firestore';
import useAppStore from '../../state/AppStore';
import { useUser, useUserStore } from '../../state/UserStore';
//import useForcedRedirect from '../hooks/useForcedRedirect';
import {
  playGameMusic,
  playSound,
  SoundKey,
  TrackNumber,
} from '../sound/MusicPlayer';

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
  const trackNumber = useSearchParam('trackNumber') as TrackNumber;

  const user = useUser();
  const nickname = (user as LocalUser).nickname;
  const characterId = (user as LocalUser).characterId;
  const { data: character } = useDocument<ICharacter>(
    getCharacterPath(characterId)
  );

  const allCharacters = useCollection<ICharacter>(charactersPath);

  const hasLoaded =
    useLoaderStore((store) => store.hasFinished) &&
    !!character &&
    allCharacters.data?.length;

  useReleaseClientOnExitPage();

  useEffect(() => {
    if (!requiresRedirect && launchSinglePlayer && !hasLaunched && hasLoaded) {
      setLaunched(true);
      launchSinglePlayer({
        allCharacters: allCharacters.data!.map((document) => document.data()),
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
          gameModeType,
          roundLength,
        },
        listeners: [
          ...coreGameListeners,
          {
            onSimulationInit(simulation: ISimulation) {
              useIngameStore.getState().setSimulation(simulation);
            },
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
          },
        ],
      });
      playGameMusic(worldType, trackNumber);
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
    worldType,
    gameModeType,
    character,
    nickname,
    roundLength,
    characterId,
    trackNumber,
  ]);

  return <GameUI />;
}
