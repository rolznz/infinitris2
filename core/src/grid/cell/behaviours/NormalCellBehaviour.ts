import CellType from '@models/CellType';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';

export default class NormalCellBehaviour implements ICellBehaviour {
  private _color: number;
  constructor(color: number = 0xaaaaaa) {
    this._color = color;
  }

  clone(_forCell: ICell): ICellBehaviour {
    return new NormalCellBehaviour(this._color);
  }

  get color(): number {
    return this._color;
  }

  get isPassable(): boolean {
    return true;
  }

  get isReplaceable(): boolean {
    return true;
  }

  get type(): CellType {
    return CellType.Normal;
  }

  get alpha(): number {
    return 1;
  }
}
