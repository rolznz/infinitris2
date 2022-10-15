import Cell from './cell/Cell';
import IGridEventListener from '@models/IGridEventListener';
import ICell from '@models/ICell';
import IGrid, { PartialClearRow } from '@models/IGrid';
import ICellBehaviour from '@models/ICellBehaviour';
import { IPlayer } from '@models/IPlayer';
import { KeyedRandom } from '@core/simulation/KeyedRandom';
import { IDEAL_FPS } from '@core/simulation/simulationConstants';
import CellType from '@models/CellType';
import { wrap, wrappedDistance } from '@core/utils/wrap';

export const MAX_COLUMNS = 100000;
export const MAX_ROWS = 100000;

export default class Grid implements IGrid {
  private _cells: ICell[][];
  private _reducedCells: ICell[];
  private _eventListeners: IGridEventListener[];
  private _cachedNumNonEmptyCells = 0;
  private _nextLinesToClear: number[];
  private _nextPartialClears: PartialClearRow[];
  private _nextLineClearFrame: number;
  private _random: KeyedRandom;
  private _frameNumber: number;

  constructor(
    numColumns: number = 60,
    numRows: number = 16,
    forceSeamless = true
  ) {
    numColumns = Math.min(numColumns, MAX_COLUMNS);
    numRows = Math.min(numRows, MAX_ROWS);
    if (forceSeamless) {
      numColumns = Math.max(Math.floor(numColumns / 4), 1) * 4; // force % 4 columns for seamless pattern wrap
    }
    this._frameNumber = 0;
    this._cells = [];
    this._reducedCells = [];
    this._eventListeners = [];
    this.resize(numRows, numColumns);
    this._nextLineClearFrame = 0;
    this._nextLinesToClear = [];
    this._nextPartialClears = [];
    this._random = new KeyedRandom(0);
  }

  get nextPartialClears(): PartialClearRow[] {
    return this._nextPartialClears;
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

  get nextLinesToClear(): number[] {
    return this._nextLinesToClear;
  }

  get isEmpty(): boolean {
    return !this.reducedCells.some((cell) => !cell.isEmpty);
  }

  get frameNumber(): number {
    return this._frameNumber;
  }

  setRandom(random: KeyedRandom) {
    this._random = random;
  }

  nextRandom(key: string): number {
    return this._random.next(key);
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

  step(isNetworkClient: boolean, frameNumber: number) {
    this._frameNumber = frameNumber;
    this._cells.forEach((row) => row.forEach((cell) => cell.step()));
    this._cachedNumNonEmptyCells = this._reducedCells.filter(
      (cell) => !cell.isEmpty
    ).length;

    if (
      !isNetworkClient &&
      this._nextLinesToClear.length &&
      this._frameNumber > this._nextLineClearFrame
    ) {
      this.clearLines(this._nextLinesToClear, this._nextPartialClears);
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
    const partialClearRows: PartialClearRow[] = [];
    const rowsToClear = rows.filter(
      (row) =>
        row >= 0 &&
        row < this._cells.length &&
        (!this._cells[row].some((cell) => cell.isEmpty) ||
          this._checkPartialClear(row, partialClearRows))
    );
    if (!rowsToClear.length) {
      return;
    }

    this._nextLinesToClear = [...this._nextLinesToClear, ...rowsToClear]
      .filter((row, i, rows) => rows.indexOf(row) === i) // get unique rows
      .sort((a, b) => b - a); // clear row closest to the ground first

    this._nextPartialClears = [...this._nextPartialClears, ...partialClearRows];
    this._nextLineClearFrame = this._frameNumber + IDEAL_FPS;

    for (let i = 0; i < rowsToClear.length; i++) {
      this._eventListeners.forEach((eventListener) =>
        eventListener.onLineClearing(rowsToClear[i])
      );
    }
  }

  private _checkPartialClear(
    row: number,
    partialClearRows: PartialClearRow[]
  ): boolean {
    const partialClearCells = this._cells[row].filter(
      (cell) => cell.type === CellType.PartialClear
    );
    for (let i = 0; i < partialClearCells.length - 1; i++) {
      let direction =
        wrappedDistance(
          partialClearCells[0].column,
          partialClearCells[1].column,
          this.numColumns
        ) <=
        this.numColumns / 2
          ? 1
          : -1;
      let partial = true;
      const columns: number[] = [];
      for (
        let j = partialClearCells[0].column + direction;
        j !== partialClearCells[1].column;
        j = wrap(j + direction, this.numColumns)
      ) {
        if (this._cells[row][j].isEmpty) {
          partial = false;
          break;
        }
        columns.push(j);
      }
      if (partial) {
        partialClearRows.push({ row, columns });
        return true;
      }
    }
    return false;
  }

  clearLines(rowsToClear: number[], partialClears: PartialClearRow[]) {
    this._eventListeners.forEach((eventListener) =>
      eventListener.onClearLines(rowsToClear, partialClears)
    );
    this._nextLinesToClear = [];
    this._nextPartialClears = [];
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
      let partialClearsForRow = partialClears.filter(
        (clear) => clear.row === rowToClear
      );
      for (let r = rowToClear; r >= 0; r--) {
        for (let c = 0; c < this._cells[0].length; c++) {
          if (
            partialClearsForRow.length &&
            !partialClearsForRow.some(
              (partialClear) => partialClear.columns.indexOf(c) >= 0
            )
          ) {
            continue;
          }
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
