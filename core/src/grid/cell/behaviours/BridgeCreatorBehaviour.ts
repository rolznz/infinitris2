import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';
import ICell from '@models/ICell';
import ChallengeCellType from '@models/ChallengeCellType';
import IBlock from '@models/IBlock';
import IGrid from '@models/IGrid';

export default class BridgeCreatorBehaviour implements ICellBehaviour {
  private _cell: ICell;
  private _grid: IGrid;
  constructor(cell: ICell, grid: IGrid) {
    this._cell = cell;
    this._grid = grid;
  }
  step(): void {}

  onAddBlock(_block: IBlock) {}

  get alpha(): number {
    return this._cell.player ? 1 : 0.25;
  }

  get color(): number {
    return 0x666;
  }

  get isPassable(): boolean {
    return true;
  }

  get isReplaceable(): boolean {
    return false;
  }

  clone(forCell: ICell): ICellBehaviour {
    return new BridgeCreatorBehaviour(forCell, this._grid);
  }

  get type(): CellType {
    return CellType.BridgeCreator;
  }
  toChallengeCellType() {
    return ChallengeCellType.BridgeCreator;
  }
  getImageFilename() {
    return 'bridge_creator';
  }
  hasWorldImage() {
    return false;
  }
  hasWorldVariationImage() {
    return false;
  }
}