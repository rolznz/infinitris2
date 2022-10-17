import IGrid, { PartialClearRow } from './IGrid';
import ICellEventListener from './ICellEventListener';

export default interface IGridEventListener extends ICellEventListener {
  /**
   * Triggered when one or more grid lines are about to be cleared
   */
  onClearLines(rows: number[], partialClears: PartialClearRow[]): void;

  /**
   * Triggered when one or more grid lines have been cleared
   */
  onLinesCleared(rows: number[]): void;

  /**
   * Triggered when a filled line on the grid is waiting to be cleared
   */
  onLineClearing(row: number): void;

  /**
   * Triggered when a filled line on the grid is cleared
   */
  onLineClear(row: number): void;

  /**
   * Triggered when grid has all cells reset to their default state
   */
  onGridReset(grid: IGrid): void;

  /**
   * Triggered when the number of rows or columns in the grid changes
   */
  onGridResize(grid: IGrid): void;

  /**
   * (Escape game mode) finish reached and we no longer want to show line clears
   * since the cells have been reset
   *
   * TODO: this should be detected when a cell in a line clear is reset, so it can be used in other game modes
   */
  onGridAbortLineClears(grid: IGrid): void;
}
