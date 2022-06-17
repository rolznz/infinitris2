import { EndRoundDisplayOverlay } from '@/components/game/EndRoundDisplay/EndRoundDisplay';
import useContinueButton from '@/components/hooks/useContinueButton';
import { GameModeDescription } from '@/components/ui/RoomCarousel/RoomCarouselSlide';
import { borderRadiuses, zIndexes } from '@/theme/theme';
import { Box, Typography } from '@mui/material';
import { IChallenge } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
//import { useUser } from '../../../state/UserStore';
import useTrue from '../../hooks/useTrue';
import FlexBox from '../../ui/FlexBox';

export interface ChallengeInfoViewProps {
  onReceivedInput(): void;
  challenge: IChallenge;
}

export default function ChallengeInfoView({
  onReceivedInput,
  challenge,
}: ChallengeInfoViewProps) {
  //const user = useUser();
  const [hasReceivedInput, continueButton] = useContinueButton(
    undefined,
    <FormattedMessage
      defaultMessage="Play"
      description="Challenge Info Play button text"
    />
  );

  useTrue(hasReceivedInput, onReceivedInput);
  //const translation = challenge?.translations?.[user.locale];

  return (
    <FlexBox zIndex={zIndexes.above} width="100%" height="100%">
      <EndRoundDisplayOverlay>
        <FlexBox
          color="primary.main"
          bgcolor="background.paper"
          px={6}
          py={4}
          borderRadius={borderRadiuses.base}
          zIndex={zIndexes.above}
        >
          <Typography variant="h6">
            {challenge.title || 'Untitled Challenge'}
          </Typography>
          {challenge.simulationSettings?.gameModeType &&
            challenge.simulationSettings?.gameModeType !== 'infinity' && (
              <Typography variant="h6" mt={2}>
                <GameModeDescription
                  gameModeType={challenge.simulationSettings?.gameModeType}
                />
              </Typography>
            )}
          {/* <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
          {translation?.description || challenge?.description || (
            <FormattedMessage
              defaultMessage="No description provided"
              description="No description provided"
            />
          )}
        </Typography> */}
          <Box pt={2}>{continueButton}</Box>
          {/*<Typography variant="caption">
          <FormattedMessage
            defaultMessage="Attempt: #{attemptCount}"
            description="Number of times the user has attempted this challenge"
            values={{
              attemptCount:
                (user.challengeAttempts[challenge.id]?.length || 0) + 1,
            }}
          />
          </Typography>*/}
        </FlexBox>
      </EndRoundDisplayOverlay>
    </FlexBox>
  );
}
