import { useEffect, useState } from 'react';
import useAppStore from '../../state/AppStore';
import { tutorials, ISimulationEventListener } from 'infinitris2-models';
import useWelcomeRedirect from '../hooks/useWelcomeRedirect';
import { useHistory, useParams } from 'react-router-dom';
import useIncompleteTutorials from '../hooks/useIncompleteTutorials';
import Routes from '../../models/Routes';
import useReleaseClient from '../hooks/useReleaseClient';

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
  const completeTutorial = appStore.completeTutorial;
  const launchTutorial = client?.launchTutorial;
  const [hasLaunched, setLaunched] = useState(false);
  // TODO: useWelcomeRedirect

  // TODO: load tutorial from firebase

  useEffect(() => {
    if (tutorial && !requiresRedirect && launchTutorial && !hasLaunched) {
      setLaunched(true);
      const checkTutorialFinished = () => {
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
        onSimulationInit() {},
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
  ]);

  useReleaseClient();

  return null;
}
