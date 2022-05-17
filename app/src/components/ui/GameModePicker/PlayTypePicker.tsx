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
import { WorldType } from 'infinitris2-models';

export const playTypePickerId = 'play-type-picker';

type GameModePickerProps = {
  paddingTop?: 10;
  display: 'flex' | 'none';
};

export function PlayTypePicker({ paddingTop, display }: GameModePickerProps) {
  const isDarkMode = useDarkMode();
  const isLandscape = useIsLandscape();
  const stage: WorldType = (process.env.FIXME as WorldType) || 'volcano';
  return (
    <FlexBox
      pt={paddingTop}
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
                : stage === 'desert'
                ? desertImageDark
                : volcanicImageDark
              : stage === 'grass'
              ? grassImage
              : stage === 'desert'
              ? desertImage
              : volcanicImage
            : isDarkMode
            ? stage === 'grass'
              ? grassImagePortraitDark
              : stage === 'desert'
              ? desertImagePortraitDark
              : volcanicImagePortraitDark
            : stage === 'grass'
            ? grassImagePortrait
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
      />
      <PlayTypeCard
        //link={Routes.challenges}
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
            defaultMessage="Single Player"
            description="Game Mode Picker Card - Single Player"
          />
        }
        link={Routes.singlePlayerGameModePicker}
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
      />
    </FlexBox>
  );
}
