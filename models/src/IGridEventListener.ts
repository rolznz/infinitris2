import { ICellEventListener } from '../index';

export default interface IGridEventListener extends ICellEventListener {
  /**
   * Triggered when a filled line on the grid is cleared
   *
   * @param row the index of the row that was cleared
   */
  onLineCleared(row: number): void;
}
