import create from 'zustand';

type AuthStore = {
  user: firebase.User | null;
  setUser(user: firebase.User | null): void;
};

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user: firebase.User | null) => set((_) => ({ user })),
}));

export default useAuthStore;
