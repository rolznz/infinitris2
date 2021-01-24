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
import { IClientSocketEventListener, IRoom } from 'infinitris2-models';
import useWelcomeRedirect from '../hooks/useWelcomeRedirect';
import useUserStore from '../../state/UserStore';

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

export default function RoomPage() {
  const appStore = useAppStore();
  const client = appStore.clientApi;
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
  const setIsDemo = appStore.setIsDemo;
  const { id } = useParams<RoomPageRouteParams>();

  const [room, loadingRoom] = useDocumentData<IRoom>(
    firebase.firestore().doc(`rooms/${id}`)
  );
  const [retryCount, setRetryCount] = useState(0);
  const roomUrl = room?.url;
  const requiresRedirect = useWelcomeRedirect();
  const [hasLaunched, setLaunched] = useState(false);
  const controls = useUserStore((userStore) => userStore.user.controls);

  useEffect(() => {
    if (
      requiresRedirect ||
      disconnected ||
      !client ||
      !roomUrl ||
      hasLaunched
    ) {
      return;
    }
    setLaunched(true);
    client.launchNetworkClient(
      roomUrl as string,
      socketEventListener,
      controls
    );
    setIsDemo(false);
  }, [
    disconnected,
    retryCount,
    roomUrl,
    client,
    setConnected,
    requiresRedirect,
    hasLaunched,
    controls,
    setIsDemo,
  ]);

  useEffect(() => {
    setDisconnected(false);
    setConnected(false);
  }, [setConnected, setDisconnected]);

  if (connected) {
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
