import Cell from './cell/Cell';
import IGridEventListener from '../../../models/src/IGridEventListener';
import ICell from '@models/ICell';
import IGrid from '@models/IGrid';

export default class Grid implements IGrid {
  private _cells: ICell[][];
  private _reducedCells: ICell[];
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
    this._reducedCells = ([] as ICell[]).concat(...this._cells);
  }

  get cells(): ICell[][] {
    return this._cells;
  }
  get reducedCells(): ICell[] {
    return this._reducedCells;
  }
  get numColumns(): number {
    return this._cells[0].length;
  }
  get numRows(): number {
    return this._cells.length;
  }

  get isEmpty(): boolean {
    return !this.reducedCells.some((cell) => !cell.isEmpty);
  }

  /**
   * Add one or more listeners to listen to events broadcasted by this grid.
   */
  addEventListener(...eventListeners: IGridEventListener[]) {
    this._eventListeners.push(...eventListeners);
  }

  step() {
    this._cells.forEach((row) =>
      row.forEach((cell) => cell.step(this.reducedCells))
    );
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
          this._cells[j][c].isEmpty =
            j > 0 ? this._cells[j - 1][c].isEmpty : true;
        }
      }
      this._eventListeners.forEach((eventListener) =>
        eventListener.onLineCleared(rowsToClear[i] + i)
      );
    }
  }
}
