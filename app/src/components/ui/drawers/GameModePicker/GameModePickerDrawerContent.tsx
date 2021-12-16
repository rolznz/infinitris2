import React from 'react';

import { Box, SvgIcon } from '@mui/material';

import FlexBox from '../../FlexBox';

import desertImage from './assets/illustration_storymode_desert.svg';
import desertImageDark from './assets/illustration_storymode_desert_dark.svg';
import desertImagePortrait from './assets/illustration_storymode_desert_portrait.svg';
import desertImagePortraitDark from './assets/illustration_storymode_desert_portrait_dark.svg';
import useDarkMode from '@/components/hooks/useDarkMode';
import { GameModeCard } from './GameModeCard';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';

export function GameModePickerDrawerContent() {
  const isDarkMode = useDarkMode();
  const isLandscape = useIsLandscape();
  return (
    <FlexBox
      flex={1}
      py={1}
      px={1}
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="space-evenly"
      alignItems="flex-start"
      columnGap={1}
      rowGap={isLandscape ? 6 : 1}
      mb={-8}
    >
      <GameModeCard
        image={
          isLandscape
            ? isDarkMode
              ? desertImageDark
              : desertImage
            : isDarkMode
            ? desertImagePortraitDark
            : desertImagePortrait
        }
      />
      <GameModeCard
        image={
          isLandscape
            ? isDarkMode
              ? desertImageDark
              : desertImage
            : isDarkMode
            ? desertImagePortraitDark
            : desertImagePortrait
        }
      />
      <GameModeCard
        image={
          isLandscape
            ? isDarkMode
              ? desertImageDark
              : desertImage
            : isDarkMode
            ? desertImagePortraitDark
            : desertImagePortrait
        }
      />
      <GameModeCard
        image={
          isLandscape
            ? isDarkMode
              ? desertImageDark
              : desertImage
            : isDarkMode
            ? desertImagePortraitDark
            : desertImagePortrait
        }
      />
      <GameModeCard
        image={
          isLandscape
            ? isDarkMode
              ? desertImageDark
              : desertImage
            : isDarkMode
            ? desertImagePortraitDark
            : desertImagePortrait
        }
      />
      <GameModeCard
        image={
          isLandscape
            ? isDarkMode
              ? desertImageDark
              : desertImage
            : isDarkMode
            ? desertImagePortraitDark
            : desertImagePortrait
        }
      />
    </FlexBox>
  );
}
