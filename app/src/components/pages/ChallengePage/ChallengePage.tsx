import { useEffect, useState } from 'react';
import useAppStore from '../../../state/AppStore';
import {
  ISimulationEventListener,
  ISimulation,
  IChallengeClient,
  IChallenge,
} from 'infinitris2-models';
import useWelcomeRedirect from '../../hooks/useWelcomeRedirect';
import { useHistory, useParams } from 'react-router-dom';
import useIncompleteChallenges from '../../hooks/useIncompleteChallenges';
import Routes from '../../../models/Routes';
import React from 'react';
import ChallengeInfoView from './ChallengeInfoView';
import ChallengeResultsView from './ChallengeResultsView';
import ChallengeFailedView from './ChallengeFailedView';
import { useUserStore } from '../../../state/UserStore';
import { useSearchParam } from 'react-use';
import { useDocument } from '@nandorojo/swr-firestore';
import { getChallengePath } from '../../../firebase';

interface ChallengePageRouteParams {
  id: string;
}

export default function ChallengePage() {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const userStore = useUserStore();
  const history = useHistory();
  const json = useSearchParam('json');

  const { id } = useParams<ChallengePageRouteParams>();
  const isTest = id === 'test';

  const { data: syncedChallenge } = useDocument<IChallenge>(
    !isTest && id ? getChallengePath(id) : null
  );

  const challenge = isTest ? JSON.parse(json as string) : syncedChallenge;
  const requiresRedirect = useWelcomeRedirect(
    true,
    challenge?.priority,
    !isTest
  );
  const incompleteChallenges = useIncompleteChallenges();
  const addChallengeAttempt = userStore.addChallengeAttempt;
  const setIsDemo = appStore.setIsDemo;
  const completeChallenge = userStore.completeChallenge;
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

  const { preferredInputMethod, controls } = userStore.user;

  // TODO: load challenge from firebase

  useEffect(() => {
    if (challenge && !requiresRedirect && launchChallenge && !hasLaunched) {
      setLaunched(true);

      const simulationEventListener: ISimulationEventListener = {
        onSimulationInit(simulation: ISimulation) {
          setSimulation(simulation);
        },
        onSimulationStep() {},

        onBlockCreated() {},
        onBlockCreateFailed() {
          setCheckChallengeStatus(true);
        },

        onBlockPlaced() {
          setCheckChallengeStatus(true);
        },
        onBlockDied() {
          setCheckChallengeStatus(true);
        },
        onBlockMoved() {},
        onBlockWrapped() {},
        onLineCleared() {},
      };

      setChallengeClient(
        launchChallenge(
          challenge,
          simulationEventListener,
          preferredInputMethod,
          controls
        )
      );
      setIsDemo(false);
    }
  }, [
    requiresRedirect,
    challenge,
    hasLaunched,
    preferredInputMethod,
    launchChallenge,
    setIsDemo,
    setCheckChallengeStatus,
    setChallengeClient,
    controls,
  ]);

  useEffect(() => {
    if (challenge && checkChallengeStatus && challengeClient) {
      setCheckChallengeStatus(false);
      const status = challengeClient.getStatus();
      if (status && status.status !== 'pending') {
        if (!isTest) {
          addChallengeAttempt(challenge.id, status);
        }
        if (status.status === 'success') {
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
    addChallengeAttempt,
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
        challenge={challenge}
        status={challengeClient.getStatus()}
        onContinue={() => {
          completeChallenge(challenge.id);
          const remainingChallenges = incompleteChallenges.filter(
            (incompleteChallenge) => incompleteChallenge.id !== challenge.id
          );
          if (isTest) {
            history.goBack();
          } else if (remainingChallenges.length) {
            history.push(Routes.challengeRequired);
          } else {
            history.push(Routes.allSet);
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
