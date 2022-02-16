import React from 'react';
import { IconButton, SvgIcon } from '@mui/material';

import { ReactComponent as PlayArrowIcon } from '@/icons/play2.svg';

import { keyframes } from '@mui/system';
import { firstTimeAnimationDelaySeconds } from './homePageConstants';
import { gameModePickerId } from '@/components/ui/GameModePicker/GameModePicker';
import { playSound, SoundKey } from '@/components/sound/MusicPlayer';
import { requiresPwa } from '@/utils/isMobile';
import { useHistory } from 'react-router-dom';
import Routes from '@/models/Routes';

const playButtonAnimation = keyframes`
  0% {
    transform: scale(1.0);
    filter: drop-shadow(0 0 0.75rem white);
  }
  100% {
    transform: scale(1.1);
    filter:
      drop-shadow(0 0 0.75rem white) drop-shadow(0 0 1rem #ffffff);
  }
`;

type PlayButtonProps = { isLoaded: boolean; delayButtonVisibility: boolean };

function scrollGameModePickerIntoView() {
  const gameModePicker = document.getElementById(gameModePickerId);
  if (!gameModePicker) {
    return;
  }
  gameModePicker.style.display = 'flex';
  gameModePicker.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'start',
  });
  playSound(SoundKey.click);
}

function _PlayButton({ isLoaded, delayButtonVisibility }: PlayButtonProps) {
  const history = useHistory();
  return (
    <IconButton
      sx={{
        opacity: isLoaded ? 1 : 0,
        transition: delayButtonVisibility
          ? `opacity 2s ${firstTimeAnimationDelaySeconds}s`
          : undefined,
        backgroundColor: '#57bb50',
        borderColor: '#ffffff44',
        borderWidth: 6,
        borderStyle: 'solid',
        backgroundClip: 'padding-box',
        '&:hover': {
          backgroundColor: '#8ad785',
          filter:
            'drop-shadow(0 0 0.75rem white) drop-shadow(0 0 1rem #ffffff)',
        },
        filter: 'drop-shadow(0 0 0.75rem white)',
        animation: `${playButtonAnimation} 2000ms alternate infinite`,
        transform: 'scale(1.0)',
      }}
      size="large"
      onClick={() =>
        requiresPwa()
          ? history.push(Routes.pwa)
          : scrollGameModePickerIntoView()
      }
    >
      <SvgIcon sx={{ width: 32, height: 32, m: 1, marginLeft: 1.5 }}>
        <PlayArrowIcon style={{ color: 'white' }} />
      </SvgIcon>
    </IconButton>
  );
}

export const PlayButton = React.memo(
  _PlayButton,
  (prevProps, nextProps) => prevProps.isLoaded === nextProps.isLoaded
);
