import create from 'zustand';

type IngameStore = {
  readonly isChatOpen: boolean;
  setChatOpen(isChatOpen: boolean): void;
  readonly chatMessage: string;
  setChatMessage(chatMessage: string): void;
};

const useIngameStore = create<IngameStore>((set) => ({
  isChatOpen: false,
  setChatOpen: (isChatOpen: boolean) => set((_) => ({ isChatOpen })),
  chatMessage: '',
  setChatMessage: (chatMessage: string) => set((_) => ({ chatMessage })),
}));

export default useIngameStore;
