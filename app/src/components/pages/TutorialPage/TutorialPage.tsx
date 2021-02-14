import { useEffect, useState } from 'react';
import useAppStore from '../../../state/AppStore';
import {
  tutorials,
  ISimulationEventListener,
  ISimulation,
  ITutorialClient,
} from 'infinitris2-models';
import useWelcomeRedirect from '../../hooks/useWelcomeRedirect';
import { useHistory, useParams } from 'react-router-dom';
import useIncompleteTutorials from '../../hooks/useIncompleteTutorials';
import Routes from '../../../models/Routes';
import React from 'react';
import TutorialInfoView from './TutorialInfoView';
import TutorialResultsView from './TutorialResultsView';
import TutorialFailedView from './TutorialFailedView';
import { useUserStore } from '../../../state/UserStore';

interface TutorialPageRouteParams {
  id: string;
}

export default function TutorialPage() {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const userStore = useUserStore();
  const history = useHistory();

  const { id } = useParams<TutorialPageRouteParams>();

  const tutorial = tutorials.find((t) => t.id === id);
  const requiresRedirect = useWelcomeRedirect(true, tutorial?.priority);
  const incompleteTutorials = useIncompleteTutorials();
  const addTutorialAttempt = userStore.addTutorialAttempt;
  const setIsDemo = appStore.setIsDemo;
  const completeTutorial = userStore.completeTutorial;
  const launchTutorial = client?.launchTutorial;
  const restartClient = client?.restartClient; // TODO: move to IClient
  const [hasLaunched, setLaunched] = useState(false);

  const [simulation, setSimulation] = useState<ISimulation | undefined>(
    undefined
  );
  const [tutorialClient, setTutorialClient] = useState<
    ITutorialClient | undefined
  >(undefined);

  const [showTutorialInfo, setShowTutorialInfo] = useState(true);
  const [tutorialFailed, setTutorialFailed] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  const [checkTutorialStatus, setCheckTutorialStatus] = useState(false);

  const { preferredInputMethod, controls } = userStore.user;

  // TODO: load tutorial from firebase

  useEffect(() => {
    if (tutorial && !requiresRedirect && launchTutorial && !hasLaunched) {
      setLaunched(true);

      const simulationEventListener: ISimulationEventListener = {
        onSimulationInit(simulation: ISimulation) {
          setSimulation(simulation);
        },
        onSimulationStep() {},

        onBlockCreated() {},
        onBlockCreateFailed() {
          setCheckTutorialStatus(true);
        },

        onBlockPlaced() {
          setCheckTutorialStatus(true);
        },
        onBlockDied() {
          setCheckTutorialStatus(true);
        },
        onBlockMoved() {},
        onBlockWrapped() {},
        onLineCleared() {},
      };

      setTutorialClient(
        launchTutorial(
          tutorial,
          simulationEventListener,
          preferredInputMethod,
          controls
        )
      );
      setIsDemo(false);
    }
  }, [
    requiresRedirect,
    tutorial,
    hasLaunched,
    preferredInputMethod,
    launchTutorial,
    setIsDemo,
    setCheckTutorialStatus,
    setTutorialClient,
    controls,
  ]);

  useEffect(() => {
    if (tutorial && checkTutorialStatus && tutorialClient) {
      setCheckTutorialStatus(false);
      const status = tutorialClient.getStatus();
      if (status && status.status !== 'pending') {
        addTutorialAttempt(tutorial.id, status);
        if (status.status === 'success') {
          setTutorialCompleted(true);
        } else {
          setTutorialFailed(true);
        }
      }
    }
  }, [
    tutorial,
    checkTutorialStatus,
    tutorialClient,
    setTutorialFailed,
    addTutorialAttempt,
  ]);

  if (!hasLaunched || !tutorial) {
    return null;
  }

  if (showTutorialInfo) {
    return (
      <TutorialInfoView
        tutorial={tutorial}
        onReceivedInput={() => {
          simulation?.startInterval();
          setShowTutorialInfo(false);
        }}
      />
    );
  } else if (tutorialCompleted && tutorialClient && restartClient) {
    return (
      <TutorialResultsView
        tutorial={tutorial}
        status={tutorialClient.getStatus()}
        onContinue={() => {
          completeTutorial(tutorial.id);
          const remainingTutorials = incompleteTutorials.filter(
            (incompleteTutorial) => incompleteTutorial.id !== tutorial.id
          );
          if (remainingTutorials.length) {
            history.push(Routes.tutorialRequired);
          } else {
            history.push(Routes.allSet);
          }
        }}
        onRetry={() => {
          setTutorialCompleted(false);
          setShowTutorialInfo(true);
          restartClient();
        }}
      />
    );
  } else if (tutorialFailed && restartClient) {
    return (
      <TutorialFailedView
        onReceivedInput={() => {
          setTutorialFailed(false);
          setShowTutorialInfo(true);
          restartClient();
        }}
      />
    );
  }

  return null;
}
