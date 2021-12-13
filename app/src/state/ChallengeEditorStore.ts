import { createNewChallenge } from '@/components/pages/CreateChallengePage/createNewChallenge';
import { WithId } from '@/models/WithId';
import localStorageKeys from '@/utils/localStorageKeys';
import { IChallenge } from 'infinitris2-models';
import create from 'zustand';

type ChallengeEditorStore = {
  challenge?: WithId<IChallenge>;
  setChallenge(challenge: WithId<IChallenge> | undefined): void;
};

function loadExistingChallenge() {
  const existingChallengeJson = localStorage.getItem(
    localStorageKeys.challenge
  );
  let existingChallenge = existingChallengeJson
    ? (JSON.parse(existingChallengeJson) as WithId<IChallenge>)
    : null;
  if (!existingChallenge) {
    existingChallenge = createNewChallenge();
  }
  return existingChallenge;
}

const useChallengeEditorStore = create<ChallengeEditorStore>((set) => ({
  challenge: loadExistingChallenge(),
  setChallenge: (challenge: WithId<IChallenge> | undefined) =>
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
