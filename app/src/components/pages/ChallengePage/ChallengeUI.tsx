import ChallengeFailedView from '@/components/pages/ChallengePage/ChallengeFailedView';
import ChallengeInfoView from '@/components/pages/ChallengePage/ChallengeInfoView';
import ChallengeReplayView from '@/components/pages/ChallengePage/ChallengeReplayView';
import ChallengeResultsView from '@/components/pages/ChallengePage/ChallengeResultsView';
import { RestartButton } from '@/components/pages/ChallengePage/RestartButton';
import { TopLeftPanelPortal } from '@/components/ui/TopLeftPanel';
import {
  IChallenge,
  IIngameChallengeAttempt,
  IPlayer,
  IChallengeAttempt,
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
  onClickTopAttempt(): void;
  startChallenge(): void;
  skipChallenge(): void;
  viewAllReplays(): void;
  canSkipChallenge: boolean;
  canViewReplays: boolean;
  isTest: boolean;
  player: IPlayer;
  isViewingReplay: boolean;
  replayAttempt: IChallengeAttempt | IIngameChallengeAttempt | undefined;
};

export function ChallengeUI({
  isTest,
  showChallengeInfo,
  challengeAttempt,
  challenge,
  challengeId,
  player,
  isViewingReplay,
  replayAttempt,
  onContinue,
  retryChallenge,
  viewReplay,
  onClickTopAttempt,
  startChallenge,
  skipChallenge,
  viewAllReplays,
  canSkipChallenge,
  canViewReplays,
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
        isViewingReplay ? (
          <ChallengeReplayView
            challenge={challenge}
            onReceivedInput={startChallenge}
            replayAttempt={replayAttempt}
          />
        ) : (
          <ChallengeInfoView
            isTest={isTest}
            challenge={challenge}
            challengeId={challengeId}
            onReceivedPlayInput={startChallenge}
            onReceivedSkipInput={skipChallenge}
            onReceivedViewReplaysInput={viewAllReplays}
            canSkipChallenge={canSkipChallenge}
            canViewReplays={canViewReplays}
          />
        )
      ) : challengeAttempt?.status === 'success' ? (
        <ChallengeResultsView
          challenge={challenge}
          attempt={challengeAttempt}
          challengeId={challengeId}
          isTest={isTest}
          player={player}
          onContinue={onContinue}
          onRetry={retryChallenge}
          onClickTopAttempt={onClickTopAttempt}
          onViewReplay={viewReplay}
        />
      ) : challengeAttempt?.status === 'failed' ? (
        <ChallengeFailedView onReceivedInput={retryChallenge} />
      ) : null}
    </>
  );
}
