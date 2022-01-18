import { IRoom, IServer, roomsPath, serversPath } from 'infinitris2-models';
import { useCollection } from 'swr-firestore';
import React from 'react';
import RoomCard, { MAX_PING } from '@/components/pages/LobbyPage/RoomCard';
import { Page } from '@/components/ui/Page';
import FlexBox from '@/components/ui/FlexBox';
import Button from '@mui/material/Button';
import { FormattedMessage } from 'react-intl';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import RefreshIcon from '@mui/icons-material/Refresh';

export type ServerPings = { [url: string]: number };

export default function LobbyPage() {
  const { data: rooms, mutate: mutateRooms } = useCollection<IRoom>(roomsPath);
  const { data: servers, mutate: mutateServers } =
    useCollection<IServer>(serversPath);
  const [serverPings, setServerPings] = React.useState<ServerPings>({});
  const isLandscape = useIsLandscape();

  function refresh() {
    mutateRooms();
    mutateServers();
    setServerPings({});
  }

  React.useEffect(() => {
    if (!servers) {
      return;
    }
    for (const server of servers) {
      if (!serverPings[server.data().url]) {
        const startTime = Date.now();
        console.log('Pinging', server.data().url);
        serverPings[server.data().url] = MAX_PING;
        (async () => {
          try {
            const socket = new WebSocket(server.data().url);
            socket.onopen = () => {
              setServerPings((existingValue) => ({
                ...existingValue,
                [server.data().url]: Date.now() - startTime,
              }));
              socket.close();
            };
          } catch (error) {
            console.error(error);
          }
        })();
      }
    }
  }, [servers, serverPings, setServerPings]);

  if (!rooms || !servers) {
    return null;
  }

  const validServers = servers.filter(
    (server) => serverPings[server.data().url] < MAX_PING
  );

  const roomServerPairs = rooms
    .map((room) => ({
      room,
      server: validServers.find(
        (server) => server.id === room.data()!.serverId
      ),
    }))
    .filter((pair) => pair.server)
    .sort(
      (a, b) =>
        serverPings[a.server!.data().url] - serverPings[b.server!.data().url]
    );

  return (
    <Page title="Lobby">
      <Button onClick={refresh} variant="contained" sx={{ mb: 4 }}>
        <RefreshIcon fontSize="large" />
        <FormattedMessage
          defaultMessage="Refresh"
          description="Lobby page refresh button text"
        />
      </Button>
      <FlexBox
        flexDirection="row"
        flexWrap="wrap"
        gap={0}
        width={isLandscape ? '60vw' : '100%'}
      >
        {roomServerPairs.map((pair, index) => (
          <RoomCard
            key={pair.room.id}
            ping={serverPings[pair.server!.data()!.url]}
            room={pair.room}
            server={pair.server!}
            large={index === 0}
          />
        ))}
      </FlexBox>
    </Page>
  );
}
