import Cell from './cell/Cell';
import IGridEventListener from '../../../models/src/IGridEventListener';
import ICell from '@models/ICell';
import IGrid from '@models/IGrid';
import ICellBehaviour from '@models/ICellBehaviour';
import { CellType } from 'models';
import NormalCellBehaviour from './cell/behaviours/NormalCellBehaviour';

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
        row.push(new Cell(this, r, c));
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

    if (!rowsToClear.length) {
      return;
    }

    console.log('Clearing rows: ', rowsToClear);
    for (let i = 0; i < rowsToClear.length; i++) {
      for (let r = rowsToClear[i] + i; r >= 0; r--) {
        for (let c = 0; c < this._cells[0].length; c++) {
          if (r > 0) {
            if (this._cells[r][c].behaviour.isReplaceable) {
              if (this._cells[r - 1][c].behaviour.isReplaceable) {
                this._cells[r][c].replaceWith(this._cells[r - 1][c]);
              } else {
                this._cells[r][c].reset();
              }
            }
          } else {
            if (this._cells[r][c].behaviour.isReplaceable) {
              this._cells[r][c].reset();
            }
          }
        }
      }
      this._eventListeners.forEach((eventListener) =>
        eventListener.onLineCleared(rowsToClear[i] + i)
      );
    }
  }

  /**
   * @inheritdoc
   */
  onCellBehaviourChanged(cell: ICell, previousBehaviour: ICellBehaviour) {
    this._eventListeners.forEach((listener) =>
      listener.onCellBehaviourChanged(cell, previousBehaviour)
    );
  }
}
