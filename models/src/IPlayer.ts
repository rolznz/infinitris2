import { IBlock } from '.';
import IBlockEventListener from './IBlockEventListener';
import ICell from './ICell';
import { SimulationSettings } from './SimulationSettings';

export type NetworkPlayerInfo = {
  readonly nickname: string;
  readonly color: number;
  readonly id: number;
  readonly score: number;
  readonly isSpectating: boolean;
};

export interface IPlayer {
  get nickname(): string;
  get color(): number;
  get id(): number;
  get isHuman(): boolean;
  get isNetworked(): boolean;

  get block(): IBlock | undefined;
  get score(): number;
  set score(score: number);
  get estimatedSpawnDelay(): number;
  set estimatedSpawnDelay(estimatedSpawnDelay: number);

  set isSpectating(isSpectating: boolean);
  get isSpectating(): boolean;
  toggleChat(cancel: boolean): void;

  get isChatting(): boolean;

  update(cells: ICell[][], settings: SimulationSettings): void;
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
}
