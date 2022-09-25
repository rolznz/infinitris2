import { GameModeEvent } from '@models/GameModeEvent';
import { ICharacter } from '@models/ICharacter';
import { IGameMode } from '@models/IGameMode';
import { IRotationSystem } from '@models/IRotationSystem';
import { IRound, NetworkRoundInfo } from '@models/IRound';
import ISimulationEventListener from '@models/ISimulationEventListener';
import Layout, { LayoutSet } from '@models/Layout';
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
  get controllablePlayer(): IPlayer | undefined;
  get humanPlayers(): IPlayer[];
  get activePlayers(): IPlayer[];
  get shouldNewPlayerSpectate(): boolean;
  get round(): IRound | undefined;
  get isPaused(): boolean;
  get isRunning(): boolean;
  get grid(): IGrid;
  get layoutSet(): LayoutSet;
  get safeLayouts(): Layout[];
  get allLayouts(): Layout[];
  get rotationSystem(): IRotationSystem;
  get frameNumber(): number;
  get rootSeed(): number;
  findFreeSpawnColumn(): number;
  addBot(
    charactersPool: ICharacter[] | undefined,
    reactionDelay?: number
  ): void;
  wasRecentlyPlaced(occurrenceFrame: number): boolean;
  destroy(): void;
  startInterval(): void;
  stopInterval(): void;
  addPlayer(player: IPlayer): void;
  addBots(charactersPool?: ICharacter[] | undefined): void;
  runningTime: number;
  grid: IGrid;
  isFollowingPlayerId(playerId: number): boolean;
  getPlayer(playerId: number): IPlayer;
  step(): void;
  addEventListener(
    ...eventListeners: Partial<ISimulationEventListener>[]
  ): void;
  onGameModeEvent(event: GameModeEvent): void;
  init(): void;
  followPlayer(player: IPlayer): void;
  removePlayer(playerId: number): void;
  getFreePlayerId(): number;
  generateCharacter(
    charactersPool: ICharacter[] | undefined,
    playerId: number,
    isBot: boolean,
    desiredCharacterId?: string
  ): Partial<ICharacter>;
  nextRandom(key: string): number;
  addMessage(
    message: string,
    player: IPlayer | undefined,
    isSynced: boolean
  ): void;
  isTower(row: number): boolean;
  getTowerRow(): number;
}
