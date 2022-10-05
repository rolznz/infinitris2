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
  getChallengeAttemptPath,
  CreatableIssueReport,
  getIssueReportPath,
  colors,
} from 'infinitris2-models';
//import useForcedRedirect from '../../hooks/useForcedRedirect';
import { useHistory, useParams } from 'react-router-dom';
import React from 'react';
import { useDocument } from 'swr-firestore';
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
import {
  completeOfficialChallenge,
  unlockFeature,
  updateUserOfflineCompletedChallengeIds,
} from '@/state/updateUser';
import useIncompleteChallenges from '@/components/hooks/useIncompleteChallenges';
import Routes, { RouteSubPaths } from '@/models/Routes';
import isMobile from '@/utils/isMobile';
import { IChallengeAttempt } from 'infinitris2-models';
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import { challengeAttemptsPath } from 'infinitris2-models';
import useAuthStore from '@/state/AuthStore';
import removeUndefinedValues from '@/utils/removeUndefinedValues';
import { DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';
import { useSnackbar } from 'notistack';
import useSearchParam from 'react-use/lib/useSearchParam';
import { useCachedCollection } from '@/components/hooks/useCachedCollection';
import useLoaderStore from '@/state/LoaderStore';

export const challengeLaunchReplaySearchParam = 'replay';
interface ChallengePageRouteParams {
  id: string;
}

export const isTestChallenge = (challengeId?: string) => challengeId === 'test';

let challengeClient: IChallengeClient | undefined;
let recordedChallengeAttempt: IIngameChallengeAttempt | undefined;
let reportedChallengeAttemptIds: string[] = [];

export default function ChallengePage() {
  const { id } = useParams<ChallengePageRouteParams>();
  const [resetKey, _setResetKey] = React.useState(0);
  const forceReset = React.useCallback(
    () => _setResetKey((current) => current + 1),
    []
  );

  useReleaseClientOnExitPage(true);
  return (
    <ChallengePageInternal
      key={id + resetKey}
      forceReset={forceReset}
      challengeId={id!}
    />
  );
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

type ChallengePageInternalProps = {
  challengeId: string;
  forceReset(): void;
};

function ChallengePageInternal({
  challengeId,
  forceReset,
}: ChallengePageInternalProps) {
  const appStore = useAppStore();
  const client = appStore.clientApi;
  const clientVersion = client?.getVersion();
  const restartClient = client?.restartClient;
  const user = useUser();
  const userLaunchOptions = useUserLaunchOptions(user);
  const userId = useAuthStore((store) => store.user?.uid);
  const { enqueueSnackbar } = useSnackbar();
  const launchReplayChallengeAttemptId = useSearchParam(
    challengeLaunchReplaySearchParam
  );
  const { data: launchReplayChallengeAttempt } = useDocument<IChallengeAttempt>(
    launchReplayChallengeAttemptId
      ? getChallengeAttemptPath(launchReplayChallengeAttemptId)
      : null
  );

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

  const allCharacters = useCachedCollection<ICharacter>(charactersPath);
  const player = useNetworkPlayerInfo();

  const loaderHasFinished = useLoaderStore((store) => store.hasFinished);
  const hasLoaded =
    !!client && !!player && allCharacters?.length && loaderHasFinished;

  const launchChallenge = client?.launchChallenge;
  const [hasLaunched, setLaunched] = React.useState(false);
  const [hasLaunchedReplayChallengeAttempt, setLaunchedReplayChallengeAttempt] =
    React.useState(false);
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

  const viewAllReplays = React.useCallback(() => {
    history.push(
      `${Routes.challenges}/${challengeId}/${RouteSubPaths.challengesPageAttempts}`
    );
  }, [challengeId, history]);

  const viewOtherReplay = React.useCallback(
    (otherAttempt: IChallengeAttempt) => {
      setReplayAttempt(otherAttempt);
      challengeClient!.recording = otherAttempt.recording;
      const replayCharacter: ICharacter | undefined = allCharacters?.find(
        (doc) => doc.id === otherAttempt.readOnly?.user?.selectedCharacterId
      );
      challengeClient!.launchOptions.player = {
        //...challengeClient!.launchOptions.player,
        characterId:
          otherAttempt.readOnly?.user?.selectedCharacterId ||
          DEFAULT_CHARACTER_ID,
        nickname: otherAttempt.readOnly?.user?.nickname || 'Unknown Player',
        color: stringToHex(replayCharacter?.color ?? colors[0].hex),
        patternFilename: replayCharacter?.patternFilename,
        isPremium: true,
        isNicknameVerified: !!otherAttempt.readOnly?.user?.nickname?.length,
      };
      handleRetry(true);
    },
    [allCharacters, handleRetry]
  );

  // FIXME: viewing someone elses' replay currently requires a full reload of this
  // component (see forceReset). This is overcomplicated and inefficient.
  // ideally no reset of the component would be needed, and just update the necessary state
  React.useEffect(() => {
    if (
      launchReplayChallengeAttempt &&
      simulation &&
      hasLaunched &&
      !hasLaunchedReplayChallengeAttempt
    ) {
      setLaunchedReplayChallengeAttempt(true);
      viewOtherReplay(launchReplayChallengeAttempt.data()!);
    }
  }, [
    viewOtherReplay,
    simulation,
    launchReplayChallengeAttempt,
    hasLaunched,
    hasLaunchedReplayChallengeAttempt,
  ]);

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
      hasLoaded &&
      !isLoadingOfficialChallenges &&
      (!launchReplayChallengeAttemptId || launchReplayChallengeAttempt)
    ) {
      setLaunched(true);

      const challengeSimulationEventListener: Partial<ISimulationEventListener> =
        {
          onNextRound() {
            setRoundStarted(true);
          },
        };

      challengeClient = launchChallenge(
        challenge,
        {
          onRecordPlayerUnexpectedEnd: () => {
            if (
              launchReplayChallengeAttemptId &&
              reportedChallengeAttemptIds.indexOf(
                launchReplayChallengeAttemptId
              ) < 0 &&
              challengeClient?.recording &&
              JSON.stringify(challengeClient.recording) ===
                JSON.stringify(launchReplayChallengeAttempt!.data()?.recording)
            ) {
              reportedChallengeAttemptIds.push(launchReplayChallengeAttemptId);
              enqueueSnackbar(
                'Unexpected end of recording. Recording will be reported.',
                { variant: 'error' }
              );
              if (userId) {
                (async () => {
                  try {
                    const issueReport: CreatableIssueReport = {
                      created: false,
                      entityCollectionPath: 'challengeAttempts',
                      entityId: launchReplayChallengeAttemptId,
                      userId,
                    };
                    await setDoc(
                      doc(
                        getFirestore(),
                        getIssueReportPath(
                          issueReport.entityCollectionPath,
                          issueReport.entityId,
                          issueReport.userId
                        )
                      ),
                      issueReport
                    );
                    return true;
                  } catch (error) {
                    console.error('Failed to report issue', error);
                    return false;
                  }
                })();
              }
              history.replace(`${Routes.challenges}/${challengeId}`);
              forceReset();
            }
          },
          onChallengeReady(simulation: ISimulation) {
            useIngameStore.getState().setSimulation(simulation);
          },
          onAttempt(attempt: IIngameChallengeAttempt) {
            if (!challengeClient?.recording) {
              setChallengeAttempt(attempt);
              if (!isTest && challenge.isPublished) {
                updateUserOfflineCompletedChallengeIds(
                  user.offlineCompletedChallengeIds ?? [],
                  challengeId
                );
              }
              if (
                userId &&
                !challenge.isTemplate &&
                challenge.isPublished &&
                !isTest &&
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
              if (
                attempt.status === 'success' &&
                isTest &&
                typeof challenge.grid === 'string'
              ) {
                useChallengeEditorStore
                  .getState()
                  .setLastCompletedTestGrid(challenge.grid);
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
          allCharacters,
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
    user.offlineCompletedChallengeIds,
    challengeId,
    allCharacters,
    hasLoaded,
    user.unlockedFeatures,
    incompleteChallenges,
    isLoadingOfficialChallenges,
    userId,
    clientVersion,
    handleRetry,
    userLaunchOptions,
    enqueueSnackbar,
    launchReplayChallengeAttemptId,
    launchReplayChallengeAttempt,
    history,
    forceReset,
  ]);

  if (!hasLaunched || !challenge || !simulation) {
    return null;
  }

  const canSkipChallenge =
    !!challenge.isOfficial &&
    !incompleteChallenges.some(
      (incompleteChallenge) => incompleteChallenge.id === challengeId
    );

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
          viewAllReplays={viewAllReplays}
          skipChallenge={handleContinue}
          canViewReplays={
            (!isTest && !challenge.isOfficial) || canSkipChallenge
          }
          onClickTopAttempt={forceReset}
          canSkipChallenge={canSkipChallenge}
          isTest={isTest}
          onContinue={handleContinue}
        />
      )}
    </>
  );
}
