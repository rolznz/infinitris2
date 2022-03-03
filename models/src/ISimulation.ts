import { IGameMode } from '@models/IGameMode';
import { IPlayerEventListener } from '@models/IPlayerEventListener';
import { SimulationSettings } from '.';
import IGrid from './IGrid';
import IGridEventListener from './IGridEventListener';
import { IPlayer } from './IPlayer';

export type NetworkSimulationInfo = {
  settings: SimulationSettings;
  gameModeState: unknown;
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
  startInterval(): void;
  stopInterval(): void;
  addPlayer(player: IPlayer): void;
  runningTime: number;
  grid: IGrid;
  isFollowingPlayerId(playerId: number): boolean;
  getPlayer(playerId: number): IPlayer;
  step(): void;
  startNextRound(): void;
}
