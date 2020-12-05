import { Card, CardActionArea, Box, Typography, Chip } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import FaceIcon from '@material-ui/icons/Face';
import { Room } from 'infinitris2-models';

interface RoomCardProps {
  room?: Room;
  loading?: boolean;
}

export default function RoomCard({ loading = false, room }: RoomCardProps) {
  return (
    <Card elevation={0} style={{ backgroundColor: 'transparent' }}>
      <CardActionArea>
        <Box flex={1} display="flex" alignItems="center" height={40}>
          {loading ? (
            <Skeleton height={40} width="100%" />
          ) : (
            <>
              <Box flex={1} width={50}>
                <Typography noWrap>{room?.name}</Typography>
              </Box>
              <Box ml={1}>
                <Chip
                  size="small"
                  style={{ pointerEvents: 'none' }}
                  label={room?.mode}
                />
              </Box>
              <Box ml={1}>
                <Chip
                  size="small"
                  style={{ pointerEvents: 'none' }}
                  icon={<FaceIcon />}
                  label="0 / 12"
                />
              </Box>
            </>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
}
