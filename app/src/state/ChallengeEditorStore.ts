import localStorageKeys from '@/utils/localStorageKeys';
import {
  ChallengeCellType,
  IChallenge,
  IChallengeEditor,
} from 'infinitris2-models';
import create from 'zustand';

type ChallengeEditorStore = {
  challenge?: IChallenge;
  setChallenge(challenge: IChallenge | undefined): void;
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

const useChallengeEditorStore = create<ChallengeEditorStore>((set) => ({
  isEditing: false,
  challengeCellType: ChallengeCellType.Full,
  challenge: loadExistingChallenge(),
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
  setIsEditing: (isEditing: boolean) => set((_) => ({ isEditing })),
  setEditor: (editor: IChallengeEditor | undefined) => set((_) => ({ editor })),
  setChallengeCellType: (challengeCellType: ChallengeCellType) =>
    set((_) => ({ challengeCellType })),
}));

export default useChallengeEditorStore;
