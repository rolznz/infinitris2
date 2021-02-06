import {
  DEFAULT_KEYBOARD_CONTROLS,
  InputAction,
  InputMethod,
  TutorialStatus,
} from 'infinitris2-models';
import create from 'zustand';
import User, { loadUser, saveUser } from '../models/User';

type UserStore = {
  readonly user: User;
  addTutorialAttempt(tutorialId: string, attempt: TutorialStatus): void;
  setNickname(nickname: string): void;
  setLanguageCode(languageCode: string): void;
  markHasSeenWelcome(): void;
  setPreferredInputMethod(preferredInputMethod: InputMethod | undefined): void;
  completeTutorial(tutorialId: string): void;
  updateControl(inputAction: InputAction, control: string): void;
  resetControls(): void;
  clearProgress(): void;
};

const useUserStore = create<UserStore>((set) => ({
  user: loadUser(),
  setNickname: (nickname: string) => {
    set((state) => {
      const user: User = { ...state.user, nickname };
      saveUser(user);
      return { user };
    });
  },
  setLanguageCode: (languageCode: string) => {
    set((state) => {
      const user: User = { ...state.user, locale: languageCode };
      saveUser(user);
      return { user };
    });
  },
  markHasSeenWelcome: () => {
    set((state) => {
      const user: User = { ...state.user, hasSeenWelcome: true };
      saveUser(user);
      return { user };
    });
  },
  setPreferredInputMethod: (preferredInputMethod: InputMethod | undefined) => {
    set((state) => {
      const user: User = { ...state.user, preferredInputMethod };
      saveUser(user);
      return { user };
    });
  },
  addTutorialAttempt: (tutorialId: string, attempt: TutorialStatus) => {
    set((state) => {
      const attempts = state.user.tutorialAttempts[tutorialId] || [];

      const user: User = {
        ...state.user,
        tutorialAttempts: {
          ...state.user.tutorialAttempts,
          [tutorialId]: [...attempts, attempt],
        },
      };
      saveUser(user);
      return { user };
    });
  },
  // TODO: this isn't needed any more - use tutorialAttempts instead?
  completeTutorial: (tutorialId: string) => {
    set((state) => {
      const user: User = {
        ...state.user,
        completedTutorialIds: [...state.user.completedTutorialIds, tutorialId],
      };
      saveUser(user);
      return { user };
    });
  },
  updateControl: (inputAction: InputAction, control: string) => {
    set((state) => {
      const user: User = {
        ...state.user,
        controls: { ...state.user.controls, [inputAction]: control },
      };
      saveUser(user);
      return { user };
    });
  },
  resetControls: () => {
    set((state) => {
      const user: User = {
        ...state.user,
        controls: DEFAULT_KEYBOARD_CONTROLS,
      };
      saveUser(user);
      return { user };
    });
  },
  clearProgress: () => {
    set((state) => {
      const user: User = {
        ...state.user,
        completedTutorialIds: [],
        tutorialAttempts: {},
      };
      saveUser(user);
      return { user };
    });
  },
}));

export default useUserStore;
