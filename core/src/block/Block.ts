import IBlock, { BlockCanMoveOptions } from '@models/IBlock';
import IBlockEventListener from '@models/IBlockEventListener';
import { SimulationSettings } from '@models/SimulationSettings';
import Layout from '@models/Layout';
import LayoutUtils from './layout/LayoutUtils';
import ICell from '@models/ICell';
import { IPlayer } from '@models/IPlayer';
import NormalCellBehaviour from '@core/grid/cell/behaviours/NormalCellBehaviour';
import { checkMistake } from './checkMistake';
import ISimulation from '@models/ISimulation';
import { wrap } from '@core/utils/wrap';
import { MovementAttempt } from '@models/IRotationSystem';

type LoopCellEvent = (
  cell: ICell | undefined,
  row: number,
  column: number
) => void;

export const INITIAL_FALL_DELAY = 90;

export default class Block implements IBlock {
  private _player: IPlayer;
  private readonly _cells: ICell[];
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
  private _slowdownAmount: number;
  private _simulation: ISimulation;
  private _layoutId: number;
  private _id: number;
  private _hadPlacementAtSpawn: boolean;
  private _wasPlaced: boolean;

  constructor(
    id: number,
    player: IPlayer,
    layoutId: number,
    layout: Layout,
    row: number,
    column: number,
    rotation: number,
    simulation: ISimulation,
    eventListener?: IBlockEventListener,
    force = false,
    checkPlacement = true
  ) {
    this._id = id;
    this._player = player;
    this._column = column;
    this._row = row;
    this._rotation = rotation;
    this._initialLayout = layout;
    this._layout = layout;
    this._layoutId = layoutId;
    this._isDropping = false;
    this._cancelDrop = false;
    this._eventListener = eventListener;
    this._cells = [];
    this._fallTimer = 0;
    this._lockTimer = 0;
    this._slowdownAmount = 0;
    this._isAlive = true;
    this._simulation = simulation;
    this._resetTimers();

    if (!force) {
      // spawn as high as possible, for layouts that have blank rows (like the long tetromino)
      for (let i = 0; i < this._layout.length; i++) {
        if (this._layout[i].some((column) => column !== 0)) {
          break;
        }
        --this._row;
      }
      if (this._simulation.gameMode.allowsSpawnAboveGrid?.()) {
        while (!this.canMove(0, 0, 0)) {
          --this._row;
        }
      }
    }

    let otherBlockInArea = false;
    if (!force && this._simulation.settings.allowSpawnOnOtherBlocks === false) {
      this._loopCells(
        this._simulation.grid.cells,
        this._column,
        this._row,
        this._rotation,
        (cell) => {
          if (cell && cell.blocks.length) {
            otherBlockInArea = true;
          }
        }
      );
    }
    let spawnPositionFree = force || this.canMove(0, 0, 0);
    let hasPlacement =
      force ||
      //hasSpawnLocationCell ||
      this._simulation.settings.replaceUnplayableBlocks === false ||
      !checkPlacement;

    if (checkPlacement && !hasPlacement) {
      hasPlacement = this.hasPlacement();
      this._hadPlacementAtSpawn = hasPlacement;
    } else {
      this._hadPlacementAtSpawn = false;
    }

    if (force || (!otherBlockInArea && spawnPositionFree && hasPlacement)) {
      this._updateCells();
    } else {
      this._isAlive = false;
      // this is problematic because player attempts to create block for each layout
      // onBlockCreateFailed is now handled at the player level
      //this._eventListener?.onBlockCreateFailed(this);
    }
  }

  get hadPlacementAtSpawn(): boolean {
    return this._hadPlacementAtSpawn;
  }

  get id(): number {
    return this._id;
  }

  get layoutId(): number {
    return this._layoutId;
  }

  get player(): IPlayer {
    return this._player;
  }
  get row(): number {
    return this._row;
  }
  get topRow(): number {
    let topRow = 9999;
    for (const cell of this._cells) {
      topRow = Math.min(topRow, cell.row);
    }
    return topRow;
  }
  get bottomRow(): number {
    let bottomRow = 0;
    for (const cell of this._cells) {
      bottomRow = Math.max(bottomRow, cell.row);
    }
    return bottomRow;
  }
  get column(): number {
    return this._column;
  }
  get rotation(): number {
    return this._rotation;
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

  // TODO: rename numColumns
  get width(): number {
    let maxWidth = 0;
    for (let r = 0; r < this._layout.length; r++) {
      let rowWidth = 0;
      for (let c = 0; c < this._layout[0].length; c++) {
        if (this._layout[r][c]) {
          ++rowWidth;
        }
      }
      maxWidth = Math.max(maxWidth, rowWidth);
    }
    return maxWidth;
  }

  // TODO: rename numRows
  get height(): number {
    return this._layout.length;
  }

  get wasPlaced(): boolean {
    return this._wasPlaced;
  }

  die() {
    this._isAlive = false;
    this._eventListener?.onBlockDied(this);
    this.destroy();
  }

  destroy() {
    this._isAlive = false;
    this._removeCells(this._cells.slice());
    this._eventListener?.onBlockDestroyed(this);
  }

  /**
   * Mark a block as dropping.
   *
   * A dropping block is locked at its current rotation and column,
   * and will fall one row per frame. It will also lock immediately on contact
   * with the ground.
   */
  drop() {
    if (this._isDropping) {
      return;
    }
    this._isDropping = true;
    this._lockTimer = 0;
    this._fallTimer = 0;
    this._eventListener?.onBlockDropped(this);
  }

  slowDown() {
    this._slowdownAmount++;
  }

  cancelDrop() {
    this._cancelDrop = true;
  }

  /**
   * Determines whether the block can move down one row.
   *
   */
  canFall() {
    return this.canMove(0, 1, 0);
  }

  /**
   * Returns the lowest possible placement cells
   */
  getPlacementCells() {
    let cells = this._cells;
    let options: BlockCanMoveOptions = {
      allowMistakes: false,
    };
    for (let y = 0; ; y++) {
      if (!this.canMove(0, y, 0, options) || !options.cells) {
        return cells;
      }
      cells = options.cells;
    }
  }

  /**
   * Determines whether the block can move to a new position.
   *
   * @param dx the delta of the x position (column).
   * @param dy the delta of the y position (row).
   * @param dr the delta of the rotation.
   */
  canMove(
    dx: number,
    dy: number,
    dr: number,
    options?: BlockCanMoveOptions
  ): boolean {
    if (!this._isAlive) {
      return false;
    }
    let canMove: boolean = true;
    if (!this._isDropping || (dx === 0 && dr === 0)) {
      const newCells: ICell[] = [];
      this._loopCells(
        this._simulation.grid.cells,
        this._column + dx,
        this._row + dy,
        this._rotation + dr,
        (cell, cellRow, _cellColumn) => {
          if (cell) {
            newCells.push(cell);
          }
          canMove =
            canMove &&
            (Boolean(cell && cell.isPassable) ||
              (!cell && cellRow < 0) ||
              Boolean(this._isDropping && cell?.isPassableWhileDropping) ||
              Boolean(
                this._isDropping &&
                  options?.isForgiving &&
                  cell &&
                  cell.player !== this._player &&
                  this._simulation.wasRecentlyPlaced(cell.placementFrame)
              ));
        }
      );

      if (options) {
        options.cells = newCells;
      }
      if (canMove && options && !options.allowMistakes) {
        options.isMistake = checkMistake(
          this._player,
          newCells,
          this._simulation,
          options.allowTowers
        );
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
   * @param rotateDown prioritize downward movement when rotating
   * @param isForgiving if true, allow the block to pass through recently placed cells
   *
   * @returns true if the block was moved.
   */
  move(
    dx: number,
    dy: number,
    dr: number,
    force: boolean = false,
    rotateDown: boolean = false,
    isForgiving: boolean = false
  ): boolean {
    // force downward rotations when above the grid (e.g. long block on spawn), otherwise can't rotate
    /*if (!force && this._row < 0) {
      rotateDown = true;
    }*/
    const attempts: MovementAttempt[] =
      !force && !this.isDropping && dr !== 0
        ? this._simulation.rotationSystem.getAttempts(dx, dy, dr, rotateDown)
        : [{ dx, dy, dr }];

    let canMove = false;
    for (let i = 0; i < attempts.length; i++) {
      canMove =
        force ||
        this.canMove(attempts[i].dx, attempts[i].dy, attempts[i].dr, {
          allowMistakes: true,
          isForgiving,
        });
      if (canMove) {
        this._column += attempts[i].dx;
        this._row += attempts[i].dy;
        this._rotation += attempts[i].dr;
        this._updateCells();
        if (attempts[i].dr !== 0) {
          this._layout = LayoutUtils.rotate(
            this._initialLayout,
            this._rotation
          );
        }
        if (attempts[i].dy > 0) {
          this._resetFallTimer();
        }
        this._resetLockTimer();
        this._eventListener?.onBlockMoved(
          this,
          attempts[i].dx,
          attempts[i].dy,
          attempts[i].dr
        );
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
   * @param isForgiving if true, allow the block to pass through recently placed cells
   */
  fall(isForgiving = false): boolean {
    const fell = this.move(0, 1, 0, undefined, undefined, isForgiving);
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
    //console.log('Placing block for player ' + this.player.id);
    this._cells.forEach((cell) => {
      cell.place(this._player);
    });
    this._eventListener?.onBlockPlaced(this);
    this._wasPlaced = true;
  }

  /**
   * Updates a block.
   *
   * Timers will be updated, triggering the block to fall or be placed if possible.
   */
  update() {
    if (!this._isAlive) {
      return;
    }
    if (this._cancelDrop) {
      this._cancelDrop = false;
      this._isDropping = false;
      this._resetTimers();
    }

    if (this._simulation.settings.gravityEnabled) {
      --this._fallTimer;
    }

    while (true) {
      let fell = false;
      if (this.isReadyToFall) {
        fell = this.fall();
      }
      if (!this._isAlive) {
        break;
      }
      let removed = false;
      if (!this._simulation.isNetworkClient && !fell && this.isReadyToLock) {
        const isMistake =
          this._simulation.settings.mistakeDetection !== false &&
          checkMistake(this._player, this._cells, this._simulation);

        if (!isMistake) {
          while (
            this._simulation.settings.preventTowers !== false &&
            this._simulation.isTower(this.topRow)
          ) {
            this.move(0, 1, 0, true);
          }
        }
        if (isMistake && this._isDropping) {
          // try forgiving placement - can overwrite any cells that were placed in the last X ms
          fell = this.fall(true);
        }
        if (!fell) {
          if (isMistake) {
            this.die();
          } else {
            this.place();
          }
          removed = true;
        }
      }
      const slowDown = this._slowdownAmount > 0;
      if (slowDown) {
        this._slowdownAmount -= 0.1;
      }
      if (
        slowDown ||
        !fell ||
        removed ||
        !this.isDropping ||
        !this._simulation.settings.instantDrops
      ) {
        break;
      }
    }
  }

  private _removeCells(cells: ICell[]) {
    for (const cell of cells) {
      const index = this._cells.indexOf(cell);
      if (index < 0) {
        throw new Error(
          'Cell does not exist in block: ' + cell.row + ',' + cell.column
        );
      }
      cell.removeBlock(this);
      this._cells.splice(index, 1);
    }
  }

  private _updateCells() {
    const newCells: ICell[] = [];
    const addCell = (cell: ICell | undefined) => {
      if (cell) {
        newCells.push(cell);
      }
    };

    this._loopCells(
      this._simulation.grid.cells,
      this._column,
      this._row,
      this._rotation,
      addCell
    );
    this._removeCells(this._cells.filter((cell) => newCells.indexOf(cell) < 0));
    this._addCells(newCells.filter((cell) => this._cells.indexOf(cell) < 0));
  }

  private _resetTimers() {
    this._resetFallTimer();
    this._resetLockTimer();
  }

  private _resetFallTimer() {
    this._fallTimer = this._isDropping
      ? this._slowdownAmount * 3
      : Math.max(
          this._simulation.gameMode.getFallDelay?.(this._player) ??
            INITIAL_FALL_DELAY,
          1
        );
  }

  private _resetLockTimer() {
    this._lockTimer = this._isDropping ? this._slowdownAmount * 3 : 45;
  }

  private _addCells = (cells: ICell[]) => {
    for (const cell of cells) {
      if (!cell) {
        throw new Error('Cannot add an undefined cell to a block');
      }
      if (this._cells.indexOf(cell) > -1) {
        throw new Error('Cannot add cell to block twice');
      }
      this._cells.push(cell);
      cell.addBlock(this);
    }
  };

  private _loopCells(
    gridCells: ICell[][],
    column: number,
    row: number,
    rotation: number,
    cellEvent: LoopCellEvent
  ) {
    const rotatedLayout = LayoutUtils.rotate(this._initialLayout, rotation);
    const centreColumn = Math.floor(rotatedLayout.length / 2);

    for (let r = 0; r < rotatedLayout.length; r++) {
      for (let c = 0; c < rotatedLayout.length; c++) {
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
          cellEvent(gridCell, cellRow, cellColumn);
        }
      }
    }
  }

  /**
   * This function is not intended to be perfect - it does not do any pathfinding nor understand different cell types
   * to know if a block is placable or not.
   */
  hasPlacement() {
    const canMoveOptions: BlockCanMoveOptions = {
      allowMistakes: false,
      allowTowers: false,
    };

    for (let dr = 0; dr < 4; dr++) {
      for (let dx = 0; dx < this._simulation.grid.numColumns; dx++) {
        for (let dy = -this._row; dy < this._simulation.grid.numRows; dy++) {
          const canMove = this.canMove(dx, dy, dr, canMoveOptions);
          if (
            canMove &&
            !canMoveOptions.isMistake &&
            canMoveOptions.cells &&
            canMoveOptions.cells.some(
              (cell) =>
                cell.row === this._simulation.grid.numRows - 1 ||
                !this._simulation.grid.cells[cell.row + 1][cell.column]
                  .isPassable
            ) // &&
            //(!avoidTopRows ||
            //!canMoveOptions.cells.some((cell) => cell.row < 4)) // leave top 4 rows free
          ) {
            return true;
          } else if (!canMove) {
            break; // don't try below
          }
        }
      }
    }
    return false;
  }
}
