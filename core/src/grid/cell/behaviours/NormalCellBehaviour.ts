import CellType from '@models/CellType';
import ICellBehaviour from '@models/ICellBehaviour';

export default class NormalCellBehaviour implements ICellBehaviour {
  constructor() {}
  get color(): number {
    return 0xaaaaaa;
  }

  get isPassable(): boolean {
    return true;
  }

  get type(): CellType {
    return CellType.Normal;
  }

  get alpha(): number {
    return 1;
  }
}
