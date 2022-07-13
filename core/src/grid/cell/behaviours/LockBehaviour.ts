import ICellBehaviour from '@models/ICellBehaviour';
import ICell from '@models/ICell';
import CellType from '@models/CellType';
import KeyBehaviour from './KeyBehaviour';
import IGrid from '@models/IGrid';
import { lockColors } from '@core/grid/cell/behaviours/createBehaviourFromChallengeCellType';
import ChallengeCellType from '@models/ChallengeCellType';
import NormalCellBehaviour from '@core/grid/cell/behaviours/NormalCellBehaviour';
import SwitchBehaviour from '@core/grid/cell/behaviours/SwitchBehaviour';

export default class LockBehaviour implements ICellBehaviour {
  private _cell: ICell;
  private _color: number;
  private _isLocked: boolean;
  private _alpha: number;
  private _grid: IGrid;
  constructor(cell: ICell, grid: IGrid, color: number) {
    this._grid = grid;
    this._cell = cell;
    this._color = color;
    this._isLocked = true;
    this._alpha = 1;
  }

  step(): void {
    this._checkLocked();

    if (this._isLocked) {
      this._alpha = Math.min(this._alpha + 0.05, 1);
    } else {
      this._alpha = Math.max(this._alpha - 0.05, 0.0);
    }
  }

  private _checkLocked() {
    const wasLocked = this._isLocked;
    this._isLocked = this._grid.reducedCells.some(
      (other) =>
        other.behaviour.color === this._color &&
        (other.type === CellType.Key ||
          (other.type === CellType.Switch &&
            !(<SwitchBehaviour>other.behaviour).isOn))
    );

    // TODO: is there a better way to do this?
    // cells are only currently rendered (full re-render) initially and on block placement and line clear.
    // NB: cells can change opacity, color etc without a full re-render.
    if (this._isLocked !== wasLocked) {
      this._cell.requiresRerender = true;
    }
  }

  get color(): number {
    return this._color;
  }

  get isReplaceable(): boolean {
    return false;
  }

  clone(forCell: ICell): ICellBehaviour {
    return new LockBehaviour(forCell, this._grid, this._color);
  }

  get alpha(): number {
    return this._alpha;
  }

  get isPassable(): boolean {
    return !this._isLocked;
  }

  get isLocked(): boolean {
    return this._isLocked;
  }

  get type(): CellType {
    return CellType.Lock;
  }

  toChallengeCellType() {
    switch (this._color) {
      case lockColors.redColor:
        return ChallengeCellType.RedLock;
      case lockColors.blueColor:
        return ChallengeCellType.BlueLock;
      case lockColors.yellowColor:
        return ChallengeCellType.YellowLock;
      case lockColors.greenColor:
        return ChallengeCellType.GreenLock;
      default:
        throw new Error('Unsupported lock color: ' + this._color);
    }
  }
  getImageFilename() {
    switch (this._color) {
      case lockColors.redColor:
        return 'lock_red';
      case lockColors.blueColor:
        return 'lock_blue';
      case lockColors.yellowColor:
        return 'lock_yellow';
      case lockColors.greenColor:
        return 'lock_green';
      default:
        throw new Error('Unsupported lock color: ' + this._color);
    }
  }
}
