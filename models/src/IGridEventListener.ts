import IGrid from './IGrid';
import ICellEventListener from './ICellEventListener';

export default interface IGridEventListener extends ICellEventListener {
  /**
   * Triggered when a filled line on the grid is cleared
   *
   * @param row the index of the row that was cleared
   */
  onLineCleared(row: number): void;

  /**
   * Triggered when grid collapses cells to the lowest possible non-empty positions
   *
   * @param row the index of the row that was cleared
   */
  onGridCollapsed(grid: IGrid): void;
}
