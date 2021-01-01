import Cell from './cell/Cell';
import CellType from '../../../models/src/CellType';
import IGridEventListener from '../../../models/src/IGridEventListener';
import ICell from '@models/ICell';

export default class Grid {
  private _cells: ICell[][];
  private _eventListeners: IGridEventListener[];

  constructor(numColumns: number = 20, numRows: number = 20) {
    this._cells = [];
    this._eventListeners = [];
    for (let r = 0; r < numRows; r++) {
      const row: ICell[] = [];
      for (let c = 0; c < numColumns; c++) {
        row.push(new Cell(c, r));
      }
      this._cells.push(row);
    }
  }

  get cells(): ICell[][] {
    return this._cells;
  }
  get reducedCells(): ICell[] {
    return ([] as ICell[]).concat(...this._cells);
  }
  get numColumns(): number {
    return this._cells[0].length;
  }
  get numRows(): number {
    return this._cells.length;
  }

  /**
   * Add one or more listeners to listen to events broadcasted by this grid.
   */
  addEventListener(...eventListeners: IGridEventListener[]) {
    this._eventListeners.push(...eventListeners);
  }

  step() {
    this._cells.forEach((row) => row.forEach((cell) => cell.step()));
  }

  /**
   * Check for and clear full rows.
   *
   * @param rows a list of rows affected by a change (e.g. block placement).
   */
  checkLineClears(rows: number[]) {
    const rowsToClear = rows
      .filter((row) => this._cells[row].findIndex((cell) => cell.isEmpty) < 0)
      .sort((a, b) => b - a); // clear lowest row first

    for (let i = 0; i < rowsToClear.length; i++) {
      for (let j = rowsToClear[i] + i; j >= 0; j--) {
        for (let c = 0; c < this._cells[0].length; c++) {
          this._cells[j][c].type =
            j > 0 ? this._cells[j - 1][c].type : CellType.Empty;
        }
      }
      this._eventListeners.forEach((eventListener) =>
        eventListener.onLineCleared(rowsToClear[i] + i)
      );
    }
  }
}
