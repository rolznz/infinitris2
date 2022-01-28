import { ISimulation } from 'infinitris2-models';
import create from 'zustand';

type MessageLogEntry = {
  message: string;
  nickname: string;
  color: string;
  createdTime: number;
};

type IngameStore = {
  readonly isChatOpen: boolean;
  setChatOpen(isChatOpen: boolean): void;
  readonly chatMessage: string;
  setChatMessage(chatMessage: string): void;
  readonly simulation?: ISimulation;
  setSimulation(simulation: ISimulation | undefined): void;
  readonly messageLogEntries: MessageLogEntry[];
  addToMessageLog(message: MessageLogEntry): void;
};

const useIngameStore = create<IngameStore>((set) => ({
  messageLogEntries: [],
  simulation: undefined,
  setSimulation: (simulation: ISimulation | undefined) =>
    set((_) => ({ simulation })),
  isChatOpen: false,
  setChatOpen: (isChatOpen: boolean) => set((_) => ({ isChatOpen })),
  chatMessage: '',
  setChatMessage: (chatMessage: string) => set((_) => ({ chatMessage })),
  addToMessageLog: (message: MessageLogEntry) =>
    set((state) => ({
      messageLogEntries: [...state.messageLogEntries, message],
    })),
}));

export default useIngameStore;
