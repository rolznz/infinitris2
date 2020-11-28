import Block from './Block';

export default interface IBlockEventListener {
  /**
   * Triggered when a block is first created
   *
   * @param block the block that was created
   */
  onBlockCreated(block: Block);

  /**
   * Triggered when a block is placed on the grid
   *
   * @param block the block that was placed
   */
  onBlockPlaced(block: Block);

  /**
   * Triggered when a block moves or rotates
   *
   * @param block The block that moved
   */
  onBlockMoved(block: Block);
}
