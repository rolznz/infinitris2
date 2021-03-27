import React from 'react';
import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Routes from '../../models/Routes';
import useAppStore from '../../state/AppStore';
import { useUser } from '../../state/UserStore';
import useIncompleteChallenges from './useIncompleteChallenges';

export default function useWelcomeRedirect(
  onChallengePage: boolean = false,
  currentChallengePriority?: number,
  enabled: boolean = true
) {
  const appStore = useAppStore();
  const user = useUser();
  const userHasSeenWelcome = user?.hasSeenWelcome;
  const setReturnToUrl = appStore.setReturnToUrl;
  const location = useLocation();
  const history = useHistory();
  const incompleteChallenges = useIncompleteChallenges();
  const { pathname } = location;

  let [requiresRedirect, setRequiresRedirect] = React.useState(enabled);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    function replaceHistory(url: string) {
      //TODO: store intended url to return to
      setReturnToUrl(pathname);
      history.replace(url);
    }

    if (!userHasSeenWelcome) {
      replaceHistory(Routes.welcome);
    } else if (
      incompleteChallenges.length > 0 &&
      (!onChallengePage ||
        (currentChallengePriority !== undefined &&
          incompleteChallenges.find(
            (incompleteChallenge) =>
              incompleteChallenge.priority &&
              incompleteChallenge.priority > currentChallengePriority
          )))
    ) {
      replaceHistory(Routes.challengeRequired);
    } else {
      if (!onChallengePage || currentChallengePriority !== undefined) {
        setRequiresRedirect(false);
      }
    }
  }, [
    userHasSeenWelcome,
    history,
    incompleteChallenges,
    onChallengePage,
    currentChallengePriority,
    pathname,
    setReturnToUrl,
    enabled,
  ]);
  return requiresRedirect;
}
