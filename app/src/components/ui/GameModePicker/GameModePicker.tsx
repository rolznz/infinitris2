import React from 'react';

import FlexBox from '../FlexBox';

import desertImage from './assets/illustration_storymode_desert.jpg';
import desertImageDark from './assets/illustration_storymode_desert_dark.jpg';
import desertImagePortrait from './assets/illustration_storymode_desert_portrait.jpg';
import desertImagePortraitDark from './assets/illustration_storymode_desert_portrait_dark.jpg';
import multiplayerImage from './assets/illustration_multiplayer.jpg';
import multiplayerImageDark from './assets/illustration_multiplayer_dark.jpg';
import multiplayerImagePortrait from './assets/illustration_multiplayer_portrait.jpg';
import multiplayerImagePortraitDark from './assets/illustration_multiplayer_portrait_dark.jpg';
import marketImage from './assets/illustration_market.jpg';
import marketImageDark from './assets/illustration_market_dark.jpg';
import marketImagePortrait from './assets/illustration_market_portrait.jpg';
import marketImagePortraitDark from './assets/illustration_market_portrait_dark.jpg';
import singleplayerImage from './assets/illustration_singleplayer.jpg';
import singleplayerImageDark from './assets/illustration_singleplayer_dark.jpg';
import singleplayerImagePortrait from './assets/illustration_singleplayer_portrait.jpg';
import singleplayerImagePortraitDark from './assets/illustration_singleplayer_portrait_dark.jpg';
import challengemakerImage from './assets/illustration_challengemaker.jpg';
import challengemakerImageDark from './assets/illustration_challengemaker_dark.jpg';
import challengemakerImagePortrait from './assets/illustration_challengemaker_portrait.jpg';
import challengemakerImagePortraitDark from './assets/illustration_challengemaker_portrait_dark.jpg';
import communityChallengesImage from './assets/illustration_communitychallenges.jpg';
import communityChallengesImageDark from './assets/illustration_communitychallenges_dark.jpg';
import communityChallengesImagePortrait from './assets/illustration_communitychallenges_portrait.jpg';
import communityChallengesImagePortraitDark from './assets/illustration_communitychallenges_portrait_dark.jpg';
import useDarkMode from '@/components/hooks/useDarkMode';
import { GameModeCard } from './GameModeCard';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import Routes from '@/models/Routes';

export const gameModePickerId = 'game-mode-picker';

type GameModePickerProps = {
  paddingTop?: 10;
  display: 'flex' | 'none';
};

export function GameModePicker({ paddingTop, display }: GameModePickerProps) {
  const isDarkMode = useDarkMode();
  const isLandscape = useIsLandscape();
  return (
    <FlexBox
      pt={paddingTop}
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="space-evenly"
      alignItems="flex-start"
      display={display}
      id={gameModePickerId}
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
              ? multiplayerImageDark
              : multiplayerImage
            : isDarkMode
            ? multiplayerImagePortraitDark
            : multiplayerImagePortrait
        }
      />
      <GameModeCard
        image={
          isLandscape
            ? isDarkMode
              ? communityChallengesImageDark
              : communityChallengesImage
            : isDarkMode
            ? communityChallengesImagePortraitDark
            : communityChallengesImagePortrait
        }
      />
      <GameModeCard
        image={
          isLandscape
            ? isDarkMode
              ? challengemakerImageDark
              : challengemakerImage
            : isDarkMode
            ? challengemakerImagePortraitDark
            : challengemakerImagePortrait
        }
      />
      <GameModeCard
        image={
          isLandscape
            ? isDarkMode
              ? singleplayerImageDark
              : singleplayerImage
            : isDarkMode
            ? singleplayerImagePortraitDark
            : singleplayerImagePortrait
        }
      />
      <GameModeCard
        link={Routes.market}
        image={
          isLandscape
            ? isDarkMode
              ? marketImageDark
              : marketImage
            : isDarkMode
            ? marketImagePortraitDark
            : marketImagePortrait
        }
      />
    </FlexBox>
  );
}
