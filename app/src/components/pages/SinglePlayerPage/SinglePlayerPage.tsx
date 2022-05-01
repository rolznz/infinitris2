import { GameUI } from '@/components/game/GameUI';
import usePwaRedirect from '@/components/hooks/usePwaRedirect';
import { useReleaseClientOnExitPage } from '@/components/hooks/useReleaseClientOnExitPage';
import { coreGameListeners } from '@/game/listeners/coreListeners';
import useIngameStore from '@/state/IngameStore';
import useLoaderStore from '@/state/LoaderStore';
import { DEFAULT_CHARACTER_ID, LocalUser } from '@/state/LocalUserStore';
import {
  getCharacterPath,
  hexToString,
  ICharacter,
  stringToHex,
  WorldType,
  IPlayer,
  ISimulation,
  charactersPath,
  WorldVariation,
} from 'infinitris2-models';
import { useEffect, useState } from 'react';
import useSearchParam from 'react-use/lib/useSearchParam';
import { useCollection, useDocument } from 'swr-firestore';
import useAppStore from '@/state/AppStore';
import { useUser } from '@/components/hooks/useUser';
//import useForcedRedirect from '../hooks/useForcedRedirect';
import { playGameMusic } from '@/sound/SoundManager';
import { useHistory } from 'react-router-dom';
import useSinglePlayerOptionsStore, {
  SinglePlayerOptionsFormData,
} from '@/state/SinglePlayerOptionsStore';
import Routes from '@/models/Routes';

export function launchSinglePlayer(history: ReturnType<typeof useHistory>) {
  const settings = useSinglePlayerOptionsStore.getState().formData;
  history.push(
    `${Routes.singlePlayerPlay}?settings=${encodeURIComponent(
      JSON.stringify(settings)
    )}`
  );
}

export default function SinglePlayerPage() {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const { controls_keyboard, controls_gamepad, rendererQuality, rendererType } =
    useUser();

  usePwaRedirect();
  //const requiresRedirect = useForcedRedirect();
  const launchSinglePlayer = client?.launchSinglePlayer;
  const [hasLaunched, setLaunched] = useState(false);

  const requiresRedirect = false;

  const settings = JSON.parse(
    useSearchParam('settings') || encodeURIComponent(JSON.stringify({}))
  ) as SinglePlayerOptionsFormData;

  const numBots = settings.numBots;
  const botReactionDelay = settings.botReactionDelay;
  const botRandomReactionDelay = settings.botRandomReactionDelay;
  const gridNumRows = settings.gridNumRows;
  const gridNumColumns = settings.gridNumColumns;
  const simulationSettings = settings.simulationSettings;
  const worldType: WorldType = settings.worldType;
  const worldVariation: WorldVariation = settings.worldVariation;
  const spectate = settings.spectate;
  const isDemo = settings.isDemo;
  const trackNumber = settings.trackNumber;

  const user = useUser();
  const nickname = (user as LocalUser).nickname;
  const characterId = user.selectedCharacterId || DEFAULT_CHARACTER_ID;
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
        worldVariation,
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
        isDemo,
        simulationSettings,
        listeners: [
          ...coreGameListeners,
          {
            onSimulationInit(simulation: ISimulation) {
              useIngameStore.getState().setSimulation(simulation);
            },
            onPlayerToggleChat(player: IPlayer, cancel: boolean) {
              if (player.isControllable) {
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
    worldType,
    worldVariation,
    character,
    nickname,
    simulationSettings,
    characterId,
    trackNumber,
    allCharacters.data,
    isDemo,
  ]);

  return isDemo ? null : <GameUI />;
}
