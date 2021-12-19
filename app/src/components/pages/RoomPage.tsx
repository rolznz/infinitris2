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
  getRoomPath,
  IClientSocketEventListener,
  IRoom,
} from 'infinitris2-models';
import useForcedRedirect from '../hooks/useForcedRedirect';
import { useUser } from '../../state/UserStore';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useDocument } from 'swr-firestore';
import useComingSoonRedirect from '../hooks/useComingSoonRedirect';

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
  useComingSoonRedirect();
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const [connected, setConnected, disconnected, setDisconnected] = useRoomStore(
    (store) => [
      store.connected,
      store.setConnected,
      store.disconnected,
      store.setDisconnected,
    ]
  );
  const setIsDemo = appStore.setIsDemo;
  const { id } = useParams<RoomPageRouteParams>();

  const { data: room } = useDocument<IRoom>(id ? getRoomPath(id) : null);
  const [retryCount, setRetryCount] = useState(0);
  const roomUrl = room?.url;
  const requiresRedirect = useForcedRedirect();
  const [hasLaunched, setLaunched] = useState(false);
  const controls = useUser().controls;

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
    : !room
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
