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
  private _nextLinesToClear: number[];
  private _nextLineClearTime: number;

  constructor(
    numColumns: number = 60,
    numRows: number = 16,
    forceSeamless = true
  ) {
    if (forceSeamless) {
      numColumns = Math.max(Math.floor(numColumns / 4), 1) * 4; // force % 4 columns for seamless pattern wrap
    }
    this._cells = [];
    this._reducedCells = [];
    this._eventListeners = [];
    this.resize(numRows, numColumns);
    this._nextLineClearTime = 0;
    this._nextLinesToClear = [];
  }

  get cells(): ICell[][] {
    return this._cells;
  }
  get reducedCells(): ICell[] {
    return this._reducedCells;
  }
  get numColumns(): number {
    return this._cells[0]?.length || 0;
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

  step(isNetworkClient: boolean) {
    this._cells.forEach((row) => row.forEach((cell) => cell.step()));
    this._cachedNumNonEmptyCells = this._reducedCells.filter(
      (cell) => !cell.isEmpty
    ).length;

    if (
      !isNetworkClient &&
      this._nextLinesToClear.length &&
      Date.now() > this._nextLineClearTime
    ) {
      this.clearLines(this._nextLinesToClear);
    }
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
    const rowsToClear = rows.filter(
      (row) =>
        row >= 0 &&
        row < this._cells.length &&
        this._cells[row].findIndex((cell) => cell.isEmpty) < 0
    );
    if (!rowsToClear.length) {
      return;
    }
    for (let i = 0; i < rowsToClear.length; i++) {
      this._eventListeners.forEach((eventListener) =>
        eventListener.onLineClearing(rowsToClear[i])
      );
    }

    this._nextLinesToClear = [...this._nextLinesToClear, ...rowsToClear]
      .filter((row, i, rows) => rows.indexOf(row) === i) // get unique rows
      .sort((a, b) => b - a); // clear lowest row first
    this._nextLineClearTime = Date.now() + 1000;
  }

  clearLines(rowsToClear: number[]) {
    this._eventListeners.forEach((eventListener) =>
      eventListener.onClearLines(rowsToClear)
    );
    this._nextLinesToClear = [];
    for (const row of rowsToClear) {
      for (let c = 0; c < this._cells[row].length; c++) {
        if (this._cells[row][c].player) {
          this._cells[row][c].player!.onLineClearCellReward(rowsToClear.length);
        }
      }
    }

    //console.log('Clearing rows: ', rowsToClear);
    for (let i = 0; i < rowsToClear.length; i++) {
      const rowToClear = rowsToClear[i] + i;
      this._eventListeners.forEach((eventListener) =>
        eventListener.onLineClear(rowToClear)
      );
      for (let r = rowToClear; r >= 0; r--) {
        for (let c = 0; c < this._cells[0].length; c++) {
          if (r > 0) {
            if (this._cells[r][c].behaviour.isReplaceable) {
              if (this._cells[r - 1][c].behaviour.isReplaceable) {
                this._cells[r][c].replaceWith(this._cells[r - 1][c]);
              } else {
                this._cells[r][c].reset();
              }
            } else {
              this._cells[r][c].makeEmpty();
            }
          } else {
            if (this._cells[r][c].behaviour.isReplaceable) {
              this._cells[r][c].reset();
            } else {
              this._cells[r][c].makeEmpty();
            }
          }
        }
      }
    }
    this._eventListeners.forEach((eventListener) =>
      eventListener.onLinesCleared(rowsToClear)
    );
  }

  reset() {
    for (let cell of this._reducedCells) {
      cell.reset();
    }
    this._eventListeners.forEach((listener) => listener.onGridReset(this));
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

  resize(numRows: number, numColumns: number, atRow = 0, atColumn = 0): void {
    let originalNumRows = this.numRows;
    let originalNumColumns = this.numColumns;
    // addition
    for (let i = originalNumRows; i < numRows; i++) {
      const row: ICell[] = [];
      this._cells.splice(atRow, 0, row);
    }

    for (let i = originalNumColumns; i < numColumns; i++) {
      for (let r = 0; r < numRows; r++) {
        this._cells[r].splice(atColumn, 0, new Cell(this, 0, 0)); // will be fixed
      }
    }

    // deletion
    for (let i = 0; i < originalNumRows - numRows; i++) {
      this._cells.splice(Math.max(atRow - i, 0), 1);
    }
    for (let i = 0; i < originalNumColumns - numColumns; i++) {
      for (let r = 0; r < this.numRows; r++) {
        this._cells[r].splice(Math.max(atColumn - i, 0), 1);
      }
    }

    // fix cells
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numColumns; c++) {
        const cell = this._cells[r][c];
        if (cell?.row !== r || cell?.column !== c) {
          const newCell = new Cell(this, r, c);
          if (cell) {
            newCell.replaceWith(cell);
          }
          this._cells[r][c] = newCell;
        }
      }
    }

    this._reducedCells = ([] as ICell[]).concat(...this._cells);

    this._eventListeners.forEach((listener) => listener.onGridResize(this));
  }
}
