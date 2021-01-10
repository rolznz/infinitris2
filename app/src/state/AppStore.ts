import {
  IInfinitrisApi,
  InputMethod,
  TutorialStatus,
} from 'infinitris2-models';
import create from 'zustand';
import User, { loadUser, saveUser } from '../models/User';

type AppStore = {
  readonly user: User;
  readonly returnToUrl?: string;
  readonly clientApi?: IInfinitrisApi;
  readonly isDemo: boolean;
  readonly internationalization: {
    messages: Record<string, string>;
  };
  setIsDemo(isDemo: boolean): void;
  setClientApi(clientApi: IInfinitrisApi): void;
  setReturnToUrl(returnToUrl?: string): void;
  setInternationalizationMessages(messages: Record<string, string>): void;
  // TODO: move to UserStore
  addTutorialAttempt(tutorialId: string, attempt: TutorialStatus): void;
  setNickname(nickname: string): void;
  setLanguageCode(languageCode: string): void;
  markHasSeenWelcome(): void;
  setPreferredInputMethod(preferredInputMethod: InputMethod | undefined): void;
  completeTutorial(tutorialId: string): void;
};

const useAppStore = create<AppStore>((set) => ({
  user: loadUser(),
  clientApi: undefined,
  isDemo: false,
  returnToUrl: undefined,
  internationalization: {
    messages: {},
  },
  setInternationalizationMessages: (messages: Record<string, string>) =>
    set((state) => ({
      internationalization: { ...state.internationalization, messages },
    })),
  setIsDemo: (isDemo: boolean) => set((_) => ({ isDemo })),
  setClientApi: (client: IInfinitrisApi) => set((_) => ({ clientApi: client })),
  setReturnToUrl: (returnToUrl?: string) => set((_) => ({ returnToUrl })),
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
}));

export default useAppStore;
