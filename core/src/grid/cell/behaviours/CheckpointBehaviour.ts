import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';
import ICell from '@models/ICell';
import ChallengeCellType from '@models/ChallengeCellType';
import IBlock from '@models/IBlock';
import { IPlayer } from '@models/IPlayer';

export default class CheckpointBehaviour implements ICellBehaviour {
  private _cell: ICell;
  private _players: IPlayer[];
  private _isActive: boolean;
  constructor(cell: ICell) {
    this._cell = cell;
    this._players = [];
    this._isActive = false;
  }

  step() {
    this._players = this._players.filter(
      (player) => player.checkpointCell === this._cell
    );
    const isActive = this._players.length > 0;
    if (this._isActive !== isActive) {
      this._isActive = isActive;
      this._cell.requiresRerender = true;
    }
  }

  onAddBlock(block: IBlock) {
    block.player.checkpointCell = this._cell;
    this._players.push(block.player);
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
    return this._isActive ? 'checkpoint_active' : 'checkpoint';
  }
}
