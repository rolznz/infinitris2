export default interface IGridEventListener {
  /**
   * Triggered when a filled line on the grid is cleared
   *
   * @param row the index of the row that was cleared
   */
  onLineCleared(row: number);
}
