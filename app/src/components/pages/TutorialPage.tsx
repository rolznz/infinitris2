import { useEffect, useState } from 'react';
import useAppStore from '../../state/AppStore';
import {
  tutorials,
  ISimulationEventListener,
  ISimulation,
  ITutorialClient,
} from 'infinitris2-models';
import useWelcomeRedirect from '../hooks/useWelcomeRedirect';
import { useHistory, useParams } from 'react-router-dom';
import useIncompleteTutorials from '../hooks/useIncompleteTutorials';
import Routes from '../../models/Routes';
import React from 'react';
import { Box, Typography } from '@material-ui/core';
import useReceivedInput from '../hooks/useReceivedInput';
import ContinueHint from '../ContinueHint';
import { FormattedMessage } from 'react-intl';

interface TutorialPageRouteParams {
  id: string;
}

export default function TutorialPage() {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const user = appStore.user;
  const history = useHistory();

  const { id } = useParams<TutorialPageRouteParams>();

  const tutorial = tutorials.find((t) => t.id === id);
  const requiresRedirect = useWelcomeRedirect(true, tutorial?.priority);
  const incompleteTutorials = useIncompleteTutorials();
  const setIsDemo = appStore.setIsDemo;
  const completeTutorial = appStore.completeTutorial;
  const launchTutorial = client?.launchTutorial;
  const restartClient = client?.restartClient; // TODO: move to IClient
  const [hasLaunched, setLaunched] = useState(false);

  const [simulation, setSimulation] = useState<ISimulation | undefined>(
    undefined
  );
  const [tutorialClient, setTutorialClient] = useState<
    ITutorialClient | undefined
  >(undefined);

  const [showInfo, setShowInfo] = useState(true);
  const [checkTutorialStatus, setCheckTutorialStatus] = useState(false);

  const [retryId, setRetryId] = useState(0);

  const [hasReceivedInput] = useReceivedInput(retryId);

  const translation = tutorial?.translations?.[user.locale];
  const preferredInputMethod = user.preferredInputMethod;
  // TODO: useWelcomeRedirect

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
        launchTutorial(tutorial, simulationEventListener, preferredInputMethod)
      );
      setIsDemo(false);
    }
  }, [
    launchTutorial,
    requiresRedirect,
    tutorial,
    incompleteTutorials,
    hasLaunched,
    setIsDemo,
    preferredInputMethod,
    setCheckTutorialStatus,
    setTutorialClient,
  ]);

  useEffect(() => {
    if (checkTutorialStatus && tutorial && restartClient) {
      setCheckTutorialStatus(false);
      const status = tutorialClient?.getStatus();
      console.log('Status: ', status);
      if (status && status.status !== 'pending') {
        if (status.status === 'success') {
          completeTutorial(tutorial.id);
          const remainingTutorials = incompleteTutorials.filter(
            (incompleteTutorial) => incompleteTutorial.id !== tutorial.id
          );
          if (remainingTutorials.length) {
            // TODO: automatically go to next room?
            history.replace(Routes.tutorialRequired);
          } else {
            history.replace(Routes.allSet);
          }
        } else {
          setRetryId((oldRetryId) => oldRetryId + 1);
          setShowInfo(true);
          restartClient();
        }
      }
    }
  }, [
    checkTutorialStatus,
    completeTutorial,
    history,
    incompleteTutorials,
    restartClient,
    tutorial,
    tutorialClient,
  ]);

  if (!hasLaunched) {
    return null;
  }

  if (showInfo) {
    if (hasReceivedInput && simulation) {
      simulation.startInterval();
      setShowInfo(false);
    }
    return (
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        maxWidth="100%"
        padding={4}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          color="primary.main"
          bgcolor="background.paper"
          padding={4}
          borderRadius={16}
        >
          <Typography variant="h6">
            {translation?.title || tutorial?.title}
          </Typography>
          <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
            {translation?.description || tutorial?.description || (
              <FormattedMessage
                defaultMessage="No description provided"
                description="No description provided"
              />
            )}
          </Typography>
          <Box pt={2}>
            <ContinueHint />
          </Box>
        </Box>
      </Box>
    );
  }

  return null;
}
