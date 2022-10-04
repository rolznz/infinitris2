import FlexBox from '@/components/ui/FlexBox';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import Typography from '@mui/material/Typography';
import {
  GameModeType,
  getVariationHueRotation,
  IChallenge,
  SimulationSettings,
  WorldType,
  WorldVariation,
  WorldVariationValues,
  getKnockoutPointDifference,
} from 'infinitris2-models';
import grassImage from '@/components/ui/RoomCarousel/assets/carousel/grass_desktop.svg';
import desertImage from '@/components/ui/RoomCarousel/assets/carousel/desert_desktop.svg';
import volcanoImage from '@/components/ui/RoomCarousel/assets/carousel/volcano_desktop.svg';
import spaceImage from '@/components/ui/RoomCarousel/assets/carousel/space_desktop.svg';
import grassImageMobile from '@/components/ui/RoomCarousel/assets/carousel/grass_mobile.svg';
import desertImageMobile from '@/components/ui/RoomCarousel/assets/carousel/desert_mobile.svg';
import volcanoImageMobile from '@/components/ui/RoomCarousel/assets/carousel/volcano_mobile.svg';
import spaceImageMobile from '@/components/ui/RoomCarousel/assets/carousel/space_mobile.svg';

import { ReactComponent as ConquestIcon } from '@/icons/conquest.svg';
import { ReactComponent as InfinityIcon } from '@/icons/infinity.svg';
import { ReactComponent as ProfileIcon } from '@/icons/profile.svg';
import RunCircleIcon from '@mui/icons-material/RunCircle';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { FormattedMessage } from 'react-intl';
import { textShadows } from '@/theme/theme';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import { ChallengeGridPartialPreview } from '@/components/pages/ChallengesPage/ChallengeGridPartialPreview';
import { useWindowSize } from 'react-use';
import React from 'react';
import { SxProps } from '@mui/material/styles';

const nameSx: SxProps = { textShadow: textShadows.base };
const fadeSx: SxProps = {
  background:
    'linear-gradient(180deg, rgba(0,0,0, 0.0) 0%, rgba(0,0,0, 0.1) 20%, rgba(0, 0, 0, 0.8) 100%)',
};

export type RoomCarouselSlideProps = {
  simulationSettings?: SimulationSettings;
  customText?: React.ReactNode;
  name?: string;
  numPlayers?: number;
  worldType?: WorldType;
  worldVariation?: WorldVariation;
  isLocked?: boolean;
  grid?: IChallenge['grid'];
  id: string;
};

export function RoomCarouselSlide({
  numPlayers,
  simulationSettings,
  customText,
  name,
  worldType,
  worldVariation,
  grid,
  id,
}: RoomCarouselSlideProps) {
  const gameModeType: GameModeType | undefined =
    simulationSettings?.gameModeType || 'infinity';
  const isLandscape = useIsLandscape();
  const windowSize = useWindowSize();
  const backgroundSx = React.useMemo(
    () =>
      ({
        background: getBackground(isLandscape, worldType, worldVariation),
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPositionY: '100%',
        backgroundPositionX: '22%',
      } as SxProps),
    [isLandscape, worldType, worldVariation]
  );
  return (
    <FlexBox key={id} width="100vw" height="100vh" position="relative">
      <FlexBox
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        sx={backgroundSx}
      />
      {grid && typeof grid === 'string' && (
        <FlexBox
          position="absolute"
          width="100vw"
          height="100vh"
          top={0}
          left={0}
          overflow="hidden"
        >
          <ChallengeGridPartialPreview
            grid={grid}
            aspectRatio={windowSize.width / windowSize.height}
            numRows={isLandscape ? 16 : 24}
            width={windowSize.width}
          />
        </FlexBox>
      )}
      {name && (
        <FlexBox
          position="absolute"
          width="100%"
          top={isLandscape ? '7%' : '150px'}
        >
          <Typography variant={isLandscape ? 'h1' : 'h2'} sx={nameSx}>
            {name}
          </Typography>
        </FlexBox>
      )}
      <FlexBox
        position="absolute"
        width="100%"
        bottom={0}
        height="50%"
        sx={fadeSx}
      />
      <FlexBox
        position="absolute"
        bottom="10%"
        left="5%"
        gap={1}
        alignItems="flex-start"
        //zIndex="above"
      >
        <FlexBox flexDirection="row" gap={1}>
          {customText}

          {numPlayers !== undefined && (
            <FlexBox flexDirection="row">
              <SvgIcon color="primary">
                <ProfileIcon />
              </SvgIcon>
              <Typography variant="body1">{numPlayers}</Typography>
            </FlexBox>
          )}
        </FlexBox>
        {gameModeType && (!grid || typeof grid !== 'string') && (
          <FlexBox alignItems="flex-start">
            <FlexBox flexDirection="row" gap={1}>
              <SvgIcon color="primary">
                <GameModeIcon gameModeType={gameModeType} />
              </SvgIcon>
              <Typography variant="h1">
                {gameModeType.replace('-', ' ')}
              </Typography>
            </FlexBox>
            <Typography variant="body2">
              <GameModeDescription
                gameModeType={gameModeType}
                simulationSettings={simulationSettings}
              />
            </Typography>
          </FlexBox>
        )}
      </FlexBox>
    </FlexBox>
  );
}

function GameModeIcon(props: { gameModeType: GameModeType }) {
  switch (props.gameModeType) {
    case 'infinity':
      return <InfinityIcon />;
    case 'race':
    case 'escape':
      return <RunCircleIcon />;
    case 'garbage-defense':
      return <RestoreFromTrashIcon />;
    case 'battle':
      return <WhatshotIcon />;
    case 'conquest':
    case 'column-conquest':
      return <ConquestIcon />;
    default:
      throw new Error('No description for ' + props.gameModeType);
  }
}

export function GameModeDescription(props: {
  gameModeType: GameModeType;
  simulationSettings: SimulationSettings | undefined;
}) {
  switch (props.gameModeType) {
    case 'infinity':
      return (
        <FormattedMessage
          defaultMessage="Play at your own pace. No rounds or time limits."
          description="Infinity game mode description"
        />
      );
    case 'race':
      return (
        <FormattedMessage
          defaultMessage="Get more than {knockoutPointDifference} points ahead to knock out other players."
          description="Race game mode description"
          values={{
            knockoutPointDifference: getKnockoutPointDifference(
              props.simulationSettings
            ),
          }}
        />
      );
    case 'conquest':
      return (
        <FormattedMessage
          defaultMessage="Capture other players' cells to knock them out of the game"
          description="Conquest game mode description"
        />
      );
    case 'column-conquest':
      return (
        <FormattedMessage
          defaultMessage="Capture columns by holding the bottom row."
          description="Column Conquest game mode description"
        />
      );
    case 'battle':
      return (
        <FormattedMessage
          defaultMessage="Conquest with Bombs"
          description="Battle game mode description"
        />
      );
    case 'garbage-defense':
      return (
        <FormattedMessage
          defaultMessage="Stop the garbage reaching the top of the grid"
          description="Garbage Defense game mode description"
        />
      );
    case 'escape':
      return (
        <FormattedMessage
          defaultMessage="Escape the wall of fire for as long as you can"
          description="Escape game mode description"
        />
      );
    default:
      throw new Error('No description for ' + props.gameModeType);
  }
}

function getBackground(
  isLandscape: boolean,
  worldType: WorldType | undefined,
  worldVariation: WorldVariation | undefined
): string {
  let image: string = isLandscape ? grassImage : grassImageMobile;
  switch (worldType) {
    case undefined:
      break;
    case 'grass':
      break;
    case 'desert':
      image = isLandscape ? desertImage : desertImageMobile;
      break;
    case 'volcano':
      image = isLandscape ? volcanoImage : volcanoImageMobile;
      break;
    case 'space':
      image = isLandscape ? spaceImage : spaceImageMobile;
      break;
    default:
      throw new Error('Unsupported world type: ' + worldType);
  }

  const hueRotation = getVariationHueRotation(
    WorldVariationValues.indexOf(worldVariation || '0')
  );

  return `url(${image}); filter: hue-rotate(${hueRotation}deg);`;
}
