import React from 'react';
import { FormattedMessage } from 'react-intl';
import RefreshIcon from '@mui/icons-material/Refresh';
import { RoomCarousel } from '@/components/ui/RoomCarousel';
import { ReactComponent as InfoIcon } from '@/icons/i.svg';
import Routes from '@/models/Routes';
import { RoomCarouselSlideProps } from '@/components/ui/RoomCarouselSlide';
import { useHistory } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import { useLobbyServers } from '@/components/hooks/useLobbyServers';
import useLatest from 'react-use/lib/useLatest';

let cachedRoomId: string | undefined;

export default function LobbyPage() {
  const history = useHistory();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const { roomServerPairs, refresh } = useLobbyServers(cachedRoomId);
  const latestCurrentSlide = useLatest(currentSlide);
  const latestRoomServerPairs = useLatest(roomServerPairs);

  const slides: RoomCarouselSlideProps[] | undefined = React.useMemo(
    () =>
      roomServerPairs?.map((pair) => ({
        gameModeType: pair.room.data().gameModeType || 'infinity',
        worldType: pair.room.data().worldType,
        name: pair.room.data().name,
        numPlayers: pair.room.data().numHumans,
        key: pair.room.id,
      })),
    [roomServerPairs]
  );

  const onSubmit = React.useCallback(() => {
    const room =
      latestRoomServerPairs.current![latestCurrentSlide.current]!.room;
    cachedRoomId = room.id;
    const link = `${Routes.rooms}/${room.id}`;

    history.push(link);
  }, [latestCurrentSlide, latestRoomServerPairs, history]);

  const currentRoom = React.useMemo(
    () => roomServerPairs?.[currentSlide]?.room,
    [roomServerPairs, currentSlide]
  );

  if (!slides) {
    return null;
  }

  return (
    <RoomCarousel
      title={
        <FormattedMessage
          defaultMessage="Multiplayer {refreshButton}"
          description="Lobby page title (multiplayer)"
          values={{
            refreshButton: (
              <IconButton onClick={refresh}>
                <RefreshIcon fontSize="small" color="primary" />
              </IconButton>
            ),
          }}
        />
      }
      secondaryIcon={<InfoIcon />}
      secondaryIconLink={
        currentRoom ? `${Routes.rooms}/${currentRoom.id}/info` : undefined
      }
      onPlay={onSubmit}
      slides={slides}
      initialStep={currentSlide}
      onChangeSlide={setCurrentSlide}
    />
  );
}
