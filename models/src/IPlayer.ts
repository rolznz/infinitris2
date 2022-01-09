import { IBlock } from '.';
import IBlockEventListener from './IBlockEventListener';
import ICell from './ICell';
import { SimulationSettings } from './SimulationSettings';

export type NetworkPlayerInfo = {
  readonly nickname: string;
  readonly color: number;
  readonly id: number;
  readonly score: number;
};

export interface IPlayer {
  get nickname(): string;
  get color(): number;
  get id(): number;

  get block(): IBlock | undefined;
  get score(): number;
  set score(score: number);
  get estimatedSpawnDelay(): number;

  update(cells: ICell[][], settings: SimulationSettings): void;
  addEventListener(eventListener: IBlockEventListener): void;
  onLineClearCellReward(numRowsCleared: number): void;
  createBlock(
    row: number,
    column: number,
    rotation: number,
    layoutIndex: number
  ): void;
  destroy(): void;
}
