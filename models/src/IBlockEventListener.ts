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
   * Triggered when a block is removed (either placed or died)
   *
   * @param block the block that was removed
   */
  onBlockRemoved(block: IBlock): void;

  /**
   * Triggered when a block moves or rotates
   *
   * @param block The block that moved
   * @param dx x/column change
   * @param dy y/row change
   * @param dr rotation change (1 point = 90 degrees)
   */
  onBlockMoved(block: IBlock, dx: number, dy: number, dr: number): void;

  /**
   * Triggered when a block drops
   *
   * @param block The block that moved
   */
  onBlockDropped(block: IBlock): void;

  /**
   * Triggered when a block dies (e.g. killed by laser)
   *
   * @param block The block that died
   */
  onBlockDied(block: IBlock): void;

  /**
   * Triggered when a block is removed from the grid (placed, died, or player removed from game)
   *
   * @param block The block that was destroyed
   */
  onBlockDestroyed(block: IBlock): void;
}
