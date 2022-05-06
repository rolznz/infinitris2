import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';
import ICell from '@models/ICell';
import { keyColors } from '@core/grid/cell/behaviours/createBehaviourFromChallengeCellType';
import ChallengeCellType from '@models/ChallengeCellType';

export default class KeyBehaviour implements ICellBehaviour {
  private _color: number;
  constructor(color: number) {
    this._color = color;
  }
  get color(): number {
    return this._color;
  }

  get isPassable(): boolean {
    return true;
  }

  get isReplaceable(): boolean {
    return false;
  }

  clone(_forCell: ICell): ICellBehaviour {
    throw new Error('clone unsupported');
  }

  get type(): CellType {
    return CellType.Key;
  }

  get alpha(): number {
    return 1;
  }

  toChallengeCellType() {
    switch (this._color) {
      case keyColors.redColor:
        return ChallengeCellType.RedKey;
      case keyColors.blueColor:
        return ChallengeCellType.BlueKey;
      case keyColors.yellowColor:
        return ChallengeCellType.YellowKey;
      case keyColors.greenColor:
        return ChallengeCellType.GreenKey;
      default:
        throw new Error('Unsupported key color: ' + this._color);
    }
  }
}
