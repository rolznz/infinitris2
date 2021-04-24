import ICellBehaviour from '../../../../../models/src/ICellBehaviour';
import CellType from '@models/CellType';
import ICell from '@models/ICell';

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
}
