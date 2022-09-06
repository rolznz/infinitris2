import { ISimulation, PlayerStatus } from 'infinitris2-models';
import create from 'zustand';

export type MessageLogEntry = {
  message: string;
  nickname?: string;
  color: string;
  createdTime: number;
};

export type LeaderboardEntry = {
  placing: number;
  playerId: number;
  nickname: string;
  color: string;
  characterId: string | undefined;
  isControllable: boolean;
  isBot: boolean;
  score: number;
  status: PlayerStatus;
  isPremium: boolean;
  isNicknameVerified: boolean;
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
  readonly leaderboardPlayerIds: number[];
  readonly endRoundDisplayOpen: boolean;
  setEndRoundDisplayOpen(endRoundDisplayOpen: boolean): void;
  readonly roundConditionsAreMet: boolean;
  setRoundConditionsAreMet(roundConditionsAreMet: boolean): void;
  readonly spawnDelayDisplayVisible: boolean;
  setSpawnDelayDisplayVisible(spawnDelayDisplayVisible: boolean): void;
  readonly numNonSpectatorPlayers: number;
  setNumNonSpectatorPlayers(numNonSpectatorPlayers: number): void;
};

const useIngameStore = create<IngameStore>((set) => ({
  leaderboardEntries: [],
  leaderboardPlayerIds: [],
  messageLogEntries: [],
  simulation: undefined,
  endRoundDisplayOpen: false,
  roundConditionsAreMet: false,
  spawnDelayDisplayVisible: false,
  isChatOpen: false,
  chatMessage: '',
  numNonSpectatorPlayers: 0,
  setSimulation: (simulation: ISimulation | undefined) =>
    set((_) => ({ simulation })),
  setChatOpen: (isChatOpen: boolean) => set((_) => ({ isChatOpen })),
  setChatMessage: (chatMessage: string) => set((_) => ({ chatMessage })),
  addToMessageLog: (message: MessageLogEntry) =>
    set((state) => ({
      messageLogEntries: [...state.messageLogEntries, message],
    })),
  setLeaderboardEntries: (leaderboardEntries: LeaderboardEntry[]) =>
    set((_) => ({
      leaderboardEntries,
      leaderboardPlayerIds: leaderboardEntries.map((entry) => entry.playerId),
    })),
  setEndRoundDisplayOpen: (endRoundDisplayOpen: boolean) =>
    set((_) => ({ endRoundDisplayOpen })),
  setRoundConditionsAreMet: (roundConditionsAreMet: boolean) =>
    set((_) => ({ roundConditionsAreMet })),
  setSpawnDelayDisplayVisible: (spawnDelayDisplayVisible: boolean) =>
    set((_) => ({ spawnDelayDisplayVisible })),
  setNumNonSpectatorPlayers: (numNonSpectatorPlayers: number) =>
    set((_) => ({ numNonSpectatorPlayers })),
}));

export default useIngameStore;
