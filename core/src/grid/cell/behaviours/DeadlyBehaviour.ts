import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';
import ICell from '@models/ICell';
import ChallengeCellType from '@models/ChallengeCellType';
import IBlock from '@models/IBlock';

export default class DeadlyBehaviour implements ICellBehaviour {
  private _cell: ICell;
  constructor(cell: ICell) {
    this._cell = cell;
  }
  step(): void {
    this._cell.blocks.forEach((block) => block.die());
  }

  onAddBlock(block: IBlock) {
    block.die();
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

  get isReplaceable(): boolean {
    return false;
  }

  clone(forCell: ICell): ICellBehaviour {
    return new DeadlyBehaviour(forCell);
  }

  get type(): CellType {
    return CellType.Deadly;
  }
  toChallengeCellType() {
    return ChallengeCellType.Deadly;
  }
}
