import localStorageKeys from '@/utils/localStorageKeys';
import { IChallenge } from 'infinitris2-models';
import create from 'zustand';

type ChallengeEditorStore = {
  challenge?: IChallenge;
  setChallenge(challenge: IChallenge | undefined): void;
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
}));

export default useChallengeEditorStore;
