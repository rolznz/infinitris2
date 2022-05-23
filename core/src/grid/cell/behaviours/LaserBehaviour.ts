import Cell from '../Cell';
import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';
import ICell from '@models/ICell';
import ChallengeCellType from '@models/ChallengeCellType';

const CHARGE_RATE = 0.01;
const COOLDOWN_RATE = 0.05;
const HOLD_LENGTH = 90;

export default class LaserBehaviour implements ICellBehaviour {
  private _charge: number;
  private _isActive: boolean;
  private _hold: number;
  private _cell: ICell;
  constructor(cell: ICell) {
    this._cell = cell;
    this._charge = 0;
    this._hold = 0;
    this._isActive = false;
  }
  step(): void {
    if (!this._isActive) {
      this._charge += CHARGE_RATE;
      if (this._charge > 1) {
        this._charge = 1;
        this._isActive = true;
        this._hold = HOLD_LENGTH;
      }
    } else {
      if (this._hold === 0) {
        this._charge -= COOLDOWN_RATE;
        if (this._charge < 0) {
          this._charge = 0;
          this._isActive = false;
        }
      } else {
        --this._hold;
      }
      if (this._charge === 1) {
        this._cell.blocks.forEach((block) => block.die());
      }
    }
  }

  get isReplaceable(): boolean {
    return false;
  }

  clone(cell: ICell): ICellBehaviour {
    return new LaserBehaviour(cell);
  }

  get alpha(): number {
    return this._isActive ? this._charge : 0;
  }

  get color(): number {
    return 0xff0000;
  }

  get isPassable(): boolean {
    return !this._isActive;
  }

  get type(): CellType {
    return CellType.Laser;
  }
  toChallengeCellType() {
    return ChallengeCellType.Laser;
  }
}
