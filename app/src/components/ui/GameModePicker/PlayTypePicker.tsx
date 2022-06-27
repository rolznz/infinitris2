import React from 'react';

import FlexBox from '../FlexBox';

import desertImage from './assets/illustration_storymode_desert.jpg';
import desertImageDark from './assets/illustration_storymode_desert.jpg';
import desertImagePortrait from './assets/illustration_storymode_desert_portrait.jpg';
import desertImagePortraitDark from './assets/illustration_storymode_desert_portrait.jpg';
import grassImage from './assets/illustration_storymode_grass.jpg';
import grassImageDark from './assets/illustration_storymode_grass.jpg';
import grassImagePortrait from './assets/illustration_storymode_grass_portrait.jpg';
import grassImagePortraitDark from './assets/illustration_storymode_grass_portrait.jpg';
import spaceImage from './assets/illustration_storymode_space.jpg';
import spaceImageDark from './assets/illustration_storymode_space.jpg';
import spaceImagePortrait from './assets/illustration_storymode_space_portrait.jpg';
import spaceImagePortraitDark from './assets/illustration_storymode_space_portrait.jpg';
import volcanicImage from './assets/illustration_storymode_volcanic.jpg';
import volcanicImageDark from './assets/illustration_storymode_volcanic.jpg';
import volcanicImagePortrait from './assets/illustration_storymode_volcanic_portrait.jpg';
import volcanicImagePortraitDark from './assets/illustration_storymode_volcanic_portrait.jpg';
import multiplayerImage from './assets/illustration_multiplayer.jpg';
import multiplayerImageDark from './assets/illustration_multiplayer.jpg';
import multiplayerImagePortrait from './assets/illustration_multiplayer_portrait.jpg';
import multiplayerImagePortraitDark from './assets/illustration_multiplayer_portrait.jpg';
import marketImage from './assets/illustration_market.jpg';
import marketImageDark from './assets/illustration_market.jpg';
import marketImagePortrait from './assets/illustration_market_portrait.jpg';
import marketImagePortraitDark from './assets/illustration_market_portrait.jpg';
import singleplayerImage from './assets/illustration_singleplayer.jpg';
import singleplayerImageDark from './assets/illustration_singleplayer.jpg';
import singleplayerImagePortrait from './assets/illustration_singleplayer_portrait.jpg';
import singleplayerImagePortraitDark from './assets/illustration_singleplayer_portrait.jpg';
import challengecreatorImage from './assets/illustration_challengecreator.jpg';
import challengecreatorImageDark from './assets/illustration_challengecreator.jpg';
import challengecreatorImagePortrait from './assets/illustration_challengecreator_portrait.jpg';
import challengecreatorImagePortraitDark from './assets/illustration_challengecreator_portrait.jpg';
import communityChallengesImage from './assets/illustration_communitychallenges.jpg';
import communityChallengesImageDark from './assets/illustration_communitychallenges.jpg';
import communityChallengesImagePortrait from './assets/illustration_communitychallenges_portrait.jpg';
import communityChallengesImagePortraitDark from './assets/illustration_communitychallenges_portrait.jpg';
import useDarkMode from '@/components/hooks/useDarkMode';
import { PlayTypeCard } from './PlayTypeCard';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import Routes from '@/models/Routes';
import { FormattedMessage } from 'react-intl';
import { WorldType, WorldTypeValues } from 'infinitris2-models';
import { useUser } from '@/components/hooks/useUser';

export const playTypePickerId = 'play-type-picker';
export const playTypePickerFirstCardId = 'play-type-picker-first-card';

type GameModePickerProps = {
  display: 'flex' | 'none';
};

export function PlayTypePicker({ display }: GameModePickerProps) {
  const isDarkMode = useDarkMode();
  const isLandscape = useIsLandscape();
  const user = useUser();
  const stage: WorldType =
    WorldTypeValues[
      (user.unlockedFeatures || ['grass']).filter(
        (f) => WorldTypeValues.indexOf(f as WorldType) >= 0
      ).length
    ];
  const nonStoryModeLocked = (user.unlockedFeatures || []).indexOf('space') < 0;

  return (
    <FlexBox
      pt={'1%'}
      mb={'-2%'}
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="space-evenly"
      alignItems="flex-start"
      display={display}
      id={playTypePickerId}
    >
      <PlayTypeCard
        image={
          isLandscape
            ? isDarkMode
              ? stage === 'grass'
                ? grassImageDark
                : stage === 'space'
                ? spaceImageDark
                : stage === 'desert'
                ? desertImageDark
                : volcanicImageDark
              : stage === 'grass'
              ? grassImage
              : stage === 'space'
              ? spaceImage
              : stage === 'desert'
              ? desertImage
              : volcanicImage
            : isDarkMode
            ? stage === 'grass'
              ? grassImagePortraitDark
              : stage === 'space'
              ? spaceImagePortraitDark
              : stage === 'desert'
              ? desertImagePortraitDark
              : volcanicImagePortraitDark
            : stage === 'grass'
            ? grassImagePortrait
            : stage === 'space'
            ? spaceImagePortrait
            : stage === 'desert'
            ? desertImagePortrait
            : volcanicImagePortrait
        }
        title={
          <FormattedMessage
            defaultMessage="Story Mode"
            description="Game Mode Picker Card - Story Mode"
          />
        }
        link={Routes.storyMode}
        id={playTypePickerFirstCardId}
      />
      <PlayTypeCard
        image={
          isLandscape
            ? isDarkMode
              ? multiplayerImageDark
              : multiplayerImage
            : isDarkMode
            ? multiplayerImagePortraitDark
            : multiplayerImagePortrait
        }
        title={
          <FormattedMessage
            defaultMessage="Multiplayer"
            description="Game Mode Picker Card - Multiplayer"
          />
        }
        link={Routes.lobby}
        isLocked={nonStoryModeLocked}
      />
      <PlayTypeCard
        link={Routes.challenges}
        image={
          isLandscape
            ? isDarkMode
              ? communityChallengesImageDark
              : communityChallengesImage
            : isDarkMode
            ? communityChallengesImagePortraitDark
            : communityChallengesImagePortrait
        }
        title={
          <FormattedMessage
            defaultMessage="Community Challenges"
            description="Game Mode Picker Card - Community Challenges"
          />
        }
        isLocked={nonStoryModeLocked}
      />
      <PlayTypeCard
        image={
          isLandscape
            ? isDarkMode
              ? challengecreatorImageDark
              : challengecreatorImage
            : isDarkMode
            ? challengecreatorImagePortraitDark
            : challengecreatorImagePortrait
        }
        title={
          <FormattedMessage
            defaultMessage="Challenge Maker"
            description="Game Mode Picker Card - Challenge Maker"
          />
        }
        link={Routes.createChallenge}
        isLocked={nonStoryModeLocked}
      />
      <PlayTypeCard
        image={
          isLandscape
            ? isDarkMode
              ? singleplayerImageDark
              : singleplayerImage
            : isDarkMode
            ? singleplayerImagePortraitDark
            : singleplayerImagePortrait
        }
        title={
          <FormattedMessage
            defaultMessage="Play Offline"
            description="Game Mode Picker Card - Play Offline (Single Player)"
          />
        }
        link={Routes.singlePlayerGameModePicker}
        isLocked={nonStoryModeLocked}
      />
      <PlayTypeCard
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
        title={
          <FormattedMessage
            defaultMessage="Market"
            description="Game Mode Picker Card - Market"
          />
        }
        isLocked={nonStoryModeLocked}
      />
    </FlexBox>
  );
}
