import isMobile from '@/utils/isMobile';
import { IUser, DEFAULT_KEYBOARD_CONTROLS } from 'infinitris2-models';
import create from 'zustand';
import { defaultLocale } from '../internationalization';
import localStorageKeys from '../utils/localStorageKeys';

const localStorageValue = localStorage.getItem(localStorageKeys.localUser);
const localStorageUser = localStorageValue
  ? (JSON.parse(localStorageValue) as IUser)
  : undefined;

export type LocalUser = IUser & { nickname?: string };

const defaultUser: LocalUser = {
  userId: undefined as unknown as string,
  preferredInputMethod: isMobile() ? 'touch' : 'keyboard',
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

  readOnly: {
    createdTimestamp: { seconds: 0, nanoseconds: 0 },
    lastModifiedTimestamp: { seconds: 0, nanoseconds: 0 },
    lastWriteTimestamp: { seconds: 0, nanoseconds: 0 },
    numTimesModified: 0,
    numWrites: 0,
    writeRate: 0,
    purchasedEntityIds: [],
    coins: 0,
    networkImpact: 0,
    email: '',
  },
  created: true,
};
const initialUser = localStorageUser
  ? { ...defaultUser, ...localStorageUser }
  : defaultUser;

type LocalUserStore = {
  user: LocalUser;
  updateLocalUser(changes: Partial<LocalUser>): void;
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
