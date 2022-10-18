import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import {
  Carousel,
  fullscreenMobileStepperStyles,
  fullscreenSwipeableViewsStyles,
} from '@/components/ui/Carousel';
import React from 'react';

import coinsImage from './assets/earn_coins.jpg';
import coinsImageMobile from './assets/earn_coins_mobile.jpg';
import saveProgressImage from './assets/save_progress.jpg';
import saveProgressImageMobile from './assets/save_progress_mobile.jpg';
import rateChallengesImage from './assets/rate_challenges.jpg';
import rateChallengesImageMobile from './assets/rate_challenges_mobile.jpg';
import competeInCommunityChallengesImage from './assets/compete_community_challenges.jpg';
import competeInCommunityChallengesImageMobile from './assets/compete_community_challenges_mobile.jpg';
import publishChallengesImage from './assets/publish_challenges.jpg';
import publishChallengesImageMobile from './assets/publish_challenges_mobile.jpg';
import earnImpactImage from './assets/earn_impact.jpg';
import earnImpactImageMobile from './assets/earn_impact_mobile.jpg';
import comingSoonImage from './assets/coming_soon.jpg';
import comingSoonImageMobile from './assets/coming_soon_mobile.jpg';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { colors } from '@/theme/theme';
import FlexBox from '@/components/ui/FlexBox';

const titles = [
  <FormattedMessage
    defaultMessage="Save your Progress"
    description="Account benefits text - save progress"
  />,
  <FormattedMessage
    defaultMessage="Earn Coins!"
    description="Account benefits text - earn coins"
  />,
  <FormattedMessage
    defaultMessage="Compete in Community Challenges"
    description="Account benefits text - compete in community challenges"
  />,
  <FormattedMessage
    defaultMessage="Rate Community Challenges"
    description="Account benefits text - rate community challenges"
  />,
  <FormattedMessage
    defaultMessage="Verified Status"
    description="Account benefits text - verified status"
  />,
  <FormattedMessage
    defaultMessage="Create Community Challenges"
    description="Account benefits text - create community challenges"
  />,
  <FormattedMessage
    defaultMessage="Earn Impact Points"
    description="Account benefits text - earn impact"
  />,
  <FormattedMessage
    defaultMessage="Appear on the Scoreboard"
    description="Account benefits text - scoreboard"
  />,
  <FormattedMessage
    defaultMessage="Coming Soon!"
    description="Account benefits text - coming soon"
  />,
];
const subtitles = [
  <FormattedMessage
    defaultMessage="Save your Story Mode progress, Community Challenge plays and personal settings"
    description="Account benefits subtext - save progress"
  />,
  <FormattedMessage
    defaultMessage="Use your coins to purchase unique characters and publish new challenges"
    description="Account benefits subtext - earn coins"
  />,
  <FormattedMessage
    defaultMessage="Attempt for a top 3 placing and save your replay for all to see"
    description="Account benefits subtext - compete in community challenges"
  />,
  <FormattedMessage
    defaultMessage="Power to choose the top community challenges"
    description="Account benefits subtext - rate community challenges"
  />,
  <FormattedMessage
    defaultMessage="Secure a unique nickname and display your premium status ingame"
    description="Account benefits subtext - verified status"
  />,
  <FormattedMessage
    defaultMessage="Create and share your own challenges"
    description="Account benefits subtext - create community challenges"
  />,
  <FormattedMessage
    defaultMessage="Collect points showing your positive impact to the game and community"
    description="Account benefits subtext - earn impact"
  />,
  <FormattedMessage
    defaultMessage="Compete to be the player with the highest impact"
    description="Account benefits subtext - scoreboard"
  />,
  <FormattedMessage
    defaultMessage="New Features Coming Soon. Stay tuned!"
    description="Account benefits subtext - coming soon"
  />,
];

const titleColors = [
  '#FFA9D2',
  '#FF447C',
  '#FFA800',
  '#FFE600',
  '#FFA800',
  '#E5FD6A',
  '#D2A1F8',
  '#FFA800',
  '#FFA800',
];

export function PremiumCarousel() {
  const isLandscape = useIsLandscape();
  const images: string[] = React.useMemo(
    () =>
      isLandscape
        ? [
            saveProgressImage,
            coinsImage,
            competeInCommunityChallengesImage,
            rateChallengesImage,
            comingSoonImage,
            publishChallengesImage,
            earnImpactImage,
            comingSoonImage,
            comingSoonImage,
          ]
        : [
            saveProgressImageMobile,
            coinsImageMobile,
            competeInCommunityChallengesImageMobile,
            rateChallengesImageMobile,
            comingSoonImageMobile,
            publishChallengesImageMobile,
            earnImpactImageMobile,
            comingSoonImageMobile,
            comingSoonImageMobile,
          ],
    [isLandscape]
  );

  const slideElements: React.ReactNode[] = React.useMemo(
    () =>
      images.map((image, i) => (
        <FlexBox
          key={i}
          width="100vw"
          height="100vh"
          sx={{
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.85) 100%), url(${image})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPositionY: '0%',
            backgroundPositionX: 'center',
          }}
          position="relative"
        >
          <FlexBox
            position="absolute"
            bottom={isLandscape ? 100 : 170}
            left={isLandscape ? 100 : 20}
            maxWidth="70%"
            alignItems="flex-start"
          >
            <Typography variant="h1" color={titleColors[i]}>
              {titles[i]}
            </Typography>
            <Typography variant="h6" color={colors.white} maxWidth="30vw">
              {subtitles[i]}
            </Typography>
          </FlexBox>
        </FlexBox>
      )),
    [images, isLandscape]
  );

  return (
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
        slides={slideElements}
        styles={fullscreenSwipeableViewsStyles}
        mobileStepperStyles={fullscreenMobileStepperStyles}
        scaleTransform={false}
        innerArrows
        //initialStep={initialStep}
        //onChange={handleChangeSlide}
      />
    </div>
  );
}

/*
Original benefits
- Save your progress
 
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Access premium characters"
        description="Account benefits text - premium characters"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Earn impact points"
        description="Account benefits text - earn impact points"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Appear on the scoreboard"
        description="Account benefits text - impact & scoreboard"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Publish challenges"
        description="Account benefits text - publish challenges"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Rate challenges"
        description="Account benefits text - rate challenges"
      />
    }
  />,

  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Secure your nickname (tick)"
        description="Account benefits text - nickname"
      />
    }
  />,
  */
