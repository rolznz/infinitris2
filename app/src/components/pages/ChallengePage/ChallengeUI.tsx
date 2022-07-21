import ChallengeFailedView from '@/components/pages/ChallengePage/ChallengeFailedView';
import ChallengeInfoView from '@/components/pages/ChallengePage/ChallengeInfoView';
import ChallengeResultsView from '@/components/pages/ChallengePage/ChallengeResultsView';
import { RestartButton } from '@/components/pages/ChallengePage/RestartButton';
import { TopLeftPanelPortal } from '@/components/ui/TopLeftPanel';
import {
  IChallenge,
  IIngameChallengeAttempt,
  IPlayer,
  IChallengeAttempt,
  IScoreboardEntry,
} from 'infinitris2-models';
import React from 'react';

type ChallengeUIProps = {
  showChallengeInfo: boolean;
  challengeAttempt: IIngameChallengeAttempt | undefined;
  challenge: IChallenge;
  challengeId: string;
  retryChallenge(): void;
  onContinue(): void;
  viewReplay(): void;
  startChallenge(): void;
  viewOtherReplay(
    attempt: IChallengeAttempt,
    scoreboardEntry: IScoreboardEntry | undefined
  ): void;
  isTest: boolean;
  player: IPlayer;
  isViewingReplay: boolean;
  replayScoreboardEntry: IScoreboardEntry | undefined;
};

export function ChallengeUI({
  isTest,
  showChallengeInfo,
  challengeAttempt,
  challenge,
  challengeId,
  player,
  isViewingReplay,
  replayScoreboardEntry,
  onContinue,
  retryChallenge,
  viewReplay,
  viewOtherReplay,
  startChallenge,
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
          viewOtherReplay={viewOtherReplay}
          onReceivedInput={startChallenge}
          isViewingReplay={isViewingReplay}
          replayScoreboardEntry={replayScoreboardEntry}
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
