// import React, { useState } from 'react';
// import List from '@mui/material/List';
// import Skeleton from '@mui/material/Skeleton';
// import { Box, Grid, Link, Typography } from '@mui/material';
// import { Link as RouterLink } from 'react-router-dom';
// import { IRoom, roomsPath } from 'infinitris2-models';
// import useHomeStore from '../../state/HomeStore';
// import RoomCard from '../ui/RoomCard';
// import Routes from '../../models/Routes';
// import { FormattedMessage } from 'react-intl';
// import { useCollection } from 'swr-firestore';

// export default function LobbyPage() {
//   const { data: rooms } = useCollection<IRoom>(roomsPath);
//   const homeStore = useHomeStore();
//   const [hasFocusedFirstEntry, setHasFocusedFirstEntry] = useState(false);

//   return (
//     <>
//       <Box flex={1} display="flex" justifyContent="center">
//         <Grid container justifyContent="center">
//           <Grid item xs={12} md={4}>
//             <Box height={20} px={2} display="flex" justifyContent="flex-end">
//               {!rooms ? (
//                 <Skeleton height={28} width={48} />
//               ) : (
//                 <Typography variant="caption">
//                   <FormattedMessage
//                     defaultMessage="{numRooms} Rooms"
//                     description="Number of rooms"
//                     values={{
//                       numRooms: rooms?.length,
//                     }}
//                   />
//                 </Typography>
//               )}
//             </Box>
//             <List>
//               {rooms?.map((room, index) => (
//                 <Link
//                   ref={
//                     index === 0
//                       ? (element: HTMLSpanElement | null) => {
//                           if (element && !hasFocusedFirstEntry) {
//                             setHasFocusedFirstEntry(true);
//                             element.focus();
//                           }
//                         }
//                       : null
//                   }
//                   component={RouterLink}
//                   key={room.id}
//                   underline="none"
//                   to={Routes.home}
//                   onClick={() => homeStore.setSelectedRoom(room)}
//                   style={{ marginBottom: 2 }}
//                 >
//                   <RoomCard room={room} />
//                 </Link>
//               ))}
//             </List>
//           </Grid>
//         </Grid>
//       </Box>
//     </>
//   );
// }

import React from 'react';
export default function LobbyPage() {
  return <p>TODO</p>;
}
