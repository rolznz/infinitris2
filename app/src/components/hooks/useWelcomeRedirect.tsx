import React from 'react';
import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Routes from '../../models/Routes';
import useAppStore from '../../state/AppStore';
import { useUser } from '../../state/UserStore';
import useIncompleteTutorials from './useIncompleteTutorials';

// TODO: rename to useForcedRedirect
export default function useWelcomeRedirect(
  onTutorialPage: boolean = false,
  currentTutorialPriority?: number
) {
  const appStore = useAppStore();
  const user = useUser();
  const setReturnToUrl = appStore.setReturnToUrl;
  const location = useLocation();
  const history = useHistory();
  const incompleteTutorials = useIncompleteTutorials();
  const { pathname } = location;

  let [requiresRedirect, setRequiresRedirect] = React.useState(true);

  useEffect(() => {
    function replaceHistory(url: string) {
      //TODO: store intended url to return to
      setReturnToUrl(pathname);
      history.replace(url);
    }

    if (!user.hasSeenWelcome) {
      replaceHistory(Routes.welcome);
    } else if (
      incompleteTutorials.length > 0 &&
      (!onTutorialPage ||
        (currentTutorialPriority !== undefined &&
          incompleteTutorials.find(
            (incompleteTutorial) =>
              incompleteTutorial.priority &&
              incompleteTutorial.priority > currentTutorialPriority
          )))
    ) {
      replaceHistory(Routes.tutorialRequired);
    } else {
      if (!onTutorialPage || currentTutorialPriority !== undefined) {
        setRequiresRedirect(false);
      }
    }
  }, [
    user.hasSeenWelcome,
    history,
    incompleteTutorials,
    onTutorialPage,
    currentTutorialPriority,
    pathname,
    setReturnToUrl,
  ]);
  return requiresRedirect;
}
