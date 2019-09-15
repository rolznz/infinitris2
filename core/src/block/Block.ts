import Cell from "../grid/cell/Cell";
import Layout from "./layout/Layout";
import IBlockEventListener from "./IBlockEventListener";

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

    drop()
    {
        this._isDropping = true;
        this._lockTimer = 0;
        this._fallTimer = 0;
    }

    canFall(gridCells: Cell[][])
    {
        return this.canMove(gridCells, 0, 1, 0);
    }

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

    place()
    {
        this._cells.forEach(cell => cell.opacity += 1);
    }

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
        const rotatedLayout = this._rotateLayout(this._layout, rotation);
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

    private _rotateLayout(layout: Layout, rotation: number)
    {
        rotation = (rotation % 4 + 4) % 4;

        let prev = layout;
        for (let i = 0; i < rotation; i++)
        {
            const rotatedCells: number[][] = [];

            for (let row: number = 0; row < layout.length; ++row)
            {
                rotatedCells.push(new Array<number>(layout.length));

                for (let col: number = 0; col < layout.length; ++col)
                {
                    rotatedCells[row][col] = prev[layout.length - col - 1][row];
                }
            }
            prev = rotatedCells;
        }

        return prev;
    }
}