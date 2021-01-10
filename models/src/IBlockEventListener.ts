import IBlock from './IBlock';

export default interface IBlockEventListener {
  /**
   * Triggered when a block is first created
   *
   * @param block the block that was created
   */
  onBlockCreated(block: IBlock): void;

  /**
   * Triggered when a block failed to create (due to the grid not being clear)
   *
   * @param block the block that was created
   */
  onBlockCreateFailed(block: IBlock): void;

  /**
   * Triggered when a block is placed on the grid
   *
   * @param block the block that was placed
   */
  onBlockPlaced(block: IBlock): void;

  /**
   * Triggered when a block moves or rotates
   *
   * @param block The block that moved
   */
  onBlockMoved(block: IBlock): void;

  /**
   * Triggered when a block dies (e.g. killed by laser)
   *
   * @param block The block that died
   */
  onBlockDied(block: IBlock): void;

  /**
   * Triggered when a block wraps to the other side of the grid
   *
   * @param block The block that moved
   * @param wrapIndexChange the number of wraps that occurred (most likely -1 or 1)
   */
  onBlockWrapped(block: IBlock, wrapIndexChange: number): void;
}
