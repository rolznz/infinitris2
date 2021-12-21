import { ICellEventListener } from './index';
import ICell from './ICell';

export default interface IGrid extends ICellEventListener {
  isEmpty: boolean;
  reducedCells: ICell[];
  cells: ICell[][];
  numRows: number;
  numColumns: number;
  checkLineClears(rows: number[]): void;
  getNeighbour(cell: ICell, x: number, y: number): ICell | undefined;
}
