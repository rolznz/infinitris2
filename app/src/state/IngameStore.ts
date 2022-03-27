import { ISimulation, PlayerStatus } from 'infinitris2-models';
import create from 'zustand';

export type MessageLogEntry = {
  message: string;
  nickname: string;
  color: string;
  createdTime: number;
};

export type LeaderboardEntry = {
  placing: number;
  playerId: number;
  nickname: string;
  color: string;
  characterId: string | undefined;
  isHuman: boolean;
  isBot: boolean;
  score: number;
  status: PlayerStatus;
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
  readonly leaderboardEntries: LeaderboardEntry[];
  setLeaderboardEntries(leaderboardEntries: LeaderboardEntry[]): void;
  readonly endRoundDisplayOpen: boolean;
  setEndRoundDisplayOpen(endRoundDisplayOpen: boolean): void;
  readonly roundConditionsAreMet: boolean;
  setRoundConditionsAreMet(roundConditionsAreMet: boolean): void;
  readonly spawnDelayDisplayVisible: boolean;
  setSpawnDelayDisplayVisible(spawnDelayDisplayVisible: boolean): void;
};

const useIngameStore = create<IngameStore>((set) => ({
  leaderboardEntries: [],
  messageLogEntries: [],
  simulation: undefined,
  endRoundDisplayOpen: false,
  roundConditionsAreMet: false,
  spawnDelayDisplayVisible: false,
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
  setLeaderboardEntries: (leaderboardEntries: LeaderboardEntry[]) =>
    set((_) => ({ leaderboardEntries })),
  setEndRoundDisplayOpen: (endRoundDisplayOpen: boolean) =>
    set((_) => ({ endRoundDisplayOpen })),
  setRoundConditionsAreMet: (roundConditionsAreMet: boolean) =>
    set((_) => ({ roundConditionsAreMet })),
  setSpawnDelayDisplayVisible: (spawnDelayDisplayVisible: boolean) =>
    set((_) => ({ spawnDelayDisplayVisible })),
}));

export default useIngameStore;
