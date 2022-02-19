import { IGameMode } from '@models/IGameMode';
import { IPlayerEventListener } from '@models/IPlayerEventListener';
import { SimulationSettings } from '.';
import IGrid from './IGrid';
import IGridEventListener from './IGridEventListener';
import { IPlayer } from './IPlayer';

export type NetworkSimulationInfo = {
  secondsUntilNextDay: number;
  dayNumber: number;
  dayLengthSeconds: number;
  settings: SimulationSettings;
  gameModeState: unknown;
};

export default interface ISimulation
  extends IPlayerEventListener,
    IGridEventListener {
  get dayProportion(): number;
  get secondsUntilNextDay(): number;
  get players(): IPlayer[];
  get settings(): SimulationSettings;
  get isNetworkClient(): boolean;
  set dayNumber(dayNumber: number);
  set dayLengthSeconds(dayLengthSeconds: number);
  set nextDayTime(nextDayTime: number);
  get dayNumber(): number;
  get dayLengthSeconds(): number;
  get nextDayTime(): number;
  get gameMode(): IGameMode<unknown>;
  get fps(): number;
  get followingPlayer(): IPlayer | undefined;
  get shouldNewPlayerSpectate(): boolean;
  startInterval(): void;
  stopInterval(): void;
  addPlayer(player: IPlayer): void;
  runningTime: number;
  grid: IGrid;
  isFollowingPlayerId(playerId: number): boolean;
  goToNextDay(): void;
  getPlayer(playerId: number): IPlayer;
  step(): void;
  startNextRound(): void;
}
