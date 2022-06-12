import localStorageKeys from '@/utils/localStorageKeys';
import { User } from 'firebase/auth';
import create from 'zustand';

type AuthStore = {
  isLoggedIn: boolean;
  user: User | null;
  setUser(user: User | null): void;
};

const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: !!localStorage.getItem(localStorageKeys.loggedIn),
  user: null,
  setUser: (user: User | null) =>
    set((_) => {
      if (user) {
        localStorage.setItem(localStorageKeys.loggedIn, true.toString());
      } else {
        localStorage.removeItem(localStorageKeys.loggedIn);
      }
      return { user, isLoggedIn: !!user };
    }),
}));

export default useAuthStore;
