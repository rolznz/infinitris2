import { GameModeEvent } from '@models/GameModeEvent';
import { IGameMode } from '@models/IGameMode';
import { IRound, NetworkRoundInfo } from '@models/IRound';
import ISimulationEventListener from '@models/ISimulationEventListener';
import { SimulationSettings } from '@models/SimulationSettings';
import IGrid from './IGrid';
import { IPlayer } from './IPlayer';

export type NetworkSimulationInfo = {
  settings: SimulationSettings;
  gameModeState: unknown;
  round: NetworkRoundInfo | undefined;
};

export default interface ISimulation extends ISimulationEventListener {
  get players(): IPlayer[];
  get nonSpectatorPlayers(): IPlayer[];
  get settings(): SimulationSettings;
  get isNetworkClient(): boolean;
  get gameMode(): IGameMode<unknown>;
  get fps(): number;
  get followingPlayer(): IPlayer | undefined;
  get humanPlayer(): IPlayer | undefined;
  get shouldNewPlayerSpectate(): boolean;
  get round(): IRound | undefined;
  startInterval(): void;
  stopInterval(): void;
  addPlayer(player: IPlayer): void;
  runningTime: number;
  grid: IGrid;
  isFollowingPlayerId(playerId: number): boolean;
  getPlayer(playerId: number): IPlayer;
  step(): void;
  addEventListener(
    ...eventListeners: Partial<ISimulationEventListener>[]
  ): void;
  onGameModeEvent(event: GameModeEvent): void;
}
