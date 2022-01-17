import { IRoom, roomsPath } from 'infinitris2-models';
import { useCollection } from 'swr-firestore';
import React from 'react';
import RoomCard, { MAX_PING } from '@/components/ui/RoomCard';
import { Page } from '@/components/ui/Page';
import FlexBox from '@/components/ui/FlexBox';

export type RoomPings = { [url: string]: number };

export default function LobbyPage() {
  const { data: rooms } = useCollection<IRoom>(roomsPath);
  const [roomPings, setRoomPings] = React.useState<RoomPings>({});
  React.useEffect(() => {
    if (rooms) {
      for (const room of rooms) {
        if (!roomPings[room.data().url]) {
          const startTime = Date.now();
          console.log('Pinging', room.data().url);
          roomPings[room.data().url] = MAX_PING;
          (async () => {
            try {
              const socket = new WebSocket(room.data().url);
              socket.onopen = () => {
                setRoomPings((existingValue) => ({
                  ...existingValue,
                  [room.data().url]: Date.now() - startTime,
                }));
                socket.close();
              };
            } catch (error) {
              console.error(error);
            }
          })();
        }
      }
    }
  }, [rooms, roomPings, setRoomPings]);
  return (
    <Page title="Lobby">
      <FlexBox flexDirection="row" flexWrap="wrap" gap={1}>
        {rooms
          ?.filter((room) => roomPings[room.data().url] < MAX_PING)
          ?.sort((a, b) => roomPings[a.data().url] - roomPings[b.data().url])
          .map((room) => (
            <RoomCard
              key={room.id}
              ping={roomPings[room.data()!.url]}
              room={room}
            />
          ))}
      </FlexBox>
    </Page>
  );
}
