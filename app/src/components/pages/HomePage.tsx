import React, { useState } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import * as firebase from 'firebase/app';
import {
  Box,
  Button,
  Grid,
  Link,
  makeStyles,
  TextField,
} from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import useHomeStore from '../../state/HomeStore';
import RoomCard from '../RoomCard';
import Routes from '../../models/Routes';
import { FormattedMessage, useIntl } from 'react-intl';
import useDemo from '../hooks/useDemo';
import { IRoom } from 'infinitris2-models';
import useUserStore from '../../state/UserStore';
import { useCollection } from '@nandorojo/swr-firestore';

export default function HomePage() {
  useDemo();
  const userStore = useUserStore();
  const homeStore = useHomeStore();
  const { data: rooms } = useCollection<IRoom>(
    firebase.firestore().collection('rooms').path
  );
  const [hasFocusedPlayButton, setHasFocusedPlayButton] = useState(false);
  const selectedRoom = homeStore.selectedRoom || rooms?.[0];
  const isLoading = !selectedRoom;

  const useStyles = makeStyles({
    playButton: {
      borderRadius: '0px',
      background: 'linear-gradient(45deg, #6dccee 10%, #6a35d5 160%)',
    },
  });

  const classes = useStyles();
  const intl = useIntl();

  return (
    <>
      <Box flex={1} display="flex" justifyContent="center">
        <Grid container justify="center" alignItems="center">
          <Grid item xs={10} md={4} sm={6} style={{ maxWidth: '300px' }}>
            <Box flex={1} display="flex" flexDirection="column">
              <TextField
                placeholder={intl.formatMessage({
                  defaultMessage: 'Nickname',
                  description: 'Nickname textbox placeholder',
                })}
                value={userStore.user.nickname}
                onChange={(e) => userStore.setNickname(e.target.value)}
              />
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
      </Box>
    </>
  );
}
