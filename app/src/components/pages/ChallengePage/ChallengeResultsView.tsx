import {
  EndRoundDisplayOverlay,
  RoundWinnerDisplay,
} from '@/components/game/EndRoundDisplay/EndRoundDisplay';
import useContinueButton from '@/components/hooks/useContinueButton';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import useTrue from '@/components/hooks/useTrue';
import { WorldProgress } from '@/components/pages/ChallengePage/WorldProgress';
import FlexBox from '@/components/ui/FlexBox';
import { borderRadiuses, zIndexes } from '@/theme/theme';
import Typography from '@mui/material/Typography';
import {
  IChallenge,
  IIngameChallengeAttempt,
  IPlayer,
} from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import useWindowSize from 'react-use/lib/useWindowSize';
//import ChallengeMedalDisplay from './ChallengeMedalDisplay';
//import RateChallenge from './RateChallenge';

export interface ChallengeResultsViewProps {
  attempt: IIngameChallengeAttempt;
  challengeId: string;
  challenge: IChallenge;
  isTest: boolean;
  player: IPlayer;
  onContinue(): void;
  onRetry(): void;
}

export default function ChallengeResultsView({
  //challengeId,
  //isTest,
  challenge,
  player,
  attempt,
  onContinue,
  onRetry,
}: ChallengeResultsViewProps) {
  //const user = useUser();
  console.log('Render challenge results view');
  const [hasReceivedContinueInput, continueButton] = useContinueButton(
    undefined,
    undefined,
    true
  );
  useTrue(hasReceivedContinueInput, onContinue);
  const [hasReceivedRetryInput, retryButton] = useContinueButton(
    'r',
    <FormattedMessage
      defaultMessage="Play again"
      description="Play again button text"
    />, // TODO: "Try for Gold" if < gold medal
    true,
    'secondary'
  );
  useTrue(hasReceivedRetryInput, onRetry);
  const windowSize = useWindowSize();
  const characterSize = Math.min(
    windowSize.width * 0.55,
    windowSize.height * 0.45
  );
  const isLandscape = useIsLandscape();

  // TODO: add keyboard shortcuts / improve accessibility
  /*const [hasReceivedRetryInput] = useReceivedInput('r', true);
  useTrue(hasReceivedRetryInput, onRetry);
  const [hasReceivedContinueInput] = useReceivedInput(undefined, true);
  useTrue(hasReceivedContinueInput, onContinue);*/

  //const stats = status.stats as ChallengeCompletionStats;

  return (
    <FlexBox zIndex={zIndexes.above} width="100%" height="100%">
      <EndRoundDisplayOverlay>
        <WorldProgress worldType={challenge.worldType} />
        <RoundWinnerDisplay
          characterSize={characterSize}
          winner={player}
          message={
            <FormattedMessage
              defaultMessage="Challenge Completed!"
              description="Challenge completed heading"
            />
          }
          medalIndex={attempt.medalIndex}
        />
        <FlexBox
          color="primary.main"
          //bgcolor="background.paper"
          //padding={4}
          borderRadius={borderRadiuses.base}
          mt={isLandscape ? characterSize * 0.02 : characterSize * 0.005}
          zIndex={zIndexes.above}
        >
          {/* TODO: extract to a list of statistics, will this work with react-i18n? */}
          <Typography variant="h6">
            <FormattedMessage
              defaultMessage="Time taken: {timeTakenMs} seconds"
              description="Time taken to complete challenge"
              values={{
                timeTakenMs: (attempt.stats!.timeTakenMs / 1000).toFixed(2),
              }}
            />
          </Typography>
          <Typography variant="h6">
            <FormattedMessage
              defaultMessage="Blocks placed: {blocksPlaced}"
              description="Number of blocks placed in challenge"
              values={{
                blocksPlaced: attempt.stats!.blocksPlaced,
              }}
            />
          </Typography>
          <Typography variant="h6">
            <FormattedMessage
              defaultMessage="Lines cleared: {linesCleared}"
              description="Number of lines cleared in challenge"
              values={{
                linesCleared: attempt.stats!.linesCleared,
              }}
            />
          </Typography>
          {/* TODO: efficiency rating e.g. not leaving gaps */}
          {/* <Typography variant="caption">
          <FormattedMessage
            defaultMessage="Attempt: #{attemptCount}"
            description="Number of times the user has attempted this challenge"
            values={
              {
                //attemptCount: user.challengeAttempts[challengeId]?.length || 1,
              }
            }
          />
        </Typography> */}
          {/*<RateChallenge isTest={isTest} challengeId={challengeId} />*/}
          <FlexBox
            pt={2}
            width="100%"
            flexDirection="row"
            justifyContent="space-between"
            gap={1}
          >
            {retryButton}
            {continueButton}
          </FlexBox>
        </FlexBox>
      </EndRoundDisplayOverlay>
    </FlexBox>
  );
}
