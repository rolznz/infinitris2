import IBlock from '@models/IBlock';
import IBlockEventListener from '@models/IBlockEventListener';
import { SimulationSettings } from '@models/SimulationSettings';
import Layout from '@models/Layout';
import LayoutUtils from './layout/LayoutUtils';
import ICell from '@models/ICell';
import IPlayer from '@models/IPlayer';
import NormalCellBehaviour from '@core/grid/cell/behaviours/NormalCellBehaviour';

type LoopCellEvent = (cell?: ICell) => void;

export default class Block implements IBlock {
  private _player: IPlayer;
  private readonly _cells: ICell[];
  //private _wrapIndex: number;
  private _column: number;
  private _row: number;
  private _rotation: number;
  private _initialLayout: Layout;
  private _layout: Layout;
  private _isDropping: boolean;
  private _fallTimer: number;
  private _lockTimer: number;
  private _eventListener?: IBlockEventListener;
  private _isAlive: boolean;
  private _cancelDrop: boolean;
  private _slowdownRows: number[];
  private _gridCells: ICell[][];

  constructor(
    player: IPlayer,
    layout: Layout,
    row: number,
    column: number,
    rotation: number,
    gridCells: ICell[][],
    eventListener?: IBlockEventListener
  ) {
    this._player = player;
    //this._wrapIndex = 0;
    this._column = column;
    this._row = row;
    this._rotation = rotation;
    this._initialLayout = layout;
    this._layout = layout;
    this._isDropping = false;
    this._cancelDrop = false;
    this._eventListener = eventListener;
    this._cells = [];
    this._fallTimer = 0;
    this._lockTimer = 0;
    this._slowdownRows = [];
    this._isAlive = true;
    this._gridCells = gridCells;
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

  get player(): IPlayer {
    return this._player;
  }
  get row(): number {
    return this._row;
  }
  get column(): number {
    return this._column;
  }
  get centreX(): number {
    // TODO: optimize
    let firstFilledColumn = this._layout[0].length;
    let lastFilledColumn = 0;
    for (let row = 0; row < this._layout.length; row++) {
      for (let column = 0; column < this._layout[0].length; column++) {
        if (this._layout[row][column] === 1) {
          firstFilledColumn = Math.min(firstFilledColumn, column);
          lastFilledColumn = Math.max(lastFilledColumn, column);
        }
      }
    }
    return (
      this._column +
      firstFilledColumn +
      (lastFilledColumn + 1 - firstFilledColumn) * 0.5 -
      Math.floor(this._layout[0].length / 2) // all block cells are centered horizontally - see _loopCells
    );
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

  get initialLayout(): Layout {
    return this._initialLayout;
  }
  get layout(): Layout {
    return this._layout;
  }

  /*get wrapIndex(): number {
    return this._wrapIndex;
  }*/

  // TODO: rename numColumns
  get width(): number {
    return this._layout[0].length;
  }

  // TODO: rename numColumns
  get height(): number {
    return this._layout.length;
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
      const newCells: ICell[] = [];
      this._loopCells(
        gridCells,
        this._column + dx,
        this._row + dy,
        this._rotation + dr,
        (cell) => {
          if (cell) {
            newCells.push(cell);
          }
          canMove = Boolean(canMove && cell && cell.isPassable);
        }
      );

      // if attempting to rotate but the result is a non-rotation movement in any direction (up to 2 cells), return false
      if (dr !== 0) {
        const gridNumColumns = gridCells[0].length;
        for (let x = -2; x <= 2; x++) {
          for (let y = -2; y <= 2; y++) {
            if (
              newCells.findIndex(
                (newCell) =>
                  this._cells.findIndex(
                    (currentCell) =>
                      (((currentCell.column + x) % gridNumColumns) +
                        gridNumColumns) %
                        gridNumColumns ===
                        newCell.column && currentCell.row + y === newCell.row
                  ) < 0
              ) < 0
            ) {
              canMove = false;
            }
          }
        }
      }
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
    const maxAttempts = dr !== 0 ? 44 : 1;
    let canMove = false;
    for (let i = 0; i < maxAttempts; i++) {
      let drClamped = dr !== 0 ? (((dr + i * dr) % 4) + 4) % 4 : 0;
      if (dr !== 0) {
        // order to prioritize downward rotation:
        // cycle 0 iteration 0-3: dx=0, dy=0
        // cycle 1 iteration 4-7: dx=dr, dy=0
        // cycle 2 iteration 8-11: dx=-dr, dy=0
        // cycle 3 iteration 12-15: dx=0, dy=1
        // cycle 4 iteration 16-19: dy=dr, dy=1
        // cycle 5 iteration 20-23: dy=-dr, dy=1
        // cycle 6 iteration 24-27: dx=0, dy=2
        // cycle 7 iteration 28-31: dy=dr, dy=2
        // cycle 8 iteration 32-35: dy=-dr, dy=2
        // cycle 9 iteration 36-39: dy=0, dy=-1 - special case, allow Z/T blocks to rotate on a flat surface
        // cycle 10 iteration 40-43: dy=0, dy=-2 - special case, allow I blocks to rotate on a flat surface

        const attemptCycles = Math.floor(i / 4);
        dx =
          attemptCycles === 1 || attemptCycles === 4 || attemptCycles === 7
            ? dr
            : attemptCycles === 2 || attemptCycles === 5 || attemptCycles === 8
            ? -dr
            : 0;
        dy =
          attemptCycles === 10
            ? -2
            : attemptCycles === 9
            ? -1
            : attemptCycles > 5
            ? 2
            : attemptCycles > 2
            ? 1
            : 0;
      }
      // don't allow movement without rotation and 180 degree rotations
      // Note: has additional check in canMove to ensure rotation does not result in a simple movement
      // (e.g. for 180 degree rotation with up/down movement on an I block)
      if ((drClamped === 0 || (drClamped === 2 && dy === 0)) && dr !== 0) {
        continue;
      }
      canMove = force || this.canMove(gridCells, dx, dy, drClamped);
      if (canMove) {
        //const gridNumColumns = gridCells[0].length;
        this._column += dx;
        /*const oldWrapIndex = this._wrapIndex;
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
        }*/

        this._row += dy;
        this._rotation += drClamped;
        this._updateCells(gridCells);
        if (drClamped !== 0) {
          this._layout = LayoutUtils.rotate(
            this._initialLayout,
            this._rotation
          );
        }
        this._resetTimers();
        this._eventListener?.onBlockMoved(this);
        break;
      }
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
      cell.behaviour = new NormalCellBehaviour(this._player.color);
    });
    this._eventListener?.onBlockPlaced(this);
  }

  /**
   * Updates a block.
   *
   * Timers will be updated, triggering the block to fall or be placed if possible.
   */
  update(gridCells: ICell[][], simulationSettings: SimulationSettings) {
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
    const rotatedLayout = LayoutUtils.rotate(this._initialLayout, rotation);
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
