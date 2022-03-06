import IGrid from './IGrid';
import ICellEventListener from './ICellEventListener';

export default interface IGridEventListener extends ICellEventListener {
  /**
   * Triggered when one or more grid lines are about to be cleared
   */
  onClearLines(rows: number[]): void;

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
}
