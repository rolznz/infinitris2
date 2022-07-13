import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';
import ICell from '@models/ICell';
import { switchColors } from '@core/grid/cell/behaviours/createBehaviourFromChallengeCellType';
import ChallengeCellType from '@models/ChallengeCellType';

export default class SwitchBehaviour implements ICellBehaviour {
  private _color: number;
  private _cell: ICell;
  private _isOn: boolean;
  constructor(cell: ICell, color: number) {
    this._color = color;
    this._cell = cell;
    this._isOn = false;
  }
  get color(): number {
    return this._color;
  }

  get isOn(): boolean {
    return this._isOn;
  }

  get isPassable(): boolean {
    return true;
  }

  get isReplaceable(): boolean {
    return false;
  }

  onAddBlock() {
    this._isOn = !this._isOn;
    this._cell.requiresRerender = true;
  }

  onRemoveBlock() {}

  clone(): ICellBehaviour {
    return new SwitchBehaviour(this._cell, this._color);
  }

  get type(): CellType {
    return CellType.Switch;
  }

  get alpha(): number {
    return 1;
  }

  toChallengeCellType() {
    switch (this._color) {
      case switchColors.redColor:
        return ChallengeCellType.RedSwitch;
      case switchColors.blueColor:
        return ChallengeCellType.BlueSwitch;
      case switchColors.yellowColor:
        return ChallengeCellType.YellowSwitch;
      case switchColors.greenColor:
        return ChallengeCellType.GreenSwitch;
      default:
        throw new Error('Unsupported switch color: ' + this._color);
    }
  }
  getImageFilename() {
    const suffix = this._isOn ? '_on' : '_off';
    switch (this._color) {
      case switchColors.redColor:
        return 'switch_red' + suffix;
      case switchColors.blueColor:
        return 'switch_blue' + suffix;
      case switchColors.yellowColor:
        return 'switch_yellow' + suffix;
      case switchColors.greenColor:
        return 'switch_green' + suffix;
      default:
        throw new Error('Unsupported switch color: ' + this._color);
    }
  }
}
