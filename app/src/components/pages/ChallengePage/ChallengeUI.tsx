import ChallengeFailedView from '@/components/pages/ChallengePage/ChallengeFailedView';
import ChallengeInfoView from '@/components/pages/ChallengePage/ChallengeInfoView';
import ChallengeResultsView from '@/components/pages/ChallengePage/ChallengeResultsView';
import { RestartButton } from '@/components/pages/ChallengePage/RestartButton';
import { TopLeftPanelPortal } from '@/components/ui/TopLeftPanel';
import {
  IChallenge,
  IIngameChallengeAttempt,
  ISimulation,
  IPlayer,
} from 'infinitris2-models';

type ChallengeUIProps = {
  showChallengeInfo: boolean;
  simulation: ISimulation;
  challengeAttempt: IIngameChallengeAttempt | undefined;
  challenge: IChallenge;
  challengeId: string;
  setShowChallengeInfo(showChallengeInfo: boolean): void;
  retryChallenge(): void;
  onContinue(): void;
  viewReplay(): void;
  isTest: boolean;
  player: IPlayer;
};

export function ChallengeUI({
  isTest,
  showChallengeInfo,
  simulation,
  challengeAttempt,
  challenge,
  challengeId,
  player,
  onContinue,
  retryChallenge,
  viewReplay,
  setShowChallengeInfo,
}: ChallengeUIProps) {
  console.log('Render challenge UI: ', challengeAttempt, showChallengeInfo);
  return (
    <>
      {!showChallengeInfo && !challengeAttempt && (
        <TopLeftPanelPortal>
          <RestartButton onClick={retryChallenge} />
        </TopLeftPanelPortal>
      )}
      {showChallengeInfo ? (
        <ChallengeInfoView
          challenge={challenge}
          challengeId={challengeId}
          onReceivedInput={() => {
            simulation.startInterval();
            setShowChallengeInfo(false);
          }}
        />
      ) : challengeAttempt?.status === 'success' ? (
        <ChallengeResultsView
          challenge={challenge}
          attempt={challengeAttempt}
          challengeId={challengeId}
          isTest={isTest}
          player={player}
          //status={challengeClient.getChallengeAttempt()}
          onContinue={onContinue}
          onRetry={retryChallenge}
          onViewReplay={viewReplay}
        />
      ) : challengeAttempt?.status === 'failed' ? (
        <ChallengeFailedView onReceivedInput={retryChallenge} />
      ) : null}
    </>
  );
}
