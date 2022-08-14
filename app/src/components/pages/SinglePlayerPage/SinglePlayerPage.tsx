import { GameUI } from '@/components/game/GameUI';
import usePwaRedirect from '@/components/hooks/usePwaRedirect';
import { useReleaseClientOnExitPage } from '@/components/hooks/useReleaseClientOnExitPage';
import { coreGameListeners } from '@/game/listeners/coreListeners';
import useIngameStore from '@/state/IngameStore';
import useLoaderStore from '@/state/LoaderStore';
import {
  hexToString,
  ICharacter,
  WorldType,
  IPlayer,
  ISimulation,
  charactersPath,
  WorldVariation,
  IBlock,
  stringToHex,
} from 'infinitris2-models';
import { useEffect, useState } from 'react';
import useSearchParam from 'react-use/lib/useSearchParam';
import { useCollection } from 'swr-firestore';
import useAppStore from '@/state/AppStore';
import { useUser, useUserLaunchOptions } from '@/components/hooks/useUser';
//import useForcedRedirect from '../hooks/useForcedRedirect';
import {
  playGameMusic,
  worldVariationToTrackNumber,
} from '@/sound/SoundManager';
import { useHistory } from 'react-router-dom';
import useSinglePlayerOptionsStore, {
  SinglePlayerOptionsFormData,
} from '@/state/SinglePlayerOptionsStore';
import Routes from '@/models/Routes';
import { useNetworkPlayerInfo } from '@/components/hooks/useNetworkPlayerInfo';

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
  const user = useUser();
  const userLaunchOptions = useUserLaunchOptions(user);

  usePwaRedirect();
  //const requiresRedirect = useForcedRedirect();
  const launchSinglePlayer = client?.launchSinglePlayer;
  const [hasLaunched, setLaunched] = useState(false);

  const requiresRedirect = false;

  const settings = JSON.parse(
    useSearchParam('settings') || encodeURIComponent(JSON.stringify({}))
  ) as SinglePlayerOptionsFormData;

  const gridNumRows = settings.gridNumRows;
  const gridNumColumns = settings.gridNumColumns;
  const simulationSettings = settings.simulationSettings;
  const worldType: WorldType = settings.worldType;
  const worldVariation: WorldVariation = settings.worldVariation;
  const spectate = settings.spectate;
  const isDemo = settings.isDemo;
  const trackNumber = worldVariationToTrackNumber(worldVariation);
  const player = useNetworkPlayerInfo();
  const { data: allCharacters } = useCollection<ICharacter>(charactersPath);

  const hasLoaded =
    useLoaderStore((store) => store.hasFinished) &&
    !!player &&
    allCharacters?.length;

  useReleaseClientOnExitPage();

  useEffect(() => {
    if (!requiresRedirect && launchSinglePlayer && !hasLaunched && hasLoaded) {
      setLaunched(true);
      launchSinglePlayer({
        ...userLaunchOptions,
        allCharacters: allCharacters!.map((document) => document.data()),
        player,
        worldType,
        worldVariation,
        gridNumRows,
        gridNumColumns,
        spectate,
        isDemo,
        simulationSettings,
        listeners: [
          ...coreGameListeners,
          {
            onSimulationInit(simulation: ISimulation) {
              useIngameStore.getState().setSimulation(simulation);
            },
            onBlockPlaced(block: IBlock) {
              // The below gives the player a new character each time they place a block.
              // Ideally the player shouldn't have to be destroyed and recreated.
              // This should only be turned on for demos.
              if (process.env.REACT_APP_DEMO_ROTATE_CHARACTER === 'true') {
                let player = block.player;
                useIngameStore.getState().simulation!.removePlayer(player.id);
                const newCharacter = useIngameStore
                  .getState()
                  .simulation!.generateCharacter(
                    allCharacters.map((doc) => doc.data()),
                    player.id,
                    false
                  );
                player.characterId = newCharacter.id!.toString();
                player.color = stringToHex(newCharacter.color!);
                player.patternFilename = newCharacter.patternFilename!;
                useIngameStore.getState().simulation!.addPlayer(player);
              }
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
    hasLoaded,
    client,
    gridNumRows,
    gridNumColumns,
    spectate,
    worldType,
    worldVariation,
    simulationSettings,
    trackNumber,
    allCharacters,
    isDemo,
    player,
    userLaunchOptions,
  ]);

  return isDemo ? null : <GameUI allowSkipCountdown chatEnabled={false} />;
}
