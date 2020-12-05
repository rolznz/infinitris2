import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import * as firebase from 'firebase/app';
import { Box, Button, Grid, Link, TextField } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import Room from 'infinitris2-models/src/Room';
import useAppStore from '../../state/AppStore';
import useHomeStore from '../../state/HomeStore';
import RoomCard from '../RoomCard';

export default function HomePage() {
  const appStore = useAppStore();
  const homeStore = useHomeStore();
  const [rooms, loadingRooms] = useCollectionData<Room>(
    firebase.firestore().collection('rooms'),
    { idField: 'id' }
  );
  const selectedRoom = homeStore.selectedRoom || rooms?.[0];
  const loading = loadingRooms && !selectedRoom;

  return (
    <>
      <Box flex={1} display="flex" justifyContent="center">
        <Grid container justify="center" alignItems="center">
          <Grid item xs={10} md={4} sm={6} style={{ maxWidth: '300px' }}>
            <Box flex={1} display="flex" flexDirection="column">
              <TextField
                placeholder="Nickname"
                value={appStore.user.nickname}
                onChange={(e) => appStore.setNickname(e.target.value)}
              />
              <Box mt={2} px={1} style={{ opacity: 0.5 }}>
                <Link
                  component={RouterLink}
                  underline="none"
                  to="/lobby"
                  style={{ opacity: 0.5 }}
                >
                  <RoomCard loading={loading} room={selectedRoom} />
                </Link>
              </Box>

              <Box mt={2} display="flex" justifyContent="center">
                {!loading ? (
                  <Link
                    component={RouterLink}
                    underline="none"
                    to={`/rooms/${selectedRoom?.id}`}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      style={{
                        background:
                          'linear-gradient(45deg, #6dccee 10%, #6a35d5 160%)',
                      }}
                    >
                      Play
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
