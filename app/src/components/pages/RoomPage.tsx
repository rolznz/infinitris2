import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAppStore from '../../state/AppStore';
import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Link, Typography } from '@mui/material';
import useRoomStore from '../../state/RoomStore';
import SignalCellularConnectedNoInternet0BarIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0Bar';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  ClientMessageType,
  getCharacterPath,
  getRoomPath,
  getServerPath,
  hexToString,
  IBlock,
  ICharacter,
  IClientChatMessage,
  IClientSocket,
  IClientSocketEventListener,
  IPlayer,
  IRoom,
  IServer,
  IServerChatMessage,
  ISimulation,
  ServerMessageType,
  stringToHex,
  IServerMessage,
  reservedPlayerIds,
} from 'infinitris2-models';
//import useForcedRedirect from '../hooks/useForcedRedirect';
import { useUser } from '../../state/UserStore';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useDocument } from 'swr-firestore';
import { useReleaseClientOnExitPage } from '@/components/hooks/useReleaseClientOnExitPage';
import { playSound, SoundKey } from '@/components/sound/MusicPlayer';
import useIngameStore from '@/state/IngameStore';
import { GameUI } from '@/components/game/GameUI';
import usePwaRedirect from '@/components/hooks/usePwaRedirect';
import { LocalUser } from '@/state/LocalUserStore';
import useLoaderStore from '@/state/LoaderStore';

interface RoomPageRouteParams {
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
  onMessage: (message: IServerMessage) => {
    const simulation = useIngameStore.getState().simulation;
    if (message.type === ServerMessageType.CHAT) {
      const chatMessage = message as IServerChatMessage;
      const player = simulation?.getPlayer(chatMessage.playerId);
      if (player) {
        useIngameStore.getState().addToMessageLog({
          createdTime: Date.now(),
          message: chatMessage.message,
          nickname: player.nickname,
          color: hexToString(player.color),
        });
      } else if (chatMessage.playerId === reservedPlayerIds.SERVER) {
        useIngameStore.getState().addToMessageLog({
          createdTime: Date.now(),
          message: chatMessage.message,
          nickname: '[SERVER]',
          color: '#ff0000',
        });
      }
    }
  },
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
  ] = useRoomStore((store) => [
    store.connected,
    store.setConnected,
    store.disconnected,
    store.setDisconnected,
    store.hasLaunched,
    store.setLaunched,
  ]);
  const { id } = useParams<RoomPageRouteParams>();

  const { data: room } = useDocument<IRoom>(id ? getRoomPath(id) : null);
  const { data: server } = useDocument<IServer>(
    room ? getServerPath(room.data()!.serverId) : null
  );

  const [retryCount, setRetryCount] = useState(0);
  const serverUrl = server?.data()?.url;
  usePwaRedirect();
  const user = useUser();
  //const requiresRedirect = useForcedRedirect();
  const controls_keyboard = user.controls_keyboard;
  const controls_gamepad = user.controls_gamepad;

  const nickname = (user as LocalUser).nickname;
  const characterId = (user as LocalUser).characterId;
  const { data: character } = useDocument<ICharacter>(
    getCharacterPath(characterId)
  );

  const hasLoaded =
    useLoaderStore((store) => store.hasFinished) && !!character && !!room;

  useReleaseClientOnExitPage();

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
      socketListener: socketEventListener,
      controls_keyboard,
      controls_gamepad,
      worldType: room.data()!.worldType,
      player: {
        color:
          character.data()?.color !== undefined
            ? stringToHex(character?.data()?.color!)
            : undefined,
        patternFilename: character.data()?.patternFilename,
        characterId,
        nickname,
      },
      roomId: room.data()!.roomId,
      listener: {
        onSimulationInit(simulation: ISimulation) {
          useIngameStore.getState().setSimulation(simulation);
        },
        onSimulationStep() {},
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
        onLineClear() {},
        onClearLines() {},
        onLinesCleared() {},
        onLineClearing() {},
        onCellBehaviourChanged() {},
        onCellIsEmptyChanged() {},
        onGridReset() {},
        onGameModeEvent() {},
        onPlayerHealthChanged() {},
        onPlayerScoreChanged() {},
      },
    });
  }, [
    disconnected,
    retryCount,
    serverUrl,
    client,
    setConnected,
    //requiresRedirect,
    hasLaunched,
    setLaunched,
    controls_keyboard,
    controls_gamepad,
    hasLoaded,
    characterId,
    nickname,
    character,
    room,
  ]);

  useEffect(() => {
    setDisconnected(false);
    setConnected(false);
  }, [setConnected, setDisconnected]);

  if (connected) {
    return <GameUI />;
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
