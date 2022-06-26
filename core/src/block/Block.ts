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

type LoopCellEvent = (cell?: ICell) => void;

const INITIAL_FALL_DELAY = 90;
const FALL_SPEED_SCORE_EXP = 0.55;
export const MAX_SCORE = Math.pow(INITIAL_FALL_DELAY, 1 / FALL_SPEED_SCORE_EXP);

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
  private _gridCells: ICell[][];
  private _simulation: ISimulation;
  private _layoutId: number;
  private _id: number;

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
    force = false
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
    this._gridCells = simulation.grid.cells;
    this._resetTimers();

    let otherBlockInArea = false;
    if (!force) {
      this._loopCells(
        this._gridCells,
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

    if (force || (!otherBlockInArea && this.canMove(0, 0, 0))) {
      this._updateCells();
    } else {
      this._isAlive = false;
      this._eventListener?.onBlockCreateFailed(this);
    }
    if (this._isAlive) {
      this._eventListener?.onBlockCreated(this);
    }
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

  // TODO: rename numColumns
  get height(): number {
    return this._layout.length;
  }

  die() {
    this._isAlive = false;
    this._eventListener?.onBlockDied(this);
    this.destroy();
  }

  destroy() {
    this._removeCells();
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
   * Determines whether the block can move to a new position.
   *
   * @param dx the delta of the x position (column).
   * @param dy the delta of the x position (row).
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
        (cell) => {
          if (cell) {
            newCells.push(cell);
          }
          canMove =
            Boolean(canMove && cell && cell.isPassable) ||
            Boolean(this.isDropping && cell?.isPassableWhileDropping);
        }
      );

      if (options) {
        options.cells = newCells;
      }
      if (canMove && options && !options.allowMistakes) {
        options.isMistake = checkMistake(newCells, this._simulation);
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
  move(dx: number, dy: number, dr: number, force: boolean = false): boolean {
    const attempts: MovementAttempt[] =
      !force && !this.isDropping && dr !== 0
        ? this._simulation.rotationSystem.getAttempts(this._layout, dx, dy, dr)
        : [{ dx, dy, dr }];

    let canMove = false;
    for (let i = 0; i < attempts.length; i++) {
      canMove =
        force || this.canMove(attempts[i].dx, attempts[i].dy, attempts[i].dr);
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
   * @param gridCells
   */
  fall(): boolean {
    const fell = this.move(0, 1, 0);
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
    console.log('Placing block for player ' + this.player.id);
    this._cells.forEach((cell) => {
      cell.place(this._player);
    });
    this._eventListener?.onBlockPlaced(this);
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
        if (
          (this._simulation.settings.preventTowers !== false &&
            this._simulation.grid.isTower(this.bottomRow)) ||
          (this._simulation.settings.mistakeDetection !== false &&
            checkMistake(this._cells, this._simulation))
        ) {
          this.die();
        } else {
          this.place();
        }
        removed = true;
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

  private _removeCells() {
    this._cells.forEach((cell) => cell.removeBlock(this));
    this._cells.length = 0;
  }

  private _updateCells() {
    this._removeCells();
    this._loopCells(
      this._simulation.grid.cells,
      this._column,
      this._row,
      this._rotation,
      this._addCell
    );
  }

  private _resetTimers() {
    this._resetFallTimer();
    this._resetLockTimer();
  }

  private _resetFallTimer() {
    this._fallTimer = this._isDropping
      ? this._slowdownAmount * 3
      : Math.max(
          INITIAL_FALL_DELAY -
            Math.ceil(
              this._simulation.settings.gameModeType === 'conquest' // TODO: add blockSpeedAlgorithm for game mode
                ? Math.pow(this._player.health / 2, 2) *
                    INITIAL_FALL_DELAY *
                    0.8
                : Math.pow(
                    Math.min(this._player.score, MAX_SCORE),
                    FALL_SPEED_SCORE_EXP
                  )
            ),
          1
        );
  }

  private _resetLockTimer() {
    this._lockTimer = this._isDropping ? this._slowdownAmount * 3 : 45;
  }

  private _addCell = (cell?: ICell) => {
    if (!cell) {
      throw new Error('Cannot add an undefined cell to a block');
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
          cellEvent(gridCell);
        }
      }
    }
  }
}
