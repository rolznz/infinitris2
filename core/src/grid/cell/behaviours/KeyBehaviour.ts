import ICellBehaviour from '../../../../../models/src/ICellBehaviour';
import CellType from '@models/CellType';

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

  get type(): CellType {
    return CellType.Key;
  }

  get alpha(): number {
    return 1;
  }
}
