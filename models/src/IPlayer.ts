import { IBlock } from '.';
import IBlockEventListener from './IBlockEventListener';
import ICell from './ICell';
import { SimulationSettings } from './SimulationSettings';

export enum PlayerStatus {
  ingame,
  knockedOut,
  spectating,
}

export type NetworkPlayerInfo = {
  readonly nickname: string;
  readonly color: number;
  readonly characterId?: string;
  readonly patternFilename?: string;
  readonly id: number;
  readonly score: number;
  readonly health: number;
  readonly status: PlayerStatus;
  readonly isBot: boolean;
};

export interface IPlayer {
  get nickname(): string;
  get color(): number;
  get patternFilename(): string | undefined;
  get characterId(): string | undefined;
  get id(): number;
  get isControllable(): boolean;
  get isBot(): boolean;
  get isNetworked(): boolean;
  get status(): PlayerStatus;
  set spawnLocationCell(cell: ICell | undefined);
  set checkpointCell(cell: ICell | undefined);
  get checkpointCell(): ICell | undefined;

  get block(): IBlock | undefined;
  get score(): number;
  set score(score: number);
  get health(): number;
  set health(health: number);
  get estimatedSpawnDelay(): number;
  set estimatedSpawnDelay(estimatedSpawnDelay: number);
  set status(status: PlayerStatus);
  get lastStatusChangeTime(): number;
  toggleChat(cancel?: boolean): void;

  get isChatting(): boolean;

  update(): void;
  addEventListener(eventListener: IBlockEventListener): void;
  onLineClearCellReward(numRowsCleared: number): void;
  createBlock(
    blockId: number,
    row: number,
    column: number,
    rotation: number,
    layoutIndex: number,
    force: boolean
  ): void;
  destroy(): void;
  removeBlock(): void;
  saveSpawnPosition(block: IBlock): void;
}
