import { EndRoundDisplayOverlay } from '@/components/game/EndRoundDisplay/EndRoundDisplay';
import useContinueButton from '@/components/hooks/useContinueButton';
import { ChallengeTopAttempts } from '@/components/pages/ChallengePage/ChallengeTopAttempts';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import { GameModeDescription } from '@/components/ui/RoomCarousel/RoomCarouselSlide';
import { borderRadiuses, zIndexes } from '@/theme/theme';
import { Box, Typography } from '@mui/material';
import {
  IChallenge,
  IChallengeAttempt,
  IScoreboardEntry,
} from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
//import { useUser } from '../../../state/UserStore';
import useTrue from '../../hooks/useTrue';
import FlexBox from '../../ui/FlexBox';
import finishLineImage from './assets/finish.svg';

export interface ChallengeInfoViewProps {
  onReceivedInput(): void;
  challenge: IChallenge;
  challengeId: string | undefined;
  viewOtherReplay(
    attempt: IChallengeAttempt,
    scoreboardEntry: IScoreboardEntry | undefined
  ): void;
  isViewingReplay: boolean;
  replayScoreboardEntry: IScoreboardEntry | undefined;
}

export default function ChallengeInfoView({
  onReceivedInput,
  viewOtherReplay,
  isViewingReplay,
  challenge,
  challengeId,
  replayScoreboardEntry,
}: ChallengeInfoViewProps) {
  //const user = useUser();
  const [hasReceivedInput, continueButton] = useContinueButton(
    undefined,
    isViewingReplay ? (
      <FormattedMessage
        defaultMessage="View Replay"
        description="Challenge info - Start replay button text"
      />
    ) : (
      <FormattedMessage
        defaultMessage="Play"
        description="Challenge Info Play button text"
      />
    ),
    undefined,
    undefined,
    'large'
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
          {!isViewingReplay &&
            (challenge.simulationSettings?.gameModeType &&
            challenge.simulationSettings?.gameModeType !== 'infinity' ? (
              <Typography variant="h6" mt={2}>
                <GameModeDescription
                  gameModeType={challenge.simulationSettings?.gameModeType}
                />
              </Typography>
            ) : (
              <FlexBox
                flexDirection="row"
                gap={1}
                justifyContent="center"
                alignItems="center"
                mt={2}
              >
                <Typography variant="h6">
                  <FormattedMessage
                    defaultMessage="Get to the finish line"
                    description="Get to the finish line challenge help info"
                  />
                </Typography>
                <img src={finishLineImage} alt="" width={30}></img>
              </FlexBox>
            ))}
          {/* <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
          {translation?.description || challenge?.description || (
            <FormattedMessage
              defaultMessage="No description provided"
              description="No description provided"
            />
          )}
        </Typography> */}
          {isViewingReplay && replayScoreboardEntry && (
            <FlexBox flexDirection="row" gap={0}>
              <Typography variant="body2">
                <FormattedMessage
                  defaultMessage="Replay by {playerName}"
                  description="Challenge info - replay by playername"
                  values={{
                    playerName:
                      replayScoreboardEntry?.nickname || 'Unnamed Player',
                  }}
                />
              </Typography>
              <CharacterImage
                characterId={replayScoreboardEntry?.characterId || '0'}
                width={32}
              />
            </FlexBox>
          )}
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
          {challengeId &&
            !isViewingReplay &&
            !challenge.isTemplate &&
            challenge.isPublished && (
              <ChallengeTopAttempts
                challengeId={challengeId}
                viewReplay={viewOtherReplay}
              />
            )}
        </FlexBox>
      </EndRoundDisplayOverlay>
    </FlexBox>
  );
}
