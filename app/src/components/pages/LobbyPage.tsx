import React from 'react';
import List from '@material-ui/core/List';
import Skeleton from '@material-ui/lab/Skeleton';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import * as firebase from 'firebase/app';
import { Box, Grid, Link, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import Room from 'infinitris2-models/src/Room';
import useHomeStore from '../../state/HomeStore';
import RoomCard from '../RoomCard';
import Routes from '../../models/Routes';

export default function LobbyPage() {
  const [rooms, loading] = useCollectionData<Room>(
    firebase.firestore().collection('rooms'),
    { idField: 'id' }
  );
  const homeStore = useHomeStore();

  return (
    <>
      <Box flex={1} display="flex" justifyContent="center">
        <Grid container justify="center">
          <Grid item xs={12} md={4}>
            <Box height={20} px={2} display="flex" justifyContent="flex-end">
              {loading ? (
                <Skeleton height={28} width={48} />
              ) : (
                <Typography variant="caption">{rooms?.length} Rooms</Typography>
              )}
            </Box>
            <List>
              {rooms?.map((room) => (
                <Link
                  component={RouterLink}
                  key={room.id}
                  underline="none"
                  to={Routes.home}
                  onClick={() => homeStore.setSelectedRoom(room)}
                  style={{ marginBottom: 2 }}
                >
                  <RoomCard room={room} />
                </Link>
              ))}
            </List>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
