import { useHistory } from 'react-router-dom';
import Routes from '../../../models/Routes';
import { Page } from '../../ui/Page';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { launchFullscreen } from '@/utils/launchFullscreen';
import { useIntl } from 'react-intl';
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
import { GameModeTypeValues } from 'infinitris2-models';
import Typography from '@mui/material/Typography';
import { ReactComponent as ConquestIcon } from '@/icons/gameMode-conquest.svg';
import { ReactComponent as SettingsIcon } from '@/icons/settings.svg';
import { RingIconButton } from '@/components/ui/RingIconButton';
import { SvgIcon } from '@mui/material';
import { borderRadiuses, boxShadows } from '@/theme/theme';
import React from 'react';

const slides: React.ReactNode[] = GameModeTypeValues.map((gameModeType) => (
  <FlexBox
    key={gameModeType}
    width="100vw"
    height="100vh"
    sx={{ background: `url(${grassImage})`, backgroundSize: 'cover' }}
    position="relative"
  >
    <FlexBox
      position="absolute"
      bottom="10%"
      left="5%"
      gap={1}
      alignItems="flex-start"
    >
      <FlexBox flexDirection="row" gap={1}>
        <ConquestIcon />
        <Typography variant="h1">{gameModeType}</Typography>
      </FlexBox>
      <Typography variant="body2">
        Play at your own pace. No rounds or time limits.
      </Typography>
    </FlexBox>
  </FlexBox>
));

export function SinglePlayerGameModePickerPage() {
  const intl = useIntl();
  const history = useHistory();

  const onSubmit = () => {
    playSound(SoundKey.click);
    launchFullscreen();
    const formData = useSinglePlayerOptionsStore.getState().formData;
    const searchParams = new URLSearchParams();
    Object.entries(formData).forEach((entry) => {
      searchParams.append(entry[0], entry[1].toString());
    });
    history.push(Routes.singlePlayerPlay + '?' + searchParams);
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
              bottom: 0,
              width: '100vw',
            }}
            scaleTransform={false}
            innerArrows
          />
        </div>
      }
    >
      <Button
        autoFocus
        color="primary"
        variant="contained"
        sx={{ mt: 2 }}
        onClick={onSubmit}
      >
        Play
      </Button>
      <Link
        component={RouterLink}
        underline="none"
        to={Routes.singlePlayerOptions}
        style={{ position: 'absolute', bottom: '5%', right: '2%' }}
      >
        <SecondaryIconButton>
          <SvgIcon color="secondary" fontSize="large">
            <SettingsIcon />
          </SvgIcon>
        </SecondaryIconButton>
      </Link>
    </Page>
  );
}

function SecondaryIconButton({ children }: React.PropsWithChildren<{}>) {
  return (
    <FlexBox
      style={{
        background: 'rgba(248, 248, 246, 0.3)',
        boxShadow: boxShadows.small,
        borderRadius: borderRadiuses.full,
        padding: '10px',
      }}
    >
      {children}
    </FlexBox>
  );
}
