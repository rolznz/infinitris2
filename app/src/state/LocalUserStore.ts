import { IUser, DEFAULT_KEYBOARD_CONTROLS } from 'infinitris2-models';
import create from 'zustand';
import { defaultLocale } from '../internationalization';
import localStorageKeys from '../utils/localStorageKeys';

const localStorageValue = localStorage.getItem(localStorageKeys.localUser);
const localStorageUser = localStorageValue
  ? (JSON.parse(localStorageValue) as IUser)
  : undefined;

const initialUser: IUser = localStorageUser || {
  preferredInputMethod: undefined,
  hasSeenWelcome: false,
  nickname: '',
  tutorialAttempts: {},
  locale: defaultLocale,
  completedTutorialIds: [],
  controls: DEFAULT_KEYBOARD_CONTROLS,
};

type LocalUserStore = {
  user: IUser;
  updateUser(changes: Partial<IUser>): void;
  signOut(): void;
};

const useLocalUserStore = create<LocalUserStore>((set) => ({
  user: initialUser,
  updateUser: (changes: Partial<IUser>) =>
    set((current) => {
      const user: IUser = { ...current.user, ...changes };
      localStorage.setItem(localStorageKeys.localUser, JSON.stringify(user));
      return { user };
    }),
  signOut: () =>
    set((_) => {
      localStorage.removeItem(localStorageKeys.localUser);
      return { user: initialUser };
    }),
}));

export default useLocalUserStore;
