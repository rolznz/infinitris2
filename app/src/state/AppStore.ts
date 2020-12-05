import { InfinitrisApi } from 'infinitris2-models';
import create from 'zustand';
import User, { loadUser, saveUser } from '../models/User';

type AppStore = {
  readonly user: User;
  readonly clientApi: InfinitrisApi | null;
  setClientApi(clientApi: InfinitrisApi | null): void;
  setNickname(nickname: string): void;
};

const useAppStore = create<AppStore>((set) => ({
  user: loadUser(),
  clientApi: null,
  setClientApi: (client: InfinitrisApi) => set((_) => ({ clientApi: client })),
  setNickname: (nickname: string) => {
    set((state) => {
      const user = { ...state.user, nickname };
      saveUser(user);
      return { user };
    });
  },
}));

export default useAppStore;
