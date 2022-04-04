import { useHistory } from 'react-router-dom';
import Routes from '../../../models/Routes';
import { Page } from '../../ui/Page';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { launchFullscreen } from '@/utils/launchFullscreen';
import { FormattedMessage } from 'react-intl';
import useSinglePlayerOptionsStore from '@/state/SinglePlayerOptionsStore';
import Button from '@mui/material/Button';
import {
  Carousel,
  fullScreenSwipeableViewsStyles,
} from '@/components/ui/Carousel';
import FlexBox from '@/components/ui/FlexBox';
import { Link as RouterLink } from 'react-router-dom';

import grassImage from './assets/carousel/grass.svg';
import Link from '@mui/material/Link';
import { GameModeType, GameModeTypeValues } from 'infinitris2-models';
import Typography from '@mui/material/Typography';
import { ReactComponent as ConquestIcon } from '@/icons/conquest.svg';
import { ReactComponent as InfinityIcon } from '@/icons/infinity.svg';
import { ReactComponent as SettingsIcon } from '@/icons/settings.svg';
import { SvgIcon } from '@mui/material';
import { borderColor, borderRadiuses, boxShadows } from '@/theme/theme';
import React from 'react';
import { PlayButton } from '@/components/pages/HomePage/PlayButton';
import lodashMerge from 'lodash.merge';
import { launchSinglePlayer } from '@/components/pages/SinglePlayerPage/SinglePlayerPage';
import RunCircleIcon from '@mui/icons-material/RunCircle';

const slides: React.ReactNode[] = GameModeTypeValues.map((gameModeType) => (
  <FlexBox
    key={gameModeType}
    width="100vw"
    height="100vh"
    sx={{
      background: `url(${grassImage}); filter: hue-rotate(${
        GameModeTypeValues.indexOf(gameModeType) * 45
      }deg);`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPositionY: '100%',
    }}
    position="relative"
  >
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
      </FlexBox>
      <Typography variant="body2">
        <GameModeDescription gameModeType={gameModeType} />
      </Typography>
    </FlexBox>
  </FlexBox>
));

export function SinglePlayerGameModePickerPage() {
  const history = useHistory();
  const formData = useSinglePlayerOptionsStore((store) => store.formData);

  const onSubmit = () => {
    playSound(SoundKey.click);
    launchFullscreen();
    launchSinglePlayer(history);
  };

  return (
    <Page
      style={{
        justifyContent: 'center',
      }}
      background={
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
          }}
        >
          <Carousel
            slides={slides}
            styles={fullScreenSwipeableViewsStyles}
            mobileStepperStyles={{
              position: 'absolute',
              bottom: '5%',
              width: '100vw',
            }}
            scaleTransform={false}
            innerArrows
            initialStep={GameModeTypeValues.indexOf(
              formData.simulationSettings.gameModeType!
            )}
            onChange={(step) =>
              useSinglePlayerOptionsStore.getState().setFormData(
                lodashMerge(formData, {
                  simulationSettings: {
                    gameModeType: GameModeTypeValues[step],
                  },
                })
              )
            }
          />
        </div>
      }
    >
      <PlayButton
        onClick={onSubmit}
        isLoaded={true}
        delayButtonVisibility={false}
      />
      <Link
        component={RouterLink}
        underline="none"
        to={Routes.singlePlayerOptions}
        style={{ position: 'absolute', bottom: '5%', right: '2%' }}
      >
        <SecondaryIconButton>
          <SettingsIcon />
        </SecondaryIconButton>
      </Link>
    </Page>
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

function SecondaryIconButton({ children }: React.PropsWithChildren<{}>) {
  return (
    <FlexBox
      style={{
        background: borderColor,
        boxShadow: boxShadows.small,
        borderRadius: borderRadiuses.full,
        padding: '10px',
        color: '#143950',
      }}
    >
      <SvgIcon fontSize="large">{children}</SvgIcon>
    </FlexBox>
  );
}
