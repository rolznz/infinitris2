import IGrid from './IGrid';
import ICellEventListener from './ICellEventListener';

export default interface IGridEventListener extends ICellEventListener {
  /**
   * Triggered when a filled line on the grid is cleared
   */
  onLineCleared(row: number): void;

  /**
   * Triggered when grid collapses cells to the lowest possible non-empty positions
   */
  onGridCollapsed(grid: IGrid): void;

  /**
   * Triggered when grid has all cells reset to their default state
   */
  onGridReset(grid: IGrid): void;
}
