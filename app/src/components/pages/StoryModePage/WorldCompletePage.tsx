import { useHistory } from 'react-router-dom';
import Routes from '../../../models/Routes';

import { FormattedMessage } from 'react-intl';
import React from 'react';
import FlexBox from '@/components/ui/FlexBox';
//import { ChallengeTopAttempts } from '@/components/pages/ChallengePage/ChallengeTopAttempts';
import { MobileRotateDevice } from '@/components/game/GameUI';
import { Page } from '@/components/ui/Page';
import useContinueButton from '@/components/hooks/useContinueButton';
import useTrue from '@/components/hooks/useTrue';
import { dropShadows, zIndexes } from '@/theme/theme';

import grassImage from '@/components/ui/RoomCarousel/assets/carousel/grass_desktop.svg';
import desertImage from '@/components/ui/RoomCarousel/assets/carousel/desert_desktop.svg';
import volcanoImage from '@/components/ui/RoomCarousel/assets/carousel/volcano_desktop.svg';
import spaceImage from '@/components/ui/RoomCarousel/assets/carousel/space_desktop.svg';
import { useUser } from '@/components/hooks/useUser';
import { WorldType, WorldTypeValues } from 'infinitris2-models';
import Typography from '@mui/material/Typography';
import useIncompleteChallenges from '@/components/hooks/useIncompleteChallenges';

export function WorldCompletePage() {
  const history = useHistory();
  const user = useUser();

  const nextStage: WorldType =
    WorldTypeValues[
      (user.unlockedFeatures || ['grass']).filter(
        (f) => WorldTypeValues.indexOf(f as WorldType) >= 0
      ).length
    ];
  const { incompleteChallenges, isLoadingOfficialChallenges } =
    useIncompleteChallenges(nextStage);
  const nextStageIndex = WorldTypeValues.indexOf(nextStage);
  const prevStageIndex = Math.max(nextStageIndex - 1, 0);
  const [hasReceivedPlayInput, continueButton] = useContinueButton(
    undefined,
    <FormattedMessage
      defaultMessage="Go to next world"
      description="World Complete - Continue to next world button text"
    />,
    undefined,
    undefined,
    'large',
    '4vh'
  );
  const [hasReceivedHomeInput, homeButton] = useContinueButton(
    'h',
    <FormattedMessage
      defaultMessage="Return Home"
      description="World Complete Home button text"
    />,
    undefined,
    'secondary'
  );

  const onReceivedContinueInput = React.useCallback(() => {
    history.push(
      incompleteChallenges.length
        ? `${Routes.challenges}/${incompleteChallenges[0].id}`
        : Routes.storyMode
    );
  }, [history, incompleteChallenges]);

  const onReceivedHomeInput = React.useCallback(() => {
    history.push(Routes.home);
  }, [history]);

  useTrue(
    !isLoadingOfficialChallenges && hasReceivedPlayInput,
    onReceivedContinueInput
  );
  useTrue(hasReceivedHomeInput, onReceivedHomeInput);

  return (
    <Page
      background={
        <WorldCompleteBackground
          prevStageIndex={prevStageIndex}
          nextStageIndex={nextStageIndex}
        />
      }
    >
      <MobileRotateDevice />
      <FlexBox gap={1} height="100%">
        <FlexBox sx={{ filter: dropShadows.small }} mb={1}>
          <Typography variant="h1">
            <FormattedMessage
              defaultMessage="{worldName} World Complete"
              description="World Complete page title"
              values={{ worldName: WorldTypeValues[prevStageIndex] }}
            />
          </Typography>
          <Typography variant="body2">
            <FormattedMessage
              defaultMessage="new features unlocked!"
              description="World Complete Page - new features unlocked"
            />
          </Typography>
        </FlexBox>
        {!isLoadingOfficialChallenges && continueButton}
        {!isLoadingOfficialChallenges && homeButton}
      </FlexBox>
    </Page>
  );
}

type WorldCompleteBackgroundProps = {
  prevStageIndex: number;
  nextStageIndex: number;
};

function WorldCompleteBackground({
  prevStageIndex,
  nextStageIndex,
}: WorldCompleteBackgroundProps) {
  const stageImages = [grassImage, spaceImage, volcanoImage, desertImage];

  return (
    <FlexBox zIndex={zIndexes.below} position="relative">
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          background: `url(${stageImages[prevStageIndex]}`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          pointerEvents: 'none',
        }}
      ></div>
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          background: `url(${stageImages[nextStageIndex]}`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          pointerEvents: 'none',
          WebkitMaskImage:
            'linear-gradient(to right, rgba(0,0,0,0) 40%, rgba(0,0,0,1) 60%)',
          maskImage:
            'linear-gradient(to right, rgba(0,0,0,0) 40%, rgba(0,0,0,1) 60%)',
        }}
      ></div>
    </FlexBox>
  );
}
