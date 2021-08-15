import {
  IUser,
  DEFAULT_KEYBOARD_CONTROLS,
  Creatable,
} from 'infinitris2-models';
import create from 'zustand';
import { defaultLocale } from '../internationalization';
import localStorageKeys from '../utils/localStorageKeys';

const localStorageValue = localStorage.getItem(localStorageKeys.localUser);
const localStorageUser = localStorageValue
  ? (JSON.parse(localStorageValue) as IUser)
  : undefined;

type LocalUser = Omit<IUser, 'readOnly' | 'created'>;

const defaultUser: LocalUser = {
  preferredInputMethod: undefined,
  hasSeenWelcome: false,
  hasSeenAllSet: false,
  //nickname: '',
  //challengeAttempts: {},
  locale: defaultLocale,
  //completedChallengeIds: [],
  controls: DEFAULT_KEYBOARD_CONTROLS,
  //coins: 0,
  //networkImpact: 0,
  //color: defaultColor,
};
const initialUser = localStorageUser
  ? { ...defaultUser, ...localStorageUser }
  : defaultUser;

type LocalUserStore = {
  user: LocalUser;
  updateLocalUser(changes: Partial<IUser>): void;
  signOutLocalUser(): void;
};

const useLocalUserStore = create<LocalUserStore>((set) => ({
  user: initialUser,
  updateLocalUser: (changes: Partial<LocalUser>) =>
    set((current) => {
      const user: LocalUser = { ...current.user, ...changes };
      localStorage.setItem(localStorageKeys.localUser, JSON.stringify(user));
      return { user };
    }),
  signOutLocalUser: () =>
    set((_) => {
      localStorage.removeItem(localStorageKeys.localUser);
      return { user: initialUser };
    }),
}));

export default useLocalUserStore;
