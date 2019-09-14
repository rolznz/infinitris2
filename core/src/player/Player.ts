import LoopCellEvent from "../block/Block";
import tetrominos from "../block/layout/Tetrominoes";
import Block from "../block/Block";
import IBlockEventListener from "../block/IBlockEventListener";
import Cell from "../grid/cell/Cell";

export default abstract class Player implements IBlockEventListener
{
    private _id: number;
    private _block: LoopCellEvent;
    private _lastPlacementColumn: number | undefined;
    private _eventListener: IBlockEventListener;

    constructor(id: number, eventListener: IBlockEventListener)
    {
        this._id = id;
        this._eventListener = eventListener;
    }

    get id(): number { return this._id; }
    get block(): LoopCellEvent { return this._block; }

    update(gridCells: Cell[][])
    {
        if (!this._block)
        {
            const layout = tetrominos[Math.floor(Math.random() * tetrominos.length)];
            const column = this._lastPlacementColumn === undefined ?
                Math.floor(gridCells[0].length / 2) : this._lastPlacementColumn;
            this._block = new Block(this._id, layout, column, gridCells, this);
        }
        else
        {
            this._block.update(gridCells);
        }
    }

    onBlockCreated = (block: Block) =>
    {
        this._eventListener.onBlockCreated(block);
    }
    onBlockMoved = (block: Block) =>
    {
        this._eventListener.onBlockMoved(block);
    }
    onBlockPlaced = (block: Block) =>
    {
        this._lastPlacementColumn = this._block.column;
        this._block = null;
        this._eventListener.onBlockPlaced(block);
    }
}