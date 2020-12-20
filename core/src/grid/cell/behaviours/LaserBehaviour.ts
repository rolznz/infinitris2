import Cell from '../Cell';
import ICellBehaviour from './ICellBehaviour';

const CHARGE_RATE = 0.005;
const COOLDOWN_RATE = 0.025;
const HOLD_LENGTH = 90;

export default class LaserBehaviour implements ICellBehaviour {
  private _charge: number;
  private _isActive: boolean;
  private _hold: number;
  constructor() {
    this._charge = 0;
    this._hold = 0;
    this._isActive = false;
  }
  step(cell: Cell): void {
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
      if (this._charge > 0.1) {
        cell.blocks.forEach((block) => block.die());
      }
    }
  }

  get alpha() {
    return this._isActive ? this._charge : 0;
  }
}
