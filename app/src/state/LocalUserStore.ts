import isMobile from '@/utils/isMobile';
import { IUser } from 'infinitris2-models';
import create from 'zustand';
//import { defaultLocale } from '../internationalization';
import localStorageKeys from '../utils/localStorageKeys';

const localStorageValue = localStorage.getItem(localStorageKeys.localUser);
const localStorageUser = localStorageValue
  ? (JSON.parse(localStorageValue) as IUser)
  : undefined;

export type LocalUserWithoutUserProps = {
  nickname?: string;
  freeCharacterIds?: string[];
  selectedCharacterId?: string; // TODO: move to IUser
};
export type LocalUser = LocalUserWithoutUserProps &
  Omit<IUser, 'userId' | 'readOnly' | 'created'>;

export const DEFAULT_CHARACTER_ID = '0';
export const DEFAULT_CHARACTER_IDs = [DEFAULT_CHARACTER_ID];

const defaultUser: LocalUser = {
  preferredInputMethod: isMobile() ? 'touch' : 'keyboard',
  //freeCharacterIds: [DEFAULT_CHARACTER_ID],
  //selectedCharacterId: DEFAULT_CHARACTER_ID,
  //hasSeenWelcome: false,
  //hasSeenAllSet: false,
  //nickname: '',
  //challengeAttempts: {},
  //locale: defaultLocale,
  //completedChallengeIds: [],
  //controls_keyboard: DEFAULT_KEYBOARD_CONTROLS,
  //characterId: '0',
  //coins: 0,
  //networkImpact: 0,
  //color: defaultColor,
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
