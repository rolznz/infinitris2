import { IRoom } from 'infinitris2-models';
import { Link as RouterLink } from 'react-router-dom';
import React from 'react';
import Routes from '@/models/Routes';
import Link from '@mui/material/Link';
import { Button, SvgIcon, Typography } from '@mui/material';
import { borderColorLight, borderRadiuses, boxShadows } from '@/theme/theme';
import SignalCellular4BarIcon from '@mui/icons-material/SignalCellular4Bar';
import SignalCellular3BarIcon from '@mui/icons-material/SignalCellular3Bar';
import SignalCellular2BarIcon from '@mui/icons-material/SignalCellular2Bar';
import SignalCellular1BarIcon from '@mui/icons-material/SignalCellular1Bar';
import SignalCellular0BarIcon from '@mui/icons-material/SignalCellular0Bar';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import FlexBox from '@/components/ui/FlexBox';
import { DocumentSnapshot } from 'firebase/firestore';

export const MAX_PING = 5000;

type ConnectionQuality = {
  max: number;
  icon: React.ReactNode;
  color: string;
};
const connectionQualities: ConnectionQuality[] = [
  {
    max: 200,
    icon: <SignalCellular4BarIcon />,
    color: '#00ff00',
  },
  {
    max: 500,
    icon: <SignalCellular3BarIcon />,
    color: '#66aa00',
  },
  {
    max: 1000,
    icon: <SignalCellular2BarIcon />,
    color: '#ff6600',
  },
  {
    max: 2000,
    icon: <SignalCellular1BarIcon />,
    color: '#ff3300',
  },
  {
    max: MAX_PING,
    icon: <SignalCellular0BarIcon />,
    color: '#ff0000',
  },
];

interface RoomCardProps {
  room: DocumentSnapshot<IRoom>;
  ping: number;
}

export default function RoomCard({ ping, room }: RoomCardProps) {
  const connectionQuality =
    connectionQualities.find((c) => c.max >= ping) ||
    connectionQualities[connectionQualities.length - 1];
  const link = `${Routes.rooms}/${room.id}`;
  return (
    <Link key={room.id} component={RouterLink} to={link}>
      <FlexBox p={4} boxShadow={boxShadows.small} position="relative">
        <Typography>{room.data()!.name}</Typography>
        <Button variant="contained" sx={{ m: 4 }}>
          Play
        </Button>
        <FlexBox
          position="absolute"
          bottom={0}
          right={0}
          flexDirection="row-reverse"
          gap={1}
          pb={1}
          pr={1}
        >
          <SvgIcon sx={{ color: connectionQuality.color }}>
            {connectionQuality.icon}
          </SvgIcon>

          {(room.data()! as any).serverRegion && (
            <img
              src={`https://flagcdn.com/w20/${
                (room.data()! as any).serverRegion
              }.png`}
              alt={(room.data()! as any).serverRegion}
            ></img>
          )}

          <FlexBox
            sx={{ bgcolor: borderColorLight }}
            borderRadius={borderRadiuses.base}
            flexDirection="row"
            p={0.5}
          >
            <PersonIcon />
            <Typography>0</Typography>
          </FlexBox>
          <FlexBox
            sx={{ bgcolor: borderColorLight }}
            borderRadius={borderRadiuses.base}
            flexDirection="row"
            p={0.5}
          >
            <SmartToyIcon />
            <Typography>0</Typography>
          </FlexBox>
        </FlexBox>
      </FlexBox>
    </Link>
  );
}
