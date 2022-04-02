import { IRoom, IServer } from 'infinitris2-models';
import { Link as RouterLink } from 'react-router-dom';
import React from 'react';
import Routes from '@/models/Routes';
import Link from '@mui/material/Link';
import { SvgIcon, Typography } from '@mui/material';
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
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { launchFullscreen } from '@/utils/launchFullscreen';
//import { useIsLandscape } from '@/components/hooks/useIsLandscape';

export const MAX_PING = 10000;

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
  server: DocumentSnapshot<IServer>;
  ping: number;
  large: boolean;
}

export default function RoomCard({ large, ping, room, server }: RoomCardProps) {
  const connectionQuality =
    connectionQualities.find((c) => c.max >= ping) ||
    connectionQualities[connectionQualities.length - 1];
  const link = `${Routes.rooms}/${room.id}`;
  const isLandscape = useIsLandscape();
  return (
    <Link
      key={room.id}
      component={RouterLink}
      to={link}
      onClick={() => {
        playSound(SoundKey.click);
        launchFullscreen();
      }}
      underline="none"
      sx={{
        width: large ? '100%' : !isLandscape ? '50%' : undefined,
        height: large ? 'min(60vw, 60vh)' : undefined,
        maxWidth: large ? undefined : '50%',
        minWidth: large ? undefined : '25%',
      }}
    >
      <FlexBox p={1} width="100%" height="100%">
        <FlexBox
          p={4}
          boxShadow={boxShadows.small}
          position="relative"
          width="100%"
          height="100%"
          minHeight="200px"
          sx={{
            backgroundImage: 'url(/og2.png)',
            justifyContent: 'flex-start',
          }}
        >
          <Typography>{room.data()!.name}</Typography>
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

            {server.data()!.region && (
              <img
                src={`https://flagcdn.com/w20/${server.data()!.region}.png`}
                alt={server.data()!.region}
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
      </FlexBox>
    </Link>
  );
}
