import Cell from "./cell/Cell";
import IGridEventListener from "./IGridEventListener";

export default class Grid
{
    private _cells: Cell[][];
    private _eventListener: IGridEventListener;

    constructor(
        numColumns: number = 20,
        numRows: number = 20,
        eventListener: IGridEventListener)
    {
        this._eventListener = eventListener;
        this._cells = [];
        for (let r = 0; r < numRows; r++)
        {
            const row: Cell[] = [];
            for (let c = 0; c < numColumns; c++)
            {
                row.push(new Cell(c, r));
            }
            this._cells.push(row);
        }
    }

    get cells(): Cell[][] { return this._cells; }
    get numColumns(): number { return this._cells[0].length; }
    get numRows(): number { return this._cells.length; }

    checkLineClears(rows: number[])
    {
        const rowsToClear = rows
            .filter(row => this._cells[row].findIndex(cell => cell.isEmpty) < 0)
            .sort((a, b) => b - a); // clear lowest row first
        
        for (let i = 0; i < rowsToClear.length; i++)
        {
            for (let j = rowsToClear[i] + i; j >= 0; j--)
            {
                for (let c = 0; c < this._cells[0].length; c++)
                {
                    this._cells[j][c].opacity = j > 0 ? this._cells[j - 1][c].opacity : 0;
                }
            }
            this._eventListener.onLineCleared(rowsToClear[i] + i);
        }
    }
}