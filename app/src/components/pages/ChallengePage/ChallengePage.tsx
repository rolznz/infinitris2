import useAppStore from '../../../state/AppStore';
import {
  ISimulationEventListener,
  ISimulation,
  IChallengeClient,
  IChallenge,
  getChallengePath,
} from 'infinitris2-models';
//import useForcedRedirect from '../../hooks/useForcedRedirect';
import { useHistory, useParams } from 'react-router-dom';
import React from 'react';
import useSearchParam from 'react-use/lib/useSearchParam';
import { useDocument } from 'swr-firestore';
import { IPlayer } from 'infinitris2-models';
import usePwaRedirect from '@/components/hooks/usePwaRedirect';
import { coreGameListeners } from '@/game/listeners/coreListeners';
import { useUser } from '@/components/hooks/useUser';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import { useReleaseClientOnExitPage } from '@/components/hooks/useReleaseClientOnExitPage';
import { GameUI } from '@/components/game/GameUI';
import useIngameStore from '@/state/IngameStore';
import shallow from 'zustand/shallow';
import {
  playGameMusic,
  worldVariationToTrackNumber,
} from '@/sound/SoundManager';
import { IIngameChallengeAttempt } from 'infinitris2-models';
import { IChallengeEditor } from 'infinitris2-models';
import { ChallengeUI } from '@/components/pages/ChallengePage/ChallengeUI';
import { useNetworkPlayerInfo } from '@/components/hooks/useNetworkPlayerInfo';
import { completeOfficialChallenge, unlockFeature } from '@/state/updateUser';
import useIncompleteChallenges from '@/components/hooks/useIncompleteChallenges';
import Routes from '@/models/Routes';

interface ChallengePageRouteParams {
  id: string;
}

export const isTestChallenge = (challengeId?: string) => challengeId === 'test';

let challengeClient: IChallengeClient | undefined;

export default function ChallengePage() {
  const { id } = useParams<ChallengePageRouteParams>();
  useReleaseClientOnExitPage(true);
  return <ChallengePageInternal key={id} challengeId={id!} />;
}

type ChallengePageInternalProps = { challengeId: string };

function ChallengePageInternal({ challengeId }: ChallengePageInternalProps) {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const user = useUser();

  const json = useSearchParam('json');

  const isTest = isTestChallenge(challengeId);
  console.log('isTest', isTest);

  const history = useHistory();
  usePwaRedirect();
  useReleaseClientOnExitPage(false);
  //const requiresRedirect = useForcedRedirect(true, challengeId, !isTest);

  const { data: syncedChallenge } = useDocument<IChallenge>(
    !isTest ? getChallengePath(challengeId) : null
  );
  const challenge: IChallenge = isTest
    ? JSON.parse(json as string)
    : syncedChallenge?.data();

  const launchChallenge = client?.launchChallenge;
  const restartClient = client?.restartClient;
  const [hasLaunched, setLaunched] = React.useState(false);
  const [hasContinued, setContinued] = React.useState(false);

  const [simulation, setSimulation] = useIngameStore(
    (store) => [store.simulation, store.setSimulation],
    shallow
  );

  const [showChallengeInfo, setShowChallengeInfo] = React.useState(true);
  const [challengeAttempt, setChallengeAttempt] = React.useState<
    IIngameChallengeAttempt | undefined
  >(undefined);

  const handleRetry = React.useCallback(() => {
    setChallengeAttempt(undefined);
    setShowChallengeInfo(true);
    restartClient?.();
  }, [restartClient]);

  const { preferredInputMethod, controls_keyboard } = user;

  const isEditingChallenge =
    useChallengeEditorStore((store) => store.isEditing) && isTest;

  const player = useNetworkPlayerInfo();

  const { incompleteChallenges } = useIncompleteChallenges(
    challenge?.worldType
  );

  const handleContinue = React.useCallback(() => {
    if (hasContinued) {
      return;
    }
    setContinued(true);
    if (isTest) {
      history.goBack();
    } else if (incompleteChallenges.length) {
      history.push(`${Routes.challenges}/${incompleteChallenges[0].id}`);
    } else {
      // TODO: show this as a page
      // TODO: unlocked features should come from challenges?
      if (challenge.worldType === 'grass') {
        unlockFeature(user.unlockedFeatures, 'playTypePicker', 'volcano');
      }
      history.push(Routes.home);
    }
  }, [
    hasContinued,
    isTest,
    incompleteChallenges,
    history,
    challenge?.worldType,
    user?.unlockedFeatures,
  ]);

  React.useEffect(() => {
    if (isTest && !isEditingChallenge) {
      setShowChallengeInfo(true);
    }
  }, [isTest, isEditingChallenge, setShowChallengeInfo]);

  React.useEffect(() => {
    if (
      challenge &&
      player /*&& !requiresRedirect*/ &&
      launchChallenge &&
      !hasLaunched
    ) {
      setLaunched(true);

      const challengeSimulationEventListener: Partial<ISimulationEventListener> =
        {
          onSimulationInit(simulation: ISimulation) {
            setSimulation(simulation);
          },
        };

      challengeClient = launchChallenge(
        challenge,
        {
          onAttempt(attempt: IIngameChallengeAttempt) {
            setChallengeAttempt(attempt);
            if (attempt.status === 'success' && challenge.isOfficial) {
              completeOfficialChallenge(
                user.completedOfficialChallengeIds,
                challengeId
              );
            }
          },
        },
        {
          listeners: [...coreGameListeners, challengeSimulationEventListener],
          preferredInputMethod,
          controls_keyboard,
          player: player as IPlayer, // FIXME: use a different interface
          challengeEditorSettings: isTest
            ? {
                isEditing: false,
                listeners: [
                  {
                    onToggleIsEditing: (editor: IChallengeEditor) => {
                      useChallengeEditorStore
                        .getState()
                        .setIsEditing(editor.isEditing);
                    },
                    onSaveGrid: (_editor: IChallengeEditor, grid: string) => {
                      useChallengeEditorStore.getState().setChallenge({
                        ...useChallengeEditorStore.getState().challenge!,
                        grid,
                      });
                    },
                    onChangeChallengeCellType: (editor) => {
                      useChallengeEditorStore
                        .getState()
                        .setChallengeCellType(editor.challengeCellType);
                    },
                  },
                ],
              }
            : undefined,
        }
      );
      useChallengeEditorStore.getState().setEditor(challengeClient.editor);
      playGameMusic(
        challenge.worldType || 'grass',
        worldVariationToTrackNumber(challenge.worldVariation)
      );
    }
  }, [
    challenge,
    hasLaunched,
    preferredInputMethod,
    launchChallenge,
    controls_keyboard,
    player,
    isTest,
    setSimulation,
    user.completedOfficialChallengeIds,
    challengeId,
  ]);

  if (!hasLaunched || !challenge || !simulation) {
    return null;
  }

  console.log(
    'Render challenge page UI: ',
    challengeAttempt,
    isEditingChallenge
  );

  return (
    <>
      <GameUI
        chatEnabled={false}
        challengeEditorEnabled={isTest}
        showLeaderboard={false /* TODO: based on challenge settings */}
      />
      {!isEditingChallenge && (
        <ChallengeUI
          showChallengeInfo={showChallengeInfo}
          simulation={simulation}
          challengeAttempt={challengeAttempt}
          challenge={challenge}
          challengeId={challengeId}
          player={simulation.humanPlayers[0]}
          setShowChallengeInfo={setShowChallengeInfo}
          retryChallenge={handleRetry}
          isTest={isTest}
          onContinue={handleContinue}
        />
      )}
    </>
  );
}
