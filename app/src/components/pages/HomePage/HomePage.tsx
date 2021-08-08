import React, { useState } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  Box,
  Button,
  Grid,
  Link,
  makeStyles,
  TextField,
} from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import useHomeStore from '../../../state/HomeStore';
import RoomCard from '../../RoomCard';
import Routes from '../../../models/Routes';
import { FormattedMessage, useIntl } from 'react-intl';

import { IRoom, roomsPath } from 'infinitris2-models';
import { useCollection } from '@nandorojo/swr-firestore';
import { useUserStore } from '../../../state/UserStore';
import useAuthStore from '@/state/AuthStore';
import useIncompleteChallenges from '../../hooks/useIncompleteChallenges';

import logoImage from './assets/logo.png';
import foregroundTopImage from './assets/foreground_top.png';
import backgroundImage from './assets/background.png';
import foregroundBottomImage from './assets/foreground_bottom.png';
import FlexBox from '@/components/ui/FlexBox';
import { useEffect } from 'react';
import { storage } from '@/firebase';
import ReactHowler from 'react-howler';

export default function HomePage() {
  const userStore = useUserStore();
  const isLoggedIn = useAuthStore((authStore) => !!authStore.user);
  const homeStore = useHomeStore();
  const { data: rooms } = useCollection<IRoom>(roomsPath);
  const [hasFocusedPlayButton, setHasFocusedPlayButton] = useState(false);
  // TODO: move to music player
  const [musicOn] = useState(false);
  const selectedRoom = homeStore.selectedRoom || rooms?.[0];
  const [menuUrl, setMenuUrl] = useState<string>();
  const isLoading = !selectedRoom;
  const {
    incompleteChallenges,
    isLoadingOfficialChallenges,
  } = useIncompleteChallenges();

  useEffect(() => {
    if (musicOn) {
      storage
        .ref(`/music/menu.mp3`)
        .getDownloadURL()
        .then((url) => {
          console.log('Got download url: ', url);
          setMenuUrl(url);
        });
    }
  }, [musicOn]);

  const useStyles = makeStyles({
    playButton: {
      borderRadius: '0px',
      background: 'linear-gradient(45deg, #6dccee 10%, #6a35d5 160%)',
    },
  });

  const classes = useStyles();
  const intl = useIntl();

  return (
    <div
      style={{
        height: '100%',
        backgroundImage: 'url(' + backgroundImage + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {musicOn && menuUrl && <ReactHowler src={menuUrl} playing loop html5 />}
      <img
        src={foregroundTopImage}
        style={{
          width: '100vw',
          height: 'auto',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      <img
        src={foregroundBottomImage}
        style={{
          width: '100vw',
          height: 'auto',
          position: 'absolute',
          bottom: 0,
          left: 0,
        }}
      />
      <FlexBox height="100%" alignItems="center">
        <img
          src={logoImage}
          alt="Logo"
          style={{ width: '25vh', height: 'auto' }}
        />
        <Grid container justify="center" alignItems="center">
          <Grid item xs={10} md={4} sm={6} style={{ maxWidth: '300px' }}>
            <Box flex={1} display="flex" flexDirection="column">
              <TextField
                placeholder={intl.formatMessage({
                  defaultMessage: 'Nickname',
                  description: 'Nickname textbox placeholder',
                })}
                value={userStore.user.readOnly?.nickname || ''}
                onChange={(e) => userStore.setNickname(e.target.value)}
              />
              {(isLoggedIn ||
                (!isLoadingOfficialChallenges &&
                  !incompleteChallenges.length)) && (
                <Box mt={2} px={1} style={{ opacity: 0.5 }}>
                  <Link
                    component={RouterLink}
                    underline="none"
                    to={Routes.lobby}
                    style={{ opacity: 0.5 }}
                  >
                    <RoomCard loading={isLoading} room={selectedRoom} />
                  </Link>
                </Box>
              )}

              <Box mt={2} display="flex" justifyContent="center">
                {!isLoading ? (
                  <Link
                    ref={(element: HTMLSpanElement | null) => {
                      if (element && !hasFocusedPlayButton) {
                        setHasFocusedPlayButton(true);
                        element.focus();
                      }
                    }}
                    component={RouterLink}
                    underline="none"
                    to={`${Routes.rooms}/${selectedRoom?.id}`}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      className={classes.playButton}
                    >
                      <FormattedMessage
                        defaultMessage="Play"
                        description="Play button text"
                      />
                    </Button>
                  </Link>
                ) : (
                  <Skeleton width={80} height={40} variant="rect" />
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </FlexBox>
    </div>
  );
}
