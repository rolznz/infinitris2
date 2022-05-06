import { useEffect, useState } from 'react';
import useAppStore from '../../../state/AppStore';
import {
  ISimulationEventListener,
  ISimulation,
  IChallengeClient,
  IChallenge,
  getChallengePath,
  NetworkPlayerInfo,
} from 'infinitris2-models';
import useForcedRedirect from '../../hooks/useForcedRedirect';
import { useHistory, useParams } from 'react-router-dom';
import useIncompleteChallenges from '../../hooks/useIncompleteChallenges';
import Routes from '../../../models/Routes';
import React from 'react';
import ChallengeInfoView from './ChallengeInfoView';
import ChallengeResultsView from './ChallengeResultsView';
import ChallengeFailedView from './ChallengeFailedView';
import useSearchParam from 'react-use/lib/useSearchParam';
import { useDocument } from 'swr-firestore';
import { IPlayer } from 'infinitris2-models';
import usePwaRedirect from '@/components/hooks/usePwaRedirect';
import { coreGameListeners } from '@/game/listeners/coreListeners';
import { useUser } from '@/components/hooks/useUser';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';

interface ChallengePageRouteParams {
  id: string;
}

export const isTestChallenge = (challengeId?: string) => challengeId === 'test';

export default function ChallengePage() {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const user = useUser();
  const history = useHistory();
  const json = useSearchParam('json');

  const { id } = useParams<ChallengePageRouteParams>();
  const challengeId = id!; // guaranteed not to be null due to router
  const isTest = isTestChallenge(challengeId);
  console.log('isTest', isTest);

  usePwaRedirect();
  const requiresRedirect = useForcedRedirect(true, challengeId, !isTest);
  const { incompleteChallenges } = useIncompleteChallenges();

  const { data: syncedChallenge } = useDocument<IChallenge>(
    !isTest ? getChallengePath(challengeId) : null
  );
  const challenge = isTest ? JSON.parse(json as string) : syncedChallenge;

  const launchChallenge = client?.launchChallenge;
  const restartClient = client?.restartClient; // TODO: move to IClient
  const [hasLaunched, setLaunched] = useState(false);

  const [simulation, setSimulation] = useState<ISimulation | undefined>(
    undefined
  );
  const [challengeClient, setChallengeClient] = useState<
    IChallengeClient | undefined
  >(undefined);

  const [showChallengeInfo, setShowChallengeInfo] = useState(true);
  const [challengeFailed, setChallengeFailed] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  const [checkChallengeStatus, setCheckChallengeStatus] = useState(false);

  const { preferredInputMethod, controls_keyboard, hasSeenAllSet, readOnly } =
    user;

  // TODO: update (see SinglePlayer/Room page)
  const player: Partial<NetworkPlayerInfo> = React.useMemo(
    () => ({
      color: 0xff0000, // FIXME: use player's color
      nickname: readOnly?.nickname || 'New Player',
      id: -1,
    }),
    [readOnly?.nickname]
  );

  // TODO: load challenge from firebase

  useEffect(() => {
    if (challenge && !requiresRedirect && launchChallenge && !hasLaunched) {
      setLaunched(true);

      const challengeSimulationEventListener: Partial<ISimulationEventListener> =
        {
          onSimulationInit(simulation: ISimulation) {
            setSimulation(simulation);
          },
          onBlockCreateFailed() {
            setCheckChallengeStatus(true);
          },

          onBlockPlaced() {
            setCheckChallengeStatus(true);
          },
          onBlockDied() {
            setCheckChallengeStatus(true);
          },
        };

      setChallengeClient(
        launchChallenge(challenge, {
          listeners: [...coreGameListeners, challengeSimulationEventListener],
          preferredInputMethod,
          controls_keyboard,
          player: player as IPlayer, // FIXME: use a different interface
          challengeEditorEnabled: isTest,
          onSaveGrid: (grid: string) => {
            useChallengeEditorStore.getState().setChallenge({
              ...useChallengeEditorStore.getState().challenge!,
              grid,
            });
          },
        })
      );
    }
  }, [
    requiresRedirect,
    challenge,
    hasLaunched,
    preferredInputMethod,
    launchChallenge,
    setCheckChallengeStatus,
    setChallengeClient,
    controls_keyboard,
    player,
    isTest,
  ]);

  useEffect(() => {
    if (challenge && checkChallengeStatus && challengeClient) {
      setCheckChallengeStatus(false);
      const attempt = challengeClient.getChallengeAttempt();
      if (attempt && attempt.status !== 'pending') {
        if (!isTest) {
          // TODO:
          //addChallengeAttempt(challenge.id, attempt);
        }
        if (attempt.status === 'success') {
          setChallengeCompleted(true);
        } else {
          setChallengeFailed(true);
        }
      }
    }
  }, [
    challenge,
    checkChallengeStatus,
    challengeClient,
    setChallengeFailed,
    isTest,
  ]);

  if (!hasLaunched || !challenge) {
    return null;
  }

  if (showChallengeInfo) {
    return (
      <ChallengeInfoView
        challenge={challenge}
        onReceivedInput={() => {
          simulation?.startInterval();
          setShowChallengeInfo(false);
        }}
      />
    );
  } else if (challengeCompleted && challengeClient && restartClient) {
    return (
      <ChallengeResultsView
        challengeId={challenge.id}
        isTest={isTest}
        //status={challengeClient.getChallengeAttempt()}
        onContinue={() => {
          //completeChallenge(challenge.id);
          const remainingChallenges = incompleteChallenges.filter(
            (incompleteChallenge) => incompleteChallenge.id !== challenge.id
          );
          if (isTest) {
            history.goBack();
          } else if (remainingChallenges.length) {
            history.push(Routes.challengeRequired);
          } else if (!hasSeenAllSet) {
            history.push(Routes.allSet);
          } else {
            history.goBack();
          }
        }}
        onRetry={() => {
          setChallengeCompleted(false);
          setShowChallengeInfo(true);
          restartClient();
        }}
      />
    );
  } else if (challengeFailed && restartClient) {
    return (
      <ChallengeFailedView
        onReceivedInput={() => {
          setChallengeFailed(false);
          setShowChallengeInfo(true);
          restartClient();
        }}
      />
    );
  }

  return null;
}
