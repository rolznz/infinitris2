import Block from "./Block";

export default interface IBlockEventListener
{
    onBlockCreated(block: Block);

    onBlockPlaced(block: Block);

    /**
     * Triggered when a block moves or rotates.
     *
     * @param block The block that moved.
     */
    onBlockMoved(block: Block);
}