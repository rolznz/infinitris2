import useAppStore from '../../../state/AppStore';
import {
  ISimulationEventListener,
  ISimulation,
  IChallengeClient,
  IChallenge,
  getChallengePath,
  charactersPath,
  ICharacter,
} from 'infinitris2-models';
//import useForcedRedirect from '../../hooks/useForcedRedirect';
import { useHistory, useParams } from 'react-router-dom';
import React from 'react';
import useSearchParam from 'react-use/lib/useSearchParam';
import { useCollection, useDocument } from 'swr-firestore';
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
import isMobile from '@/utils/isMobile';

interface ChallengePageRouteParams {
  id: string;
}

export const isTestChallenge = (challengeId?: string) => challengeId === 'test';

let challengeClient: IChallengeClient | undefined;
let lastCompletedGrid: IChallenge['grid'];

export default function ChallengePage() {
  const { id } = useParams<ChallengePageRouteParams>();
  useReleaseClientOnExitPage(true);
  return <ChallengePageInternal key={id} challengeId={id!} />;
}

export function getLastCompletedGrid() {
  return lastCompletedGrid;
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

  const loadCharacters = !!challenge?.simulationSettings?.botSettings;
  const allCharacters = useCollection<ICharacter>(
    loadCharacters ? charactersPath : null
  );
  const hasLoadedCharacters = !loadCharacters || allCharacters?.data?.length;

  const launchChallenge = client?.launchChallenge;
  const restartClient = client?.restartClient;
  const [hasLaunched, setLaunched] = React.useState(false);
  const [hasContinued, setContinued] = React.useState(false);

  const [simulation, setSimulation] = useIngameStore(
    (store) => [store.simulation, store.setSimulation],
    shallow
  );

  const [showChallengeInfo, setShowChallengeInfo] = React.useState(true);
  const [hasRoundStarted, setRoundStarted] = React.useState(false);
  const [challengeAttempt, setChallengeAttempt] = React.useState<
    IIngameChallengeAttempt | undefined
  >(undefined);

  const handleRetry = React.useCallback(() => {
    setChallengeAttempt(undefined);
    setShowChallengeInfo(true);
    setRoundStarted(false);
    restartClient?.();
  }, [restartClient]);

  const { controls_keyboard } = user;
  const preferredInputMethod =
    user.preferredInputMethod || (isMobile() ? 'touch' : 'keyboard');

  const isEditingChallenge =
    useChallengeEditorStore((store) => store.isEditing) && isTest;
  const setIsEditingChallenge = useChallengeEditorStore(
    (store) => store.setIsEditing
  );

  const player = useNetworkPlayerInfo();

  const { incompleteChallenges, isLoadingOfficialChallenges } =
    useIncompleteChallenges(isTest ? undefined : challenge?.worldType);

  const handleContinue = React.useCallback(() => {
    if (hasContinued) {
      return;
    }
    setContinued(true);
    if (isTest || !challenge.isOfficial) {
      history.goBack();
    } else if (incompleteChallenges.length) {
      history.push(`${Routes.challenges}/${incompleteChallenges[0].id}`);
    } else {
      history.push(Routes.home);
    }
  }, [
    hasContinued,
    isTest,
    challenge?.isOfficial,
    incompleteChallenges,
    history,
  ]);

  React.useEffect(() => {
    if (isTest) {
      setIsEditingChallenge(false);
    }
  }, [isTest, setIsEditingChallenge]);

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
      !hasLaunched &&
      hasLoadedCharacters &&
      !isLoadingOfficialChallenges
    ) {
      setLaunched(true);

      const challengeSimulationEventListener: Partial<ISimulationEventListener> =
        {
          onSimulationInit(simulation: ISimulation) {
            setSimulation(simulation);
          },
          onNextRound() {
            setRoundStarted(true);
          },
        };

      challengeClient = launchChallenge(
        challenge,
        {
          onAttempt(attempt: IIngameChallengeAttempt) {
            setChallengeAttempt(attempt);
            if (attempt.status === 'success' && isTest) {
              lastCompletedGrid = challenge.grid;
            }
            if (attempt.status === 'success' && challenge.isOfficial) {
              unlockFeature(user.unlockedFeatures, 'playTypePicker');
              if (
                incompleteChallenges.length === 1 &&
                incompleteChallenges[0].id === challengeId
              ) {
                // TODO: show this as a page
                // TODO: unlocked features should come from challenges?
                if (challenge.worldType === 'grass') {
                  unlockFeature(user.unlockedFeatures, 'space');
                } else if (challenge.worldType === 'space') {
                  unlockFeature(user.unlockedFeatures, 'volcano');
                }
              }

              setTimeout(() => {
                // delay completion for world progress effect
                completeOfficialChallenge(
                  user.completedOfficialChallengeIds,
                  challengeId
                );
              }, 500);
            }
          },
        },
        {
          listeners: [...coreGameListeners, challengeSimulationEventListener],
          preferredInputMethod,
          controls_keyboard,
          player,
          allCharacters: allCharacters?.data?.map((document) =>
            document.data()
          ),
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
    allCharacters,
    hasLoadedCharacters,
    user.unlockedFeatures,
    incompleteChallenges,
    isLoadingOfficialChallenges,
  ]);

  if (!hasLaunched || !challenge || !simulation) {
    return null;
  }

  return (
    <>
      <GameUI
        chatEnabled={false}
        challengeEditorEnabled={isTest}
        showLeaderboard={Boolean(
          simulation?.round &&
            (hasRoundStarted || simulation?.round.winner) &&
            !showChallengeInfo
        )}
        showEndRoundDisplay={!showChallengeInfo && !challengeAttempt}
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
