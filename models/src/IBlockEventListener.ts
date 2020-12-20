import IBlock from './IBlock';

export default interface IBlockEventListener {
  /**
   * Triggered when a block is first created
   *
   * @param block the block that was created
   */
  onBlockCreated(block: IBlock): void;

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
}
