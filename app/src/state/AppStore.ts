import create from 'zustand';
import InfinitrisClient from '../client/InfinitrisClient';
import User, { loadUser, saveUser } from '../models/User';

type AppStore = {
  readonly user: User;
  readonly client: InfinitrisClient | null;
  setClient(client: InfinitrisClient | null): void;
  setNickname(nickname: string): void;
};

const useAppStore = create<AppStore>((set) => ({
  user: loadUser(),
  client: null,
  setClient: (client: InfinitrisClient) => set((_) => ({ client })),
  setNickname: (nickname: string) => {
    set((state) => {
      const user = { ...state.user, nickname };
      saveUser(user);
      return { user };
    });
  },
}));

export default useAppStore;
