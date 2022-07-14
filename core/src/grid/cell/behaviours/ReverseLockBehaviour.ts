import ICellBehaviour from '@models/ICellBehaviour';
import ICell from '@models/ICell';
import CellType from '@models/CellType';
import KeyBehaviour from './KeyBehaviour';
import IGrid from '@models/IGrid';
import { lockColors } from '@core/grid/cell/behaviours/createBehaviourFromChallengeCellType';
import ChallengeCellType from '@models/ChallengeCellType';
import NormalCellBehaviour from '@core/grid/cell/behaviours/NormalCellBehaviour';
import SwitchBehaviour from '@core/grid/cell/behaviours/SwitchBehaviour';

// TODO: reduce duplication between reverse and normal locks
export default class ReverseLockBehaviour implements ICellBehaviour {
  private _cell: ICell;
  private _color: number;
  private _isLocked: boolean;
  private _alpha: number;
  private _grid: IGrid;
  constructor(cell: ICell, grid: IGrid, color: number) {
    this._grid = grid;
    this._cell = cell;
    this._color = color;
    this._isLocked = false;
    this._alpha = 1;
  }

  step(): void {
    this._checkLocked();
  }

  private _checkLocked() {
    const wasLocked = this._isLocked;
    this._isLocked = !this._grid.reducedCells.some(
      (other) =>
        other.behaviour.color === this._color &&
        (other.type === CellType.Key ||
          (other.type === CellType.Switch &&
            !(<SwitchBehaviour>other.behaviour).isOn))
    );

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
    return new ReverseLockBehaviour(forCell, this._grid, this._color);
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

  get rotation(): number {
    return Math.PI;
  }

  toChallengeCellType() {
    switch (this._color) {
      case lockColors.redColor:
        return ChallengeCellType.ReverseRedLock;
      case lockColors.blueColor:
        return ChallengeCellType.ReverseBlueLock;
      case lockColors.yellowColor:
        return ChallengeCellType.ReverseYellowLock;
      case lockColors.greenColor:
        return ChallengeCellType.ReverseGreenLock;
      default:
        throw new Error('Unsupported lock color: ' + this._color);
    }
  }
  getImageFilename() {
    const prefix = !this._isLocked ? 'reverse_' : '';
    switch (this._color) {
      case lockColors.redColor:
        return prefix + 'lock_red';
      case lockColors.blueColor:
        return prefix + 'lock_blue';
      case lockColors.yellowColor:
        return prefix + 'lock_yellow';
      case lockColors.greenColor:
        return prefix + 'lock_green';
      default:
        throw new Error('Unsupported lock color: ' + this._color);
    }
  }
}
