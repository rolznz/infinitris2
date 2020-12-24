import { IInfinitrisApi, InputMethod } from 'infinitris2-models';
import create from 'zustand';
import User, { loadUser, saveUser } from '../models/User';

type AppStore = {
  readonly user: User;
  readonly returnToUrl?: string;
  readonly clientApi: IInfinitrisApi | null;
  setClientApi(clientApi: IInfinitrisApi | null): void;
  setReturnToUrl(returnToUrl?: string): void;
  // TODO: move to UserStore
  setNickname(nickname: string): void;
  markHasSeenWelcome(): void;
  setPreferredInputMethod(preferredInputMethod: InputMethod): void;
  completeTutorial(tutorialId: string): void;
};

const useAppStore = create<AppStore>((set) => ({
  user: loadUser(),
  clientApi: null,
  returnToUrl: undefined,
  setClientApi: (client: IInfinitrisApi) => set((_) => ({ clientApi: client })),
  setReturnToUrl: (returnToUrl?: string) => set((_) => ({ returnToUrl })),
  setNickname: (nickname: string) => {
    set((state) => {
      const user: User = { ...state.user, nickname };
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
  setPreferredInputMethod: (preferredInputMethod: InputMethod) => {
    set((state) => {
      const user: User = { ...state.user, preferredInputMethod };
      saveUser(user);
      return { user };
    });
  },
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
