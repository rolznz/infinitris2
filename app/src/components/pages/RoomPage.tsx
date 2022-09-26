import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAppStore from '../../state/AppStore';
import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Link, Typography } from '@mui/material';
import useRoomStore from '../../state/RoomStore';
import SignalCellularConnectedNoInternet0BarIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0Bar';
import { ReactComponent as HomeIcon } from '@/icons/home.svg';
import { ReactComponent as RefreshIcon } from '@/icons/refresh.svg';
import {
  ClientMessageType,
  getRoomPath,
  getServerPath,
  IClientChatMessage,
  IClientSocket,
  IClientSocketEventListener,
  IPlayer,
  IRoom,
  IServer,
  ISimulation,
  PlayerStatus,
} from 'infinitris2-models';
//import useForcedRedirect from '../hooks/useForcedRedirect';
import { useUser, useUserLaunchOptions } from '../hooks/useUser';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useDocument } from 'swr-firestore';
import { useReleaseClientOnExitPage } from '@/components/hooks/useReleaseClientOnExitPage';
import useIngameStore from '@/state/IngameStore';
import { GameUI } from '@/components/game/GameUI';
import usePwaRedirect from '@/components/hooks/usePwaRedirect';
import shallow from 'zustand/shallow';
import { coreGameListeners } from '@/game/listeners/coreListeners';
import { useNetworkPlayerInfo } from '@/components/hooks/useNetworkPlayerInfo';
import useLoaderStore from '@/state/LoaderStore';
import {
  playGameMusic,
  worldVariationToTrackNumber,
} from '@/sound/SoundManager';

export interface RoomPageRouteParams {
  id: string;
}

const socketEventListener: IClientSocketEventListener = {
  onConnect: (socket: IClientSocket) => {
    useRoomStore.getState().setConnected(true);
    useRoomStore.getState().setSocket(socket);
  },
  onDisconnect: () => {
    const roomState = useRoomStore.getState();
    roomState.setConnected(false);
    roomState.setDisconnected(true);
    roomState.setLaunched(false);
    useIngameStore.getState().setSimulation(undefined);
    useAppStore.getState().clientApi?.releaseClient();
  },
  onMessage: () => {},
};

export default function RoomPage() {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const [
    connected,
    setConnected,
    disconnected,
    setDisconnected,
    hasLaunched,
    setLaunched,
  ] = useRoomStore(
    (store) => [
      store.connected,
      store.setConnected,
      store.disconnected,
      store.setDisconnected,
      store.hasLaunched,
      store.setLaunched,
    ],
    shallow
  );
  const { id } = useParams<RoomPageRouteParams>();

  const { data: room } = useDocument<IRoom>(id ? getRoomPath(id) : null);
  const { data: server } = useDocument<IServer>(
    room ? getServerPath(room.data()!.serverId) : null
  );

  const [retryCount, setRetryCount] = useState(0);
  const serverUrl = server?.data()?.url;
  usePwaRedirect();
  const player = useNetworkPlayerInfo();

  const loaderHasFinished = useLoaderStore((store) => store.hasFinished);
  const user = useUser();
  const userLaunchOptions = useUserLaunchOptions(user);

  const hasLoaded = !!client && !!player && !!room && loaderHasFinished;

  useReleaseClientOnExitPage();

  // FIXME: multiple listeners
  useEffect(() => {
    if (
      //requiresRedirect ||
      !hasLoaded ||
      disconnected ||
      !client ||
      !serverUrl ||
      hasLaunched
    ) {
      return;
    }
    setLaunched(true);
    client.launchNetworkClient(serverUrl as string, {
      ...userLaunchOptions,
      socketListener: socketEventListener,
      teachAllControls: true,
      worldType: room.data()!.worldType,
      worldVariation: room.data()!.worldVariation,
      player,
      roomIndex: room.data()!.roomIndex,
      listeners: [
        ...coreGameListeners,
        {
          onPlayerCreated(player: IPlayer) {
            if (
              player.isControllable &&
              player.status === PlayerStatus.knockedOut &&
              !useIngameStore.getState().simulation?.round
                ?.isWaitingForNextRound
            ) {
              useIngameStore.getState().setIsWaitingForRoundToEnd(true);
            }
          },
          onEndRound() {
            useIngameStore.getState().setIsWaitingForRoundToEnd(false);
          },
        },
        {
          onSimulationInit(simulation: ISimulation) {
            useIngameStore.getState().setSimulation(simulation);
          },
          onPlayerToggleChat(player: IPlayer, cancel: boolean) {
            // TODO: go through simulation addMessage instead of directly to socket
            if (player.isControllable) {
              if (!cancel && useIngameStore.getState().isChatOpen) {
                const message = useIngameStore.getState().chatMessage?.trim();
                if (message?.length) {
                  const chatMessage: IClientChatMessage = {
                    message,
                    type: ClientMessageType.CHAT,
                  };
                  useRoomStore.getState().socket!.sendMessage(chatMessage);
                }
                useIngameStore.getState().setChatMessage('');
              }
              useIngameStore.getState().setChatOpen(player.isChatting);
            }
          },
        },
      ],
    });
    playGameMusic(
      room.data()?.worldType || 'grass',
      worldVariationToTrackNumber(room.data()?.worldVariation)
    );
  }, [
    disconnected,
    retryCount,
    serverUrl,
    client,
    setConnected,
    hasLaunched,
    setLaunched,
    hasLoaded,
    player,
    room,
    userLaunchOptions,
  ]);

  useEffect(() => {
    setDisconnected(false);
    setConnected(false);
  }, [setConnected, setDisconnected]);

  if (connected) {
    return <GameUI showWaitForRoundEnd />;
  }

  const status = disconnected
    ? 'Disconnected'
    : !room
    ? 'Loading Room'
    : !server
    ? 'Loading Server'
    : 'Connecting to ' + serverUrl;

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        height={100}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {disconnected ? (
          <SignalCellularConnectedNoInternet0BarIcon style={{ fontSize: 50 }} />
        ) : (
          <LoadingSpinner />
        )}
      </Box>

      <Typography variant="body1">{status}</Typography>
      <Box height={100} display="flex" alignItems="center">
        {disconnected && (
          <Box width={130} display="flex" justifyContent="space-between">
            <Link component={RouterLink} underline="none" to={`/`}>
              <IconButton size="large">
                <HomeIcon fontSize="large" />
              </IconButton>
            </Link>
            <IconButton
              onClick={() => {
                setDisconnected(false);
                setRetryCount(retryCount + 1);
              }}
              size="large"
            >
              <RefreshIcon fontSize="large" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}
