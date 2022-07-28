import {
  EndRoundDisplayOverlay,
  RoundWinnerDisplay,
} from '@/components/game/EndRoundDisplay/EndRoundDisplay';
import useContinueButton from '@/components/hooks/useContinueButton';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import useTrue from '@/components/hooks/useTrue';
import RateChallenge from '@/components/pages/ChallengePage/RateChallenge';
import { WorldProgress } from '@/components/pages/ChallengePage/WorldProgress';
import FlexBox from '@/components/ui/FlexBox';
import { borderRadiuses, zIndexes } from '@/theme/theme';
import Typography from '@mui/material/Typography';
import {
  IChallenge,
  IChallengeAttempt,
  IIngameChallengeAttempt,
  IPlayer,
  IScoreboardEntry,
} from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import useWindowSize from 'react-use/lib/useWindowSize';
import { ReactComponent as StopwatchIcon } from '@/icons/stopwatch.svg';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import { ChallengeTopAttempts } from '@/components/pages/ChallengePage/ChallengeTopAttempts';
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
  onViewReplay(): void;
  viewOtherReplay(
    attempt: IChallengeAttempt,
    scoreboardEntry: IScoreboardEntry | undefined
  ): void;
}

export default function ChallengeResultsView({
  challengeId,
  isTest,
  challenge,
  player,
  attempt,
  onContinue,
  onRetry,
  onViewReplay,
  viewOtherReplay,
}: ChallengeResultsViewProps) {
  //const user = useUser();
  console.log('Render challenge results view');
  const [hasReceivedContinueInput, continueButton] = useContinueButton(
    undefined,
    undefined,
    true,
    undefined,
    'large'
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
  const [hasReceivedViewReplayInput, viewReplayButton] = useContinueButton(
    'v',
    <FormattedMessage
      defaultMessage="View replay"
      description="View replay button text"
    />,
    true,
    'secondary'
  );
  useTrue(hasReceivedRetryInput, onRetry);
  useTrue(hasReceivedViewReplayInput, onViewReplay);
  const windowSize = useWindowSize();
  const characterSize = Math.min(
    windowSize.width * 0.55,
    windowSize.height * 0.45
  );
  const isLandscape = useIsLandscape();
  const [showWinnerDisplay, setShowWinnerDisplay] = React.useState(true);

  React.useEffect(() => {
    setTimeout(() => {
      setShowWinnerDisplay(false);
    }, 2000);
  }, []);
  // TODO: add keyboard shortcuts / improve accessibility
  /*const [hasReceivedRetryInput] = useReceivedInput('r', true);
  useTrue(hasReceivedRetryInput, onRetry);
  const [hasReceivedContinueInput] = useReceivedInput(undefined, true);
  useTrue(hasReceivedContinueInput, onContinue);*/

  //const stats = status.stats as ChallengeCompletionStats;

  return (
    <FlexBox zIndex={zIndexes.above} width="100%" height="100%">
      <EndRoundDisplayOverlay>
        {showWinnerDisplay && (
          <>
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
            <FlexBox flexDirection="row" gap={1} mt={8}>
              <SvgIcon fontSize="large" sx={{ mt: -1 }}>
                <StopwatchIcon />
              </SvgIcon>
              <Typography variant="h6">
                <FormattedMessage
                  defaultMessage="{timeTakenMs} seconds"
                  description="Time taken to complete challenge"
                  values={{
                    timeTakenMs: (attempt.stats!.timeTakenMs / 1000).toFixed(2),
                  }}
                />
              </Typography>
            </FlexBox>
          </>
        )}

        {!showWinnerDisplay && (
          <>
            {challenge.isOfficial && !showWinnerDisplay && (
              <WorldProgress worldType={challenge.worldType} />
            )}
            <FlexBox
              color="primary.main"
              //bgcolor="background.paper"
              //padding={4}
              borderRadius={borderRadiuses.base}
              mt={isLandscape ? characterSize * 0.02 : characterSize * 0.005}
              zIndex={zIndexes.above}
            >
              {/*<Typography variant="h6">
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
            </Typography>*/}
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
                {viewReplayButton}
              </FlexBox>
              {!isTest && !challenge.isOfficial && (
                <RateChallenge challengeId={challengeId} />
              )}
            </FlexBox>
            <ChallengeTopAttempts
              challengeId={challengeId}
              challenge={challenge}
              viewReplay={viewOtherReplay}
            />
          </>
        )}
      </EndRoundDisplayOverlay>
    </FlexBox>
  );
}
