import React from 'react';
import { IconButton } from '@mui/material';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { keyframes } from '@mui/system';
import { firstTimeAnimationDelaySeconds } from './homePageConstants';
import { gameModePickerId } from '@/components/ui/GameModePicker/GameModePicker';

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
}

function _PlayButton({ isLoaded, delayButtonVisibility }: PlayButtonProps) {
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
      onClick={scrollGameModePickerIntoView}
    >
      <PlayArrowIcon sx={{ width: 48, height: 48 }} />
    </IconButton>
  );
}

export const PlayButton = React.memo(
  _PlayButton,
  (prevProps, nextProps) => prevProps.isLoaded === nextProps.isLoaded
);
