import { QueryDocumentSnapshot } from 'firebase/firestore';
import { IRoom, roomsPath, IServer, serversPath } from 'infinitris2-models';
import React from 'react';
import { useCollection } from 'swr-firestore';

export const MAX_PING = 10000;
export type ServerPings = { [url: string]: number };
export type RoomServerPair = {
  room: QueryDocumentSnapshot<IRoom>;
  server: QueryDocumentSnapshot<IServer> | undefined;
};

let cachedServerPings: ServerPings = {};

export function useLobbyServers(lastSelectedRoomId?: string) {
  const { data: rooms, mutate: mutateRooms } = useCollection<IRoom>(roomsPath);
  const { data: servers, mutate: mutateServers } =
    useCollection<IServer>(serversPath);
  const [serverPings, setServerPings] =
    React.useState<ServerPings>(cachedServerPings);

  React.useEffect(() => {
    cachedServerPings = serverPings;
  }, [serverPings]);

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
        console.log('Pinging', server.data().url);
        serverPings[server.data().url] = MAX_PING;
        pingServer(server.data().url, (ping) =>
          setServerPings((existingValue) => ({
            ...existingValue,
            [server.data().url]: ping,
          }))
        );
      }
    }
  }, [servers, serverPings, setServerPings]);

  const validServers = servers?.filter(
    (server) => serverPings[server.data().url] < MAX_PING
  );

  const roomServerPairs: RoomServerPair[] | undefined = React.useMemo(
    () =>
      rooms
        ?.map((room) => ({
          room,
          server: validServers?.find(
            (server) => server.id === room.data()!.serverId
          ),
        }))
        .filter((pair) => pair.server)
        .sort((a, b) =>
          a.room.id === lastSelectedRoomId
            ? -1
            : b.room.id === lastSelectedRoomId
            ? 1
            : serverPings[a.server!.data().url] -
                serverPings[b.server!.data().url] ||
              (b.room.data().numPlayers || 0) - (a.room.data().numPlayers || 0)
        ),
    [rooms, serverPings, validServers, lastSelectedRoomId]
  );

  return { roomServerPairs, refresh };
}

export const pingServer = async (
  url: string,
  onConnected: (ping: number) => void
) => {
  try {
    const startTime = Date.now();
    const socket = new WebSocket(url);
    socket.onopen = () => {
      onConnected(Date.now() - startTime);
      socket.close();
    };
  } catch (error) {
    console.error(error);
  }
};
