import React from 'react';
import { IconButton, SvgIcon } from '@mui/material';

import { ReactComponent as PlayArrowIcon } from '@/icons/play2.svg';

import { keyframes } from '@mui/system';
import { firstTimeAnimationDelaySeconds } from './homePageConstants';

import { playSound, SoundKey } from '@/sound/SoundManager';

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

type PlayButtonProps = {
  delayButtonVisibility: boolean;
  onClick(): void;
};

function _PlayButton({ delayButtonVisibility, onClick }: PlayButtonProps) {
  const handleClick = React.useCallback(() => {
    onClick();
    playSound(SoundKey.click);
  }, [onClick]);
  const [isFirstRender, setIsFirstRender] = React.useState(true);

  React.useEffect(() => {
    setIsFirstRender(false);
  }, [setIsFirstRender]);

  return (
    <IconButton
      sx={{
        opacity: isFirstRender ? 0 : 1,
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
      onClick={handleClick}
      autoFocus
    >
      <SvgIcon sx={{ width: 26, height: 26, ml: 1.25, mr: 0.75, my: 1 }}>
        <PlayArrowIcon style={{ color: 'white' }} />
      </SvgIcon>
    </IconButton>
  );
}

export const PlayButton = _PlayButton;
/*export const PlayButton = React.memo(
  _PlayButton,
  (prevProps, nextProps) => prevProps.isLoaded === nextProps.isLoaded
);*/
