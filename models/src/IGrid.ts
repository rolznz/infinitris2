import ICellEventListener from '@models/ICellEventListener';
import { IPlayer } from '@models/IPlayer';
import ICell, { NetworkCellInfo } from './ICell';

export type GridLineType = 'none' | 'inverted' | 'classic' | 'dots' | 'editor';

export type NetworkGridInfo = {
  readonly numRows: number;
  readonly numColumns: number;
  readonly reducedCells: NetworkCellInfo[];
};

export default interface IGrid extends ICellEventListener {
  isTower(row: number): boolean;
  get isEmpty(): boolean;
  get reducedCells(): ICell[];
  get cells(): ICell[][];
  get numRows(): number;
  get numColumns(): number;
  get nextLinesToClear(): number[];
  getNeighbour(cell: ICell, dx: number, dy: number): ICell | undefined;
  removePlayer(player: IPlayer): void;
  reset(): void;
  step(isNetworkClient: boolean): void;
  checkLineClears(rows: number[]): void;
  clearLines(rows: number[]): void;
  resize(rows: number, cols: number, atRow: number, atColumn: number): void;
}
