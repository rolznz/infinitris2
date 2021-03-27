import { getChallengePath } from '@/firebase';
import { useDocument } from '@nandorojo/swr-firestore';
import { IChallenge } from 'infinitris2-models';
import React from 'react';
import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Routes from '../../models/Routes';
import useAppStore from '../../state/AppStore';
import { useUser } from '../../state/UserStore';
import { isTestChallenge } from '../pages/ChallengePage/ChallengePage';
import useIncompleteChallenges from './useIncompleteChallenges';

export default function useForcedRedirect(
  onChallengePage: boolean = false,
  challengeId?: string,
  enabled: boolean = true
) {
  const appStore = useAppStore();
  const user = useUser();
  const userHasSeenWelcome = user?.hasSeenWelcome;
  const setReturnToUrl = appStore.setReturnToUrl;
  const location = useLocation();
  const history = useHistory();
  const {
    incompleteChallenges,
    isLoadingOfficialChallenges,
  } = useIncompleteChallenges();
  const { pathname } = location;

  const isTest = isTestChallenge(challengeId);
  const { data: challenge } = useDocument<IChallenge>(
    !isTest && challengeId ? getChallengePath(challengeId) : null
  );
  const currentChallengePriority = challenge?.priority;
  const challengeLoaded = challenge?.exists;

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
        incompleteChallenges.find(
          (incompleteChallenge) =>
            incompleteChallenge.priority &&
            incompleteChallenge.priority > (currentChallengePriority || 0)
        ))
    ) {
      replaceHistory(Routes.challengeRequired);
    } else {
      if (
        (!onChallengePage || challengeLoaded) &&
        !isLoadingOfficialChallenges
      ) {
        setRequiresRedirect(false);
      }
    }
  }, [
    userHasSeenWelcome,
    history,
    incompleteChallenges,
    isLoadingOfficialChallenges,
    onChallengePage,
    currentChallengePriority,
    challengeLoaded,
    pathname,
    setReturnToUrl,
    enabled,
  ]);
  return requiresRedirect;
}
