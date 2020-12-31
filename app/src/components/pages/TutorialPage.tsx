import { useEffect, useState } from 'react';
import useAppStore from '../../state/AppStore';
import {
  tutorials,
  ISimulationEventListener,
  ISimulation,
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
  const [hasLaunched, setLaunched] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [simulation, setSimulation] = useState<ISimulation | undefined>(
    undefined
  );
  const [hasReceivedInput] = useReceivedInput();
  const translation = tutorial?.translations?.[user.locale];
  // TODO: useWelcomeRedirect

  // TODO: load tutorial from firebase

  useEffect(() => {
    if (tutorial && !requiresRedirect && launchTutorial && !hasLaunched) {
      setLaunched(true);
      const checkTutorialFinished = async () => {
        // execute outside of game event loop
        await new Promise((resolve) => setTimeout(resolve, 1));
        // FIXME: should this be done here?
        //this._simulation.stopInterval();
        //this._input.destroy();
        // FIXME: on block placed, check if line clear was triggered?
        // line clear should be delayed, 1 s + colors changing
        //const success = this._simulation.getPlayer(block.playerId).score > 0;
        //this._listeners.
        //useRoomStore.getState()
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
      };

      const simulationEventListener: ISimulationEventListener = {
        onSimulationInit(simulation: ISimulation) {
          setSimulation(simulation);
        },
        onSimulationStep() {},

        onBlockCreated() {},

        onBlockPlaced() {
          checkTutorialFinished();
        },
        onBlockDied() {
          checkTutorialFinished();
        },
        onBlockMoved() {},
        onLineCleared() {},
      };
      launchTutorial(tutorial, simulationEventListener);
      setIsDemo(false);
    }
  }, [
    launchTutorial,
    user.hasSeenWelcome,
    requiresRedirect,
    tutorial,
    completeTutorial,
    incompleteTutorials,
    history,
    hasLaunched,
    setIsDemo,
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
