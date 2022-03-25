import { IPlayer } from '@models/IPlayer';

export type NetworkRoundInfo = {
  isWaitingForNextRound: boolean;
  nextRoundTimeRemaining: number;
  currentRoundDuration: number;
  winnerId: number | undefined;
};

export interface IRound {
  get isWaitingForNextRound(): boolean;
  get nextRoundTime(): number;
  get winner(): IPlayer | undefined;
  get currentRoundStartTime(): number;
  set currentRoundStartTime(currentRoundStartTime: number);
  get currentRoundDuration(): number;
  get conditionsAreMet(): boolean;
  step(): void;
  start(): void;
  end(winner: IPlayer | undefined): void;
  serialize(): NetworkRoundInfo;
  deserialize(info: NetworkRoundInfo): void;
  restartNextRoundTimer(): void;
}
