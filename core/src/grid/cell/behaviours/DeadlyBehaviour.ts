import ICellBehaviour from '../../../../../models/src/ICellBehaviour';
import CellType from '@models/CellType';
import ICell from '@models/ICell';

export default class DeadlyBehaviour implements ICellBehaviour {
  private _cell: ICell;
  constructor(cell: ICell) {
    this._cell = cell;
  }
  step(): void {
    this._cell.blocks.forEach((block) => block.die());
  }

  get alpha(): number {
    return 1;
  }

  get color(): number {
    return 0xff0000;
  }

  get isPassable(): boolean {
    return true;
  }

  get type(): CellType {
    return CellType.Deadly;
  }
}
