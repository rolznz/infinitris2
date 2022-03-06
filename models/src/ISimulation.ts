import { GameModeEvent } from '@models/GameModeEvent';
import { IGameMode } from '@models/IGameMode';
import { IPlayerEventListener } from '@models/IPlayerEventListener';
import ISimulationEventListener from '@models/ISimulationEventListener';
import { SimulationSettings } from '.';
import IGrid from './IGrid';
import IGridEventListener from './IGridEventListener';
import { IPlayer } from './IPlayer';

export type NetworkSimulationInfo = {
  settings: SimulationSettings;
  gameModeState: unknown;
  currentRoundDuration: number;
};

export default interface ISimulation
  extends IPlayerEventListener,
    IGridEventListener {
  get players(): IPlayer[];
  get settings(): SimulationSettings;
  get isNetworkClient(): boolean;
  get gameMode(): IGameMode<unknown>;
  get fps(): number;
  get followingPlayer(): IPlayer | undefined;
  get shouldNewPlayerSpectate(): boolean;
  get currentRoundStartTime(): number;
  set currentRoundStartTime(currentRoundStartTime: number);
  get currentRoundDuration(): number;
  startInterval(): void;
  stopInterval(): void;
  addPlayer(player: IPlayer): void;
  runningTime: number;
  grid: IGrid;
  isFollowingPlayerId(playerId: number): boolean;
  getPlayer(playerId: number): IPlayer;
  step(): void;
  startNextRound(): void;
  addEventListener(...eventListeners: ISimulationEventListener[]): void;
  onGameModeEvent(event: GameModeEvent): void;
}
