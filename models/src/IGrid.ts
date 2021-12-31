import { ICellEventListener } from './index';
import ICell from './ICell';

export default interface IGrid extends ICellEventListener {
  isTower(row: number): boolean;
  isEmpty: boolean;
  reducedCells: ICell[];
  cells: ICell[][];
  numRows: number;
  numColumns: number;
  checkLineClears(rows: number[]): void;
  getNeighbour(cell: ICell, dx: number, dy: number): ICell | undefined;
}
