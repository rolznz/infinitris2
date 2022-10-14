import CellType from '@models/CellType';
import ChallengeCellType from '@models/ChallengeCellType';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';

export default class SpawnLocationCellBehaviour implements ICellBehaviour {
  constructor(_cell: ICell) {}

  clone(cell: ICell): ICellBehaviour {
    return new SpawnLocationCellBehaviour(cell);
  }

  get color(): number {
    return 0xffffff;
  }

  get isPassable(): boolean {
    return true;
  }

  get isReplaceable(): boolean {
    return false;
  }

  get type(): CellType {
    return CellType.SpawnLocation;
  }

  get alpha(): number {
    return 1;
  }

  toChallengeCellType(): ChallengeCellType {
    return ChallengeCellType.SpawnLocation;
  }

  getImageFilename() {
    return 'spawn';
  }
}
