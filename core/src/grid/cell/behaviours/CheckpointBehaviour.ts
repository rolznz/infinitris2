import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';
import ICell from '@models/ICell';
import ChallengeCellType from '@models/ChallengeCellType';
import IBlock from '@models/IBlock';

export default class CheckpointBehaviour implements ICellBehaviour {
  private _cell: ICell;
  constructor(cell: ICell) {
    this._cell = cell;
  }

  onAddBlock(block: IBlock) {
    block.player.checkpointCell = this._cell;
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
    return new CheckpointBehaviour(forCell);
  }

  get type(): CellType {
    return CellType.Checkpoint;
  }
  toChallengeCellType() {
    return ChallengeCellType.Checkpoint;
  }
  getImageFilename() {
    return 'checkpoint';
  }
}
