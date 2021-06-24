import { IUser, DEFAULT_KEYBOARD_CONTROLS } from 'infinitris2-models';
import create from 'zustand';
import { defaultLocale } from '../internationalization';
import localStorageKeys from '../utils/localStorageKeys';

const defaultColor = 0x666666;

const localStorageValue = localStorage.getItem(localStorageKeys.localUser);
const localStorageUser = localStorageValue
  ? (JSON.parse(localStorageValue) as IUser)
  : undefined;

const defaultUser = {
  preferredInputMethod: undefined,
  hasSeenWelcome: false,
  hasSeenAllSet: false,
  nickname: '',
  challengeAttempts: {},
  locale: defaultLocale,
  completedChallengeIds: [],
  controls: DEFAULT_KEYBOARD_CONTROLS,
  coins: 0,
  networkImpact: 0,
  color: defaultColor,
};
const initialUser: IUser = localStorageUser
  ? { ...defaultUser, ...localStorageUser }
  : defaultUser;

type LocalUserStore = {
  user: IUser;
  updateLocalUser(changes: Partial<IUser>): void;
  signOutLocalUser(): void;
};

const useLocalUserStore = create<LocalUserStore>((set) => ({
  user: initialUser,
  updateLocalUser: (changes: Partial<IUser>) =>
    set((current) => {
      const user: IUser = { ...current.user, ...changes };
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
