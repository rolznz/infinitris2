import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ReactComponent as RefreshIcon } from '@/icons/refresh.svg';
import { RoomCarousel } from '@/components/ui/RoomCarousel/RoomCarousel';
import { ReactComponent as InfoIcon } from '@/icons/i.svg';
import Routes from '@/models/Routes';
import { RoomCarouselSlideProps } from '@/components/ui/RoomCarousel/RoomCarouselSlide';
import { useHistory } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import { useLobbyServers } from '@/components/hooks/useLobbyServers';
import useLatest from 'react-use/lib/useLatest';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import useIncompleteChallenges from '@/components/hooks/useIncompleteChallenges';
import { useSnackbar } from 'notistack';
import { appName } from '@/utils/constants';
import { ReactComponent as PlayIcon } from '@/icons/play.svg';
import { ReactComponent as CloseIcon } from '@/icons/x.svg';
import FlexBox from '@/components/ui/FlexBox';
import useLoaderStore from '@/state/LoaderStore';

let cachedRoomId: string | undefined;

export default function LobbyPage() {
  const history = useHistory();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const { roomServerPairs, refresh } = useLobbyServers(cachedRoomId);
  const latestCurrentSlide = useLatest(currentSlide);
  const latestRoomServerPairs = useLatest(roomServerPairs);
  const incompleteChallengesCount =
    useIncompleteChallenges('grass').incompleteChallenges?.length || 0;
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const intl = useIntl();
  const loaderHasFinished = useLoaderStore((store) => store.hasFinished);

  // TODO: consider moving this code to a shared hook and show on other pages too
  React.useEffect(() => {
    if (incompleteChallengesCount > 0 && loaderHasFinished) {
      enqueueSnackbar(
        intl.formatMessage(
          {
            defaultMessage: `New to {appName}? play the tutorial!`,
            description: 'New player tutorial recommendation message',
          },
          { appName }
        ),
        {
          persist: true,
          variant: 'info',
          action: (
            <FlexBox flexDirection="row" gap={1}>
              <IconButton
                onClick={() => {
                  closeSnackbar();
                  history.push(Routes.storyMode);
                }}
              >
                <SvgIcon color="primary" fontSize="large">
                  <PlayIcon />
                </SvgIcon>
              </IconButton>
              <IconButton onClick={() => closeSnackbar()}>
                <SvgIcon color="primary" fontSize="small">
                  <CloseIcon />
                </SvgIcon>
              </IconButton>
            </FlexBox>
          ),
        }
      );
    }
  }, [
    incompleteChallengesCount,
    enqueueSnackbar,
    intl,
    closeSnackbar,
    history,
    loaderHasFinished,
  ]);

  const slides: RoomCarouselSlideProps[] | undefined = React.useMemo(
    () =>
      roomServerPairs?.map((pair) => {
        const slideProps: RoomCarouselSlideProps = {
          simulationSettings: pair.room.data().simulationSettings,
          worldType: pair.room.data().worldType,
          name: pair.room.data().name,
          numPlayers: pair.room.data().numHumans,
          id: pair.room.id,
          worldVariation: pair.room.data().worldVariation || '0',
        };
        return slideProps;
      }),
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
                <SvgIcon color="primary" fontSize="small">
                  <RefreshIcon />
                </SvgIcon>
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
