import useAppStore from '../../../state/AppStore';
import {
  ISimulationEventListener,
  ISimulation,
  IChallengeClient,
  IChallenge,
  getChallengePath,
  charactersPath,
  ICharacter,
  stringToHex,
} from 'infinitris2-models';
//import useForcedRedirect from '../../hooks/useForcedRedirect';
import { useHistory, useParams } from 'react-router-dom';
import React from 'react';
import { useCollection, useDocument } from 'swr-firestore';
import usePwaRedirect from '@/components/hooks/usePwaRedirect';
import { coreGameListeners } from '@/game/listeners/coreListeners';
import { useUser, useUserLaunchOptions } from '@/components/hooks/useUser';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import { useReleaseClientOnExitPage } from '@/components/hooks/useReleaseClientOnExitPage';
import { GameUI } from '@/components/game/GameUI';
import useIngameStore from '@/state/IngameStore';
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
import { IChallengeAttempt } from 'infinitris2-models';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { challengeAttemptsPath } from 'infinitris2-models';
import useAuthStore from '@/state/AuthStore';
import removeUndefinedValues from '@/utils/removeUndefinedValues';
import { DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';
import { useSnackbar } from 'notistack';

interface ChallengePageRouteParams {
  id: string;
}

export const isTestChallenge = (challengeId?: string) => challengeId === 'test';

let challengeClient: IChallengeClient | undefined;
let recordedChallengeAttempt: IIngameChallengeAttempt | undefined;
let lastCompletedGrid: IChallenge['grid'];

export default function ChallengePage() {
  const { id } = useParams<ChallengePageRouteParams>();
  useReleaseClientOnExitPage(true);
  return <ChallengePageInternal key={id} challengeId={id!} />;
}

export function getLastCompletedGrid() {
  return lastCompletedGrid;
}

async function saveChallengeAttempt(
  challengeId: string,
  userId: string,
  ingameChallengeAttempt: IIngameChallengeAttempt,
  clientVersion: string
): Promise<boolean> {
  if (!ingameChallengeAttempt.stats) {
    throw new Error('Challenge attempt should have stats set');
  }
  if (ingameChallengeAttempt.status !== 'success') {
    throw new Error('Challenge attempt should have success status set');
  }
  const challengeAttempt: IChallengeAttempt = {
    ...ingameChallengeAttempt,
    created: false,
    challengeId,
    userId,
    stats: ingameChallengeAttempt.stats,
    clientVersion,
  };

  try {
    await addDoc(
      collection(getFirestore(), challengeAttemptsPath),
      removeUndefinedValues(challengeAttempt)
    );
    return true;
  } catch (error) {
    console.error('Failed to save challenge attempt', error);
    return false;
  }
}

type ChallengePageInternalProps = { challengeId: string };

function ChallengePageInternal({ challengeId }: ChallengePageInternalProps) {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const clientVersion = client?.getVersion();
  const restartClient = client?.restartClient;
  const user = useUser();
  const userLaunchOptions = useUserLaunchOptions(user);
  const userId = useAuthStore((store) => store.user?.uid);
  const { enqueueSnackbar } = useSnackbar();

  const isTest = isTestChallenge(challengeId);
  console.log('isTest', isTest);

  const history = useHistory();
  usePwaRedirect();
  useReleaseClientOnExitPage(false);

  const { data: syncedChallenge } = useDocument<IChallenge>(
    !isTest ? getChallengePath(challengeId) : null
  );
  const challenge: IChallenge | undefined = isTest
    ? useChallengeEditorStore.getState().challenge
    : syncedChallenge?.data();

  // TODO: this is needed for both bots and replays
  // but we don't necessarily need all characters
  // it would be more efficient to store redundant data on the replay itself (character ID, color, patternFilename, player nickname)
  const loadCharacters = true; //!!challenge?.simulationSettings?.botSettings;
  const allCharacters = useCollection<ICharacter>(
    loadCharacters ? charactersPath : null
  );
  const hasLoadedCharacters = !loadCharacters || allCharacters?.data?.length;

  const launchChallenge = client?.launchChallenge;
  const [hasLaunched, setLaunched] = React.useState(false);
  const [hasContinued, setContinued] = React.useState(false);
  const [isViewingReplay, setViewingReplay] = React.useState(false);
  const [replayAttempt, setReplayAttempt] = React.useState<
    IChallengeAttempt | IIngameChallengeAttempt | undefined
  >(undefined);

  // const [simulation, setSimulation] = useIngameStore(
  //   (store) => [store.simulation, store.setSimulation],
  //   shallow
  // );

  const [showChallengeInfo, setShowChallengeInfo] = React.useState(false);
  const [hasRoundStarted, setRoundStarted] = React.useState(false);
  const [challengeAttempt, setChallengeAttempt] = React.useState<
    IIngameChallengeAttempt | undefined
  >(undefined);

  const startChallenge = React.useCallback(() => {
    const simulation = useIngameStore.getState().simulation;
    if (simulation) {
      simulation.startInterval();
      setShowChallengeInfo(false);
    }
  }, []);
  const simulation = useIngameStore((store) => store.simulation);
  const player = useNetworkPlayerInfo();

  const handleRetry = React.useCallback(
    (isPlayingRecording: boolean) => {
      setViewingReplay(isPlayingRecording);
      if (!isPlayingRecording) {
        recordedChallengeAttempt = undefined;
        challengeClient!.recording = undefined;
        challengeClient!.launchOptions.player = {
          ...challengeClient!.launchOptions.player,
          ...player,
        };
      }
      useIngameStore.getState().setSimulation(undefined);
      setChallengeAttempt(undefined);
      setRoundStarted(false);
      restartClient!();
    },
    [restartClient, player]
  );

  const retryChallenge = React.useCallback(() => {
    handleRetry(false);
  }, [handleRetry]);

  const viewReplay = React.useCallback(() => {
    if (challengeAttempt) {
      recordedChallengeAttempt = challengeAttempt;
      challengeClient!.recording = challengeAttempt.recording;
      setReplayAttempt(challengeAttempt);
      handleRetry(true);
    }
  }, [challengeAttempt, handleRetry]);

  const viewOtherReplay = React.useCallback(
    (otherAttempt: IChallengeAttempt) => {
      setReplayAttempt(otherAttempt);
      challengeClient!.recording = otherAttempt.recording;
      const replayCharacter: ICharacter | undefined = allCharacters.data
        ?.find(
          (doc) => doc.id === otherAttempt.readOnly?.user?.selectedCharacterId
        )
        ?.data();
      challengeClient!.launchOptions.player = {
        ...challengeClient!.launchOptions.player,
        characterId:
          otherAttempt.readOnly?.user?.selectedCharacterId ||
          DEFAULT_CHARACTER_ID,
        nickname: otherAttempt.readOnly?.user?.nickname || 'Unknown Player',
        color: replayCharacter?.color
          ? stringToHex(replayCharacter?.color)
          : undefined,
        patternFilename: replayCharacter?.patternFilename,
        isPremium: true,
        isNicknameVerified: !!otherAttempt.readOnly?.user?.nickname?.length,
      };
      handleRetry(true);
    },
    [allCharacters.data, handleRetry]
  );

  const preferredInputMethod =
    user.preferredInputMethod || (isMobile() ? 'touch' : 'keyboard');

  const isEditingChallenge =
    useChallengeEditorStore((store) => store.isEditing) && isTest;
  const setIsEditingChallenge = useChallengeEditorStore(
    (store) => store.setIsEditing
  );

  const { incompleteChallenges, isLoadingOfficialChallenges } =
    useIncompleteChallenges(isTest ? undefined : challenge?.worldType);

  const handleContinue = React.useCallback(() => {
    if (hasContinued) {
      return;
    }
    setContinued(true);
    if (isTest || !challenge?.isOfficial) {
      history.goBack();
    } else if (incompleteChallenges.length) {
      history.replace(`${Routes.challenges}/${incompleteChallenges[0].id}`);
    } else {
      history.replace(Routes.home);
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
    if (!isEditingChallenge && simulation) {
      setShowChallengeInfo(true);
    }
  }, [isEditingChallenge, setShowChallengeInfo, simulation]);

  React.useEffect(() => {
    if (
      clientVersion &&
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
            useIngameStore.getState().setSimulation(simulation);
          },
          onNextRound() {
            setRoundStarted(true);
          },
        };

      challengeClient = launchChallenge(
        challenge,
        {
          onAttempt(attempt: IIngameChallengeAttempt) {
            if (!challengeClient?.recording) {
              setChallengeAttempt(attempt);
              if (
                userId &&
                !challenge.isTemplate &&
                challenge.isPublished &&
                attempt.status === 'success'
              ) {
                (async () => {
                  const result = await saveChallengeAttempt(
                    challengeId,
                    userId,
                    attempt,
                    clientVersion
                  );
                  if (result) {
                    enqueueSnackbar('Recording saved');
                  } else {
                    enqueueSnackbar('Failed to save recording', {
                      variant: 'error',
                    });
                  }
                })();
              }
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

                completeOfficialChallenge(
                  user.completedOfficialChallengeIds,
                  challengeId
                );
              }
            } else {
              if (recordedChallengeAttempt) {
                // re-set old challenge attempt
                setChallengeAttempt(recordedChallengeAttempt);
              } else {
                // remove other player's challenge attempt and do full reset
                handleRetry(false);
              }
            }
            setViewingReplay(false);
          },
        },
        {
          ...userLaunchOptions,
          listeners: [...coreGameListeners, challengeSimulationEventListener],
          preferredInputMethod,
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
                      useChallengeEditorStore
                        .getState()
                        .setChallengeCellType(editor.challengeCellType);
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
    player,
    isTest,
    user.completedOfficialChallengeIds,
    challengeId,
    allCharacters,
    hasLoadedCharacters,
    user.unlockedFeatures,
    incompleteChallenges,
    isLoadingOfficialChallenges,
    userId,
    clientVersion,
    handleRetry,
    userLaunchOptions,
    enqueueSnackbar,
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
        allowSkipCountdown
      />
      {!isEditingChallenge && (
        <ChallengeUI
          showChallengeInfo={showChallengeInfo}
          isViewingReplay={isViewingReplay}
          replayAttempt={replayAttempt}
          startChallenge={startChallenge}
          challengeAttempt={challengeAttempt}
          challenge={challenge}
          challengeId={challengeId}
          player={simulation?.humanPlayers[0]}
          retryChallenge={retryChallenge}
          viewReplay={viewReplay}
          viewOtherReplay={viewOtherReplay}
          isTest={isTest}
          onContinue={handleContinue}
        />
      )}
    </>
  );
}
