import IBlock from '@models/IBlock';
import IBlockEventListener from '@models/IBlockEventListener';
import ISimulationSettings from '@models/ISimulationSettings';
import Layout from '@models/Layout';
import LayoutUtils from './layout/LayoutUtils';
import ICell from '@models/ICell';

type LoopCellEvent = (cell?: ICell) => void;

export default class Block implements IBlock {
  private _playerId: number;
  private _color: number;
  private readonly _cells: ICell[];
  private _wrapIndex: number;
  private _column: number;
  private _row: number;
  private _rotation: number;
  private _layout: number[][];
  private _isDropping: boolean;
  private _fallTimer: number;
  private _lockTimer: number;
  private _eventListener?: IBlockEventListener;
  private _isAlive: boolean;
  private _cancelDrop: boolean;
  private _slowdownRows: number[];

  constructor(
    playerId: number,
    layout: Layout,
    row: number,
    column: number,
    rotation: number,
    gridCells: ICell[][],
    eventListener?: IBlockEventListener
  ) {
    this._color = 0x0000ff;
    this._playerId = playerId;
    this._wrapIndex = 0;
    this._column = column;
    this._row = row;
    this._rotation = rotation;
    this._layout = layout;
    this._isDropping = false;
    this._cancelDrop = false;
    this._eventListener = eventListener;
    this._cells = [];
    this._fallTimer = 0;
    this._lockTimer = 0;
    this._slowdownRows = [];
    this._isAlive = true;
    this._resetTimers();
    if (this.canMove(gridCells, 0, 0, 0)) {
      this._updateCells(gridCells);
    } else {
      this._isAlive = false;
      this._eventListener?.onBlockCreateFailed(this);
    }
    if (this._isAlive) {
      this._eventListener?.onBlockCreated(this);
    }
  }

  get playerId(): number {
    return this._playerId;
  }
  get row(): number {
    return this._row;
  }
  get column(): number {
    return this._column;
  }
  get color(): number {
    return this._color;
  }
  get cells(): ICell[] {
    return this._cells;
  }
  get isReadyToFall(): boolean {
    return this._fallTimer <= 0;
  }
  get isReadyToLock(): boolean {
    return this._lockTimer <= 0;
  }

  get isDropping(): boolean {
    return this._isDropping;
  }

  get isAlive(): boolean {
    return this._isAlive;
  }

  get wrapIndex(): number {
    return this._wrapIndex;
  }

  // TODO: rename numColumns
  get width(): number {
    // TODO: optimize
    const rotatedLayout = LayoutUtils.rotate(this._layout, this._rotation);
    return rotatedLayout[0].length;
  }

  // TODO: rename numColumns
  get height(): number {
    // TODO: optimize
    const rotatedLayout = LayoutUtils.rotate(this._layout, this._rotation);
    return rotatedLayout.length;
  }

  die() {
    this._isAlive = false;
    this._removeCells();
    this._eventListener?.onBlockDied(this);
  }

  /**
   * Mark a block as dropping.
   *
   * A dropping block is locked at its current rotation and column,
   * and will fall one row per frame. It will also lock immediately on contact
   * with the ground.
   */
  drop() {
    this._isDropping = true;
    this._lockTimer = 0;
    this._fallTimer = 0;
  }

  slowDown(row: number) {
    if (this._slowdownRows.indexOf(row) < 0) {
      this._slowdownRows.push(row);
    }
  }

  cancelDrop() {
    this._cancelDrop = true;
  }

  /**
   * Determines whether the block can move down one row.
   *
   * @param gridCells the cells of the grid.
   */
  canFall(gridCells: ICell[][]) {
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
  canMove(gridCells: ICell[][], dx: number, dy: number, dr: number): boolean {
    if (!this._isAlive) {
      return false;
    }
    let canMove: boolean = true;
    if (!this._isDropping || (dx === 0 && dr === 0)) {
      this._loopCells(
        gridCells,
        this._column + dx,
        this._row + dy,
        this._rotation + dr,
        (cell) => (canMove = Boolean(canMove && cell && cell.isPassable))
      );
    } else {
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
  move(
    gridCells: ICell[][],
    dx: number,
    dy: number,
    dr: number,
    force: boolean = false
  ): boolean {
    const canMove = force || this.canMove(gridCells, dx, dy, dr);
    if (canMove) {
      const gridNumColumns = gridCells[0].length;
      this._column += dx;
      const oldWrapIndex = this._wrapIndex;
      while (this._column > gridNumColumns) {
        this._column -= gridNumColumns;
        ++this._wrapIndex;
      }
      while (this._column < 0) {
        this._column += gridNumColumns;
        --this._wrapIndex;
      }
      if (oldWrapIndex !== this._wrapIndex) {
        this._eventListener?.onBlockWrapped(
          this,
          this._wrapIndex - oldWrapIndex
        );
      }

      this._row += dy;
      this._rotation += dr;
      this._updateCells(gridCells);
      this._resetTimers();
      this._eventListener?.onBlockMoved(this);
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
  fall(gridCells: ICell[][]): boolean {
    const fell = this.move(gridCells, 0, 1, 0);
    if (!fell) {
      this._lockTimer--;
    } else {
      this._resetTimers();
    }
    return fell;
  }

  /**
   * Places a block on the grid.
   *
   * The block's opacity will be transferred into the cells it currently occupies.
   */
  place() {
    this._cells.forEach((cell) => {
      cell.isEmpty = false;
      cell.removeBlock(this);
    });
    this._eventListener?.onBlockPlaced(this);
  }

  /**
   * Updates a block.
   *
   * Timers will be updated, triggering the block to fall or be placed if possible.
   */
  update(gridCells: ICell[][], simulationSettings: ISimulationSettings) {
    if (!this._isAlive) {
      return;
    }
    if (this._cancelDrop) {
      this._cancelDrop = false;
      this._isDropping = false;
      this._resetTimers();
    }

    if (simulationSettings.gravityEnabled) {
      --this._fallTimer;
    }

    let fell = false;
    if (this.isReadyToFall) {
      fell = this.fall(gridCells);
    }

    if (!fell && this.isReadyToLock) {
      this.place();
    }
  }

  private _removeCells() {
    this._cells.forEach((cell) => cell.removeBlock(this));
    this._cells.length = 0;
  }

  private _updateCells(gridCells: ICell[][]) {
    this._removeCells();
    this._loopCells(
      gridCells,
      this._column,
      this._row,
      this._rotation,
      this._addCell
    );
  }

  private _resetTimers() {
    this._fallTimer = this._isDropping ? this._slowdownRows.length * 3 : 90;
    this._lockTimer = this._isDropping ? this._slowdownRows.length * 3 : 45;
  }

  private _addCell = (cell?: ICell) => {
    if (!cell) {
      throw new Error('Cannot add an empty cell to a block');
    }
    this._cells.push(cell);
    cell.addBlock(this);
  };

  private _loopCells(
    gridCells: ICell[][],
    column: number,
    row: number,
    rotation: number,
    cellEvent: LoopCellEvent
  ) {
    const rotatedLayout = LayoutUtils.rotate(this._layout, rotation);
    const centreColumn = Math.floor(rotatedLayout[0].length / 2);

    for (let r = 0; r < rotatedLayout.length; r++) {
      for (let c = 0; c < rotatedLayout[0].length; c++) {
        if (!this._isAlive) {
          break;
        }
        if (rotatedLayout[r][c] === 1) {
          const cellRow = row + r;
          const numColumns = gridCells[0].length;
          const cellColumn =
            (((column + c - centreColumn) % numColumns) + numColumns) %
            numColumns;
          const gridCell =
            cellRow > -1 && cellRow < gridCells.length
              ? gridCells[cellRow][cellColumn]
              : undefined;
          cellEvent(gridCell);
        }
      }
    }
  }
}
