import Cell from './cell/Cell';
import IGridEventListener from '@models/IGridEventListener';
import ICell from '@models/ICell';
import IGrid from '@models/IGrid';
import ICellBehaviour from '@models/ICellBehaviour';
import { IPlayer } from '@models/IPlayer';

export default class Grid implements IGrid {
  private _cells: ICell[][];
  private _reducedCells: ICell[];
  private _eventListeners: IGridEventListener[];
  private _cachedNumNonEmptyCells = 0;

  constructor(numColumns: number = 10, numRows: number = 18) {
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

  removePlayer(player: IPlayer) {
    for (const cell of this._reducedCells) {
      if (cell.player === player) {
        cell.place(undefined);
      }
    }
  }

  step() {
    this._cells.forEach((row) => row.forEach((cell) => cell.step()));
    this._cachedNumNonEmptyCells = this._reducedCells.filter(
      (cell) => !cell.isEmpty
    ).length;
  }

  getNeighbour(cell: ICell, dx: number, dy: number): ICell | undefined {
    const nx =
      (((cell.column + dx) % this.numColumns) + this.numColumns) %
      this.numColumns;
    const ny = cell.row + dy;
    if (ny < 0 || ny > this.numRows - 1) {
      return undefined;
    }
    return this._cells[ny][nx];
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

    for (const row of rowsToClear) {
      for (let c = 0; c < this._cells[row].length; c++) {
        if (this._cells[row][c].player) {
          this._cells[row][c].player!.onLineClearCellReward(rowsToClear.length);
        }
      }
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

  reset() {
    for (let cell of this._reducedCells) {
      cell.reset();
    }
    this._eventListeners.forEach((listener) => listener.onGridReset(this));
  }

  collapse() {
    console.log('Collapse!');
    for (let r = this.numRows - 1; r > 0; r--) {
      for (let c = 0; c < this.numColumns; c++) {
        // TODO: handle non-replacable cells
        if (!this._cells[r][c].isEmpty) {
          continue;
        }
        for (let y = r - 1; y >= 0; y--) {
          if (!this._cells[y][c].isEmpty) {
            console.log(`Collapse ${y},${c} => ${r},${c}`);
            this._cells[r][c].replaceWith(this._cells[y][c]);
            this._cells[y][c].reset();
            break;
          }
        }
      }
    }
    // TODO: optimize
    this.checkLineClears([...Array(this.numRows)].map((_, i) => i));
    this._eventListeners.forEach((listener) => listener.onGridCollapsed(this));
  }

  /**
   * @inheritdoc
   */
  onCellBehaviourChanged(cell: ICell, previousBehaviour: ICellBehaviour) {
    this._eventListeners.forEach((listener) =>
      listener.onCellBehaviourChanged(cell, previousBehaviour)
    );
  }

  /**
   * @inheritdoc
   */
  onCellIsEmptyChanged(cell: ICell) {
    this._eventListeners.forEach((listener) =>
      listener.onCellIsEmptyChanged(cell)
    );
  }

  isTower(row: number): boolean {
    const numFilledRows = Math.ceil(
      this._cachedNumNonEmptyCells / this.numColumns
    );
    // first 4 rows must never be placeable (to ensure blocks can always be placed)
    return row < Math.max(this.numRows - numFilledRows - 4, 7);
  }
}
