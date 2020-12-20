import firebase from 'firebase';
import React, { useEffect, useState } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';
import useAppStore from '../../state/AppStore';
import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Link, Typography } from '@material-ui/core';
import useRoomStore from '../../state/RoomStore';
import Loader from 'react-loader-spinner';
import SignalCellularConnectedNoInternet0BarIcon from '@material-ui/icons/SignalCellularConnectedNoInternet0Bar';
import HomeIcon from '@material-ui/icons/Home';
import RefreshIcon from '@material-ui/icons/Refresh';
import {
  IClientSocketEventListener,
  tutorials,
  Room,
  IBlock,
  ISimulationEventListener,
  ISimulation,
} from 'infinitris2-models';

interface RoomPageRouteParams {
  id: string;
}

const socketEventListener: IClientSocketEventListener = {
  onConnect: () => {
    useRoomStore.getState().setConnected(true);
  },
  onDisconnect: () => {
    const roomState = useRoomStore.getState();
    roomState.setConnected(false);
    roomState.setDisconnected(true);
    useAppStore.getState().clientApi?.releaseClient();
  },
  onMessage: () => {},
};

function checkTutorialFinished() {
  //this._simulation.stopInterval();
  //this._input.destroy();
  // FIXME: on block placed, check if line clear was triggered?
  // line clear should be delayed, 1 s + colors changing
  //const success = this._simulation.getPlayer(block.playerId).score > 0;
  //this._listeners.
  alert('Tutorial finished');
}

const simulationEventListener: ISimulationEventListener = {
  onSimulationInit(simulation: ISimulation) {},
  onSimulationStep(simulation: ISimulation) {},

  onBlockCreated(block: IBlock) {},

  onBlockPlaced(block: IBlock) {
    checkTutorialFinished();
  },
  onBlockDied(block: IBlock) {
    checkTutorialFinished();
  },
  onBlockMoved(block: IBlock) {},
  onLineCleared(row: number) {},
};

export default function RoomPage() {
  const client = useAppStore((store) => store.clientApi);
  const [
    connected,
    setConnected,
    disconnected,
    setDisconnected,
  ] = useRoomStore((store) => [
    store.connected,
    store.setConnected,
    store.disconnected,
    store.setDisconnected,
  ]);
  const { id } = useParams<RoomPageRouteParams>();
  const isTutorial = true; // FIXME: check id starts with tutorial/
  const isSinglePlayer = id === 'singleplayer' || isTutorial;
  const [room, loadingRoom] = useDocumentData<Room>(
    !isSinglePlayer ? firebase.firestore().doc(`rooms/${id}`) : undefined
  );
  const [retryCount, setRetryCount] = useState(0);
  const roomUrl = room?.url;

  useEffect(() => {
    if (disconnected || !client || (!isSinglePlayer && !roomUrl)) {
      return;
    }
    if (isTutorial) {
      client.launchTutorial(tutorials[0], simulationEventListener);
    } else if (isSinglePlayer) {
      client.launchSinglePlayer();
    } else {
      client.launchNetworkClient(roomUrl as string, socketEventListener);
    }
  }, [
    disconnected,
    retryCount,
    roomUrl,
    isSinglePlayer,
    isTutorial,
    client,
    setConnected,
  ]);

  useEffect(() => {
    setDisconnected(false);
    setConnected(false);
    return () => {
      client?.releaseClient();
      client?.launchDemo();
    };
  }, [client, setConnected, setDisconnected]);

  if (connected || isSinglePlayer) {
    return null;
  }

  const status = disconnected
    ? 'Disconnected'
    : loadingRoom
    ? 'Loading Room'
    : 'Connecting';

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
          <Loader type="Rings" color="#00BFFF33" height={100} width={100} />
        )}
      </Box>

      <Typography variant="body1">{status}</Typography>
      <Box height={100} display="flex" alignItems="center">
        {disconnected && (
          <Box width={130} display="flex" justifyContent="space-between">
            <Link component={RouterLink} underline="none" to={`/`}>
              <IconButton>
                <HomeIcon fontSize="large" />
              </IconButton>
            </Link>
            <IconButton
              onClick={() => {
                setDisconnected(false);
                setRetryCount(retryCount + 1);
              }}
            >
              <RefreshIcon fontSize="large" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}
