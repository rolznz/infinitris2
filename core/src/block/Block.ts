import Cell from "../grid/cell/Cell";
import Layout from "./layout/Layout";
import IBlockEventListener from "./IBlockEventListener";
import LayoutUtils from "./layout/LayoutUtils";

type LoopCellEvent = (cell: Cell | undefined) => void;

export default class Block
{
    private _id: number;
    private _cells: Cell[];
    private _column: number;
    private _row: number;
    private _rotation: number;
    private _layout: number[][];
    private _isDropping: boolean;
    private _fallTimer: number;
    private _lockTimer: number;
    private _eventListener: IBlockEventListener;

    constructor(
        playerId: number,
        layout: Layout,
        column: number,
        gridCells: Cell[][],
        eventListener: IBlockEventListener)
    {
        this._id = playerId;
        this._column = column;
        this._row = 0;
        this._rotation = 0;
        this._layout = layout;
        this._isDropping = false;
        this._eventListener = eventListener;
        this._resetTimers();
        this._updateCells(gridCells);
        this._eventListener.onBlockCreated(this);
    }

    get id(): number { return this._id; }
    get row(): number { return this._row; }
    get column(): number { return this._column; }
    get cells(): Cell[] { return this._cells; }
    get isReadyToFall(): boolean { return this._fallTimer <= 0; }
    get isReadyToLock(): boolean { return this._lockTimer <= 0; }
    get opacity(): number { return 1; }

    /**
     * Mark a block as dropping.
     *
     * A dropping block is locked at its current rotation and column,
     * and will fall one row per frame. It will also lock immediately on contact
     * with the ground.
     */
    drop()
    {
        this._isDropping = true;
        this._lockTimer = 0;
        this._fallTimer = 0;
    }

    /**
     * Determines whether the block can move down one row.
     *
     * @param gridCells the cells of the grid.
     */
    canFall(gridCells: Cell[][])
    {
        return this.canMove(gridCells, 0, 1, 0);
    }

    /**
     * Determines whether the block can move to a new position.
     *
     * @param gridCells the cells of the grid.
     * @param dx the delta of the x position (column).
     * @param dy the delta of the x position (row).
     * @param dr the delta of the rotation.
     */
    canMove(gridCells: Cell[][], dx: number, dy: number, dr: number): boolean
    {
        let canMove: boolean = true;
        if (!this._isDropping || (dx === 0 && dr === 0))
        {
            this._loopCells(gridCells, this._column + dx, this._row + dy, this._rotation + dr,
                cell => canMove = canMove && cell && cell.isEmpty);
        }
        else
        {
            canMove = false;
        }
        return canMove;
    }

    /**
     * Attempts to move a block into a new position.
     *
     * @param gridCells the cells of the grid.
     * @param dx the delta of the x position (column).
     * @param dy the delta of the x position (row).
     * @param dr the delta of the rotation.
     * @param force force the block to move, even if the destination is occupied.
     *
     * @returns true if the block was moved.
     */
    move(gridCells: Cell[][], dx: number, dy: number, dr: number, force: boolean = false): boolean
    {
        const canMove = force || this.canMove(gridCells, dx, dy, dr);
        if (canMove)
        {
            this._column += dx;
            this._row += dy;
            this._rotation += dr;
            this._updateCells(gridCells);
            this._eventListener.onBlockMoved(this);
        }
        return canMove;
    }

    /**
     * Attempt to move the block down by a single row.
     *
     * If the block is obstructed, decrease its lock timer. Otherwise,
     * reset its movement timers.
     *
     * @param gridCells
     */
    fall(gridCells: Cell[][]): boolean
    {
        const fell = this.move(gridCells, 0, 1, 0);
        if (!fell)
        {
            this._lockTimer--;
        }
        else
        {
            this._resetTimers();
        }
        return fell;
    }

    /**
     * Places a block on the grid.
     *
     * The block's opacity will be transferred into the cells it currently occupies.
     */
    place()
    {
        this._cells.forEach(cell => cell.opacity += 1);
    }

    /**
     * Updates a block.
     *
     * Timers will be updated, triggering the block to fall or be placed if possible.
     */
    update(gridCells: Cell[][])
    {
        --this._fallTimer;

        let fell = false;
        if (this.isReadyToFall)
        {
            fell = this.fall(gridCells);
        }

        if (!fell && this.isReadyToLock)
        {
            this.place();
            this._eventListener.onBlockPlaced(this);
        }
    }

    private _updateCells(gridCells: Cell[][])
    {
        this._cells = [];
        this._loopCells(gridCells, this._column, this._row, this._rotation, this._addCell);
    }

    private _resetTimers()
    {
        this._fallTimer = this._isDropping ? 0 : 30;
        this._lockTimer = this._isDropping ? 0 : 30;
    }

    private _addCell = (cell: Cell | null) =>
    {
        if (!cell)
        {
            throw new Error("Cannot add an empty cell to a block");
        }
        this._cells.push(cell);
    }

    private _loopCells(gridCells: Cell[][], column: number, row: number, rotation: number, cellEvent: LoopCellEvent)
    {
        const rotatedLayout = LayoutUtils.rotate(this._layout, rotation);
        const centreColumn = Math.floor(rotatedLayout[0].length / 2);

        for (let r = 0; r < rotatedLayout.length; r++)
        {
            for (let c = 0; c < rotatedLayout[0].length; c++)
            {
                if (rotatedLayout[r][c] === 1)
                {
                    const cellRow = row + r;
                    const numColumns = gridCells[0].length;
                    const cellColumn = (((column + c - centreColumn) % numColumns + numColumns) % numColumns);
                    const gridCell: Cell | null = cellRow > -1 && cellRow < gridCells.length ?
                        gridCells[cellRow][cellColumn] : null;
                    cellEvent(gridCell);
                }
            }
        }
    }
}