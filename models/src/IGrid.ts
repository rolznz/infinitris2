import ICellEventListener from '@models/ICellEventListener';
import { IPlayer } from '@models/IPlayer';
import ICell, { NetworkCellInfo } from './ICell';

export type NetworkGridInfo = {
  readonly numRows: number;
  readonly numColumns: number;
  readonly reducedCells: NetworkCellInfo[];
};

export default interface IGrid extends ICellEventListener {
  isTower(row: number): boolean;
  isEmpty: boolean;
  reducedCells: ICell[];
  cells: ICell[][];
  numRows: number;
  numColumns: number;
  markCollapse(): void;
  executeCollapse(): void;
  markLineClears(rows: number[]): void;
  executeLineClears(rows: number[]): void;
  getNeighbour(cell: ICell, dx: number, dy: number): ICell | undefined;
  removePlayer(player: IPlayer): void;
  reset(): void;
}
