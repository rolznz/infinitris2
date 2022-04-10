import FlexBox from '@/components/ui/FlexBox';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import Typography from '@mui/material/Typography';
import { GameModeType, GameModeTypeValues } from 'infinitris2-models';
import grassImage from '@/components/pages/SinglePlayerPage/assets/carousel/grass.svg';

import { ReactComponent as ConquestIcon } from '@/icons/conquest.svg';
import { ReactComponent as InfinityIcon } from '@/icons/infinity.svg';
import { ReactComponent as ProfileIcon } from '@/icons/profile.svg';
import RunCircleIcon from '@mui/icons-material/RunCircle';
import { FormattedMessage } from 'react-intl';
import { textShadows } from '@/theme/theme';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';

export type RoomCarouselSlideProps = {
  gameModeType: GameModeType;
  key: string;
  name?: string;
  numPlayers?: number;
};

export function RoomCarouselSlide({
  numPlayers,
  gameModeType,
  name,
}: RoomCarouselSlideProps) {
  const isLandscape = useIsLandscape();
  return (
    <FlexBox
      key={gameModeType}
      width="100vw"
      height="100vh"
      sx={{
        background: getBackground(gameModeType),
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPositionY: '100%',
      }}
      position="relative"
    >
      {name && (
        <FlexBox
          position="absolute"
          width="100%"
          top={isLandscape ? '7%' : '150px'}
        >
          <Typography
            variant={isLandscape ? 'h1' : 'h2'}
            sx={{ textShadow: textShadows.base }}
          >
            {name}
          </Typography>
        </FlexBox>
      )}
      <FlexBox
        position="absolute"
        width="100%"
        bottom={0}
        height="30%"
        sx={{
          background:
            'linear-gradient(180deg, rgba(47, 107, 113, 0) 0%, #04555C 53.65%, #00363C 73.96%, #012024 100%)',
        }}
      />
      <FlexBox
        position="absolute"
        bottom="10%"
        left="5%"
        gap={1}
        alignItems="flex-start"
      >
        <FlexBox flexDirection="row" gap={1}>
          <SvgIcon color="primary">
            <GameModeIcon gameModeType={gameModeType} />
          </SvgIcon>
          <Typography variant="h1">{gameModeType}</Typography>
          {numPlayers !== undefined && (
            <FlexBox flexDirection="row">
              <SvgIcon color="primary">
                <ProfileIcon />
              </SvgIcon>
              <Typography variant="body1">{numPlayers}</Typography>
            </FlexBox>
          )}
        </FlexBox>
        <Typography variant="body2">
          <GameModeDescription gameModeType={gameModeType} />
        </Typography>
      </FlexBox>
    </FlexBox>
  );
}

function GameModeIcon(props: { gameModeType: GameModeType }) {
  switch (props.gameModeType) {
    case 'infinity':
      return <InfinityIcon />;
    case 'race':
      return <RunCircleIcon />;
    case 'conquest':
      return <ConquestIcon />;
    default:
      throw new Error('No description for ' + props.gameModeType);
  }
}

function GameModeDescription(props: { gameModeType: GameModeType }) {
  switch (props.gameModeType) {
    case 'infinity':
      return (
        <FormattedMessage
          defaultMessage="Play at your own pace. No rounds or time limits."
          description="Infinity Game mode description"
        />
      );
    case 'race':
      return (
        <FormattedMessage
          defaultMessage="Keep your score high to stay in the game."
          description="Race Game mode description"
        />
      );
    case 'conquest':
      return (
        <FormattedMessage
          defaultMessage="Capture columns by holding the bottom row."
          description="Conquest Game mode description"
        />
      );
    default:
      throw new Error('No description for ' + props.gameModeType);
  }
}

function getBackground(gameModeType: GameModeType): string {
  return `url(${grassImage}); filter: hue-rotate(${
    GameModeTypeValues.indexOf(gameModeType) * 45
  }deg);`;
}
