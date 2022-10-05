import localStorageKeys from '@/utils/localStorageKeys';
import {
  ChallengeCellType,
  IChallenge,
  IChallengeEditor,
} from 'infinitris2-models';
import create from 'zustand';

type ChallengeEditorStore = {
  challenge?: IChallenge;
  challengeId?: string;
  lastCompletedTestGrid?: string | undefined;
  setChallenge(challenge: IChallenge | undefined): void;
  setChallengeId(challengeId: string | undefined): void;
  setLastCompletedTestGrid(lastCompletedTestGrid: string | undefined): void;
  isEditing?: boolean;
  setIsEditing(isEditing: boolean): void;
  editor?: IChallengeEditor;
  setEditor(editor: IChallengeEditor | undefined): void;
  challengeCellType: ChallengeCellType;
  setChallengeCellType(challengeCellType: ChallengeCellType): void;
};

function loadExistingChallenge() {
  const existingChallengeJson = localStorage.getItem(
    localStorageKeys.challenge
  );
  let existingChallenge = existingChallengeJson
    ? (JSON.parse(existingChallengeJson) as IChallenge)
    : undefined;
  return existingChallenge;
}
function loadExistingChallengeId() {
  const existingChallengeId = localStorage.getItem(
    localStorageKeys.challengeId
  );
  return existingChallengeId || undefined;
}

const useChallengeEditorStore = create<ChallengeEditorStore>((set) => ({
  isEditing: false,
  challengeCellType: ChallengeCellType.Full,
  challenge: loadExistingChallenge(),
  challengeId: loadExistingChallengeId(),
  lastCompletedTestGrid:
    localStorage.getItem(localStorageKeys.lastCompletedTestGrid) ?? undefined,
  setChallenge: (challenge: IChallenge | undefined) =>
    set((_) => {
      if (challenge) {
        localStorage.setItem(
          localStorageKeys.challenge,
          JSON.stringify(challenge)
        );
      } else {
        localStorage.removeItem(localStorageKeys.challenge);
      }
      return { challenge };
    }),
  setChallengeId: (challengeId: string | undefined) =>
    set((_) => {
      if (challengeId) {
        localStorage.setItem(localStorageKeys.challengeId, challengeId);
      } else {
        localStorage.removeItem(localStorageKeys.challengeId);
      }
      return { challengeId };
    }),
  setLastCompletedTestGrid: (lastCompletedTestGrid: string | undefined) =>
    set((_) => {
      if (lastCompletedTestGrid) {
        localStorage.setItem(
          localStorageKeys.lastCompletedTestGrid,
          lastCompletedTestGrid
        );
      } else {
        localStorage.removeItem(localStorageKeys.lastCompletedTestGrid);
      }
      return { lastCompletedTestGrid };
    }),
  setIsEditing: (isEditing: boolean) => set((_) => ({ isEditing })),
  setEditor: (editor: IChallengeEditor | undefined) => set((_) => ({ editor })),
  setChallengeCellType: (challengeCellType: ChallengeCellType) =>
    set((_) => ({ challengeCellType })),
}));

export default useChallengeEditorStore;
