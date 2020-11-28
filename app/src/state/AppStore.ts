import create from 'zustand';
import InfinitrisClient from '../client/InfinitrisClient';

interface AppStore extends Record<string | number | symbol, unknown> {
  nickname: string; // TODO: use firebase auth
  client: InfinitrisClient | null;
  setClient(client: InfinitrisClient | null): void;
  setNickname(nickname: string): void;
}

const useAppStore = create<AppStore>((set) => ({
  nickname: localStorage.getItem('nickname') || '',
  client: null,
  setClient: (client: InfinitrisClient) => set((_) => ({ client })),
  setNickname: (nickname: string) => {
    localStorage.setItem('nickname', nickname);
    set((_) => ({ nickname }));
  },
}));

export default useAppStore;
