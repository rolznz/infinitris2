import ICellEventListener from '@models/ICellEventListener';
import { IPlayer } from '@models/IPlayer';
import ICell, { NetworkCellInfo } from './ICell';

export const GridLineTypeValues = [
  'none',
  'inverted',
  'classic',
  'dots',
  'editor',
] as const;
export type GridLineType = typeof GridLineTypeValues[number];

export const BlockShadowTypeValues = ['full', 'placement'] as const;
export type BlockShadowType = typeof BlockShadowTypeValues[number];

export type NetworkGridInfo = {
  readonly numRows: number;
  readonly numColumns: number;
  readonly reducedCells: NetworkCellInfo[];
};

export default interface IGrid extends ICellEventListener {
  get isEmpty(): boolean;
  get reducedCells(): ICell[];
  get cells(): ICell[][];
  get numRows(): number;
  get numColumns(): number;
  get nextLinesToClear(): number[];
  nextRandom(key: string): number;
  isTower(row: number): boolean;
  getNeighbour(cell: ICell, dx: number, dy: number): ICell | undefined;
  removePlayer(player: IPlayer): void;
  reset(): void;
  step(isNetworkClient: boolean): void;
  checkLineClears(rows: number[]): void;
  clearLines(rows: number[]): void;
  resize(rows: number, cols: number, atRow: number, atColumn: number): void;
}
