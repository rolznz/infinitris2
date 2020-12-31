import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { useCollectionData } from 'react-firebase-hooks/firestore';
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
import Room from 'infinitris2-models/src/Room';
import useAppStore from '../../state/AppStore';
import useHomeStore from '../../state/HomeStore';
import RoomCard from '../RoomCard';
import Routes from '../../models/Routes';
import { FormattedMessage, useIntl } from 'react-intl';
import useDemo from '../hooks/useDemo';

export default function HomePage() {
  useDemo();
  const appStore = useAppStore();
  const homeStore = useHomeStore();
  const [rooms, loadingRooms] = useCollectionData<Room>(
    firebase.firestore().collection('rooms'),
    { idField: 'id' }
  );
  const selectedRoom = homeStore.selectedRoom || rooms?.[0];
  const loading = loadingRooms && !selectedRoom;

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
                value={appStore.user.nickname}
                onChange={(e) => appStore.setNickname(e.target.value)}
              />
              <Box mt={2} px={1} style={{ opacity: 0.5 }}>
                <Link
                  component={RouterLink}
                  underline="none"
                  to={Routes.lobby}
                  style={{ opacity: 0.5 }}
                >
                  <RoomCard loading={loading} room={selectedRoom} />
                </Link>
              </Box>

              <Box mt={2} display="flex" justifyContent="center">
                {!loading ? (
                  <Link
                    ref={(element: HTMLSpanElement | null) =>
                      element && element.focus()
                    }
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
