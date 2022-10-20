import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';
import ICell from '@models/ICell';
import ChallengeCellType from '@models/ChallengeCellType';
import IBlock from '@models/IBlock';
import IGrid from '@models/IGrid';

export default class PartialClearBehaviour implements ICellBehaviour {
  private _cell: ICell;
  private _grid: IGrid;
  private _alpha: number;
  constructor(cell: ICell, grid: IGrid) {
    this._cell = cell;
    this._grid = grid;
    this._alpha = 0;
  }
  step(): void {
    this._alpha += 0.05;
  }

  onAddBlock(_block: IBlock) {}

  get alpha(): number {
    return 1; //0.5 + (Math.sin(this._alpha) + 1) / 4;
  }

  get color(): number {
    return 0x666;
  }

  get isPassable(): boolean {
    return false;
  }

  get isReplaceable(): boolean {
    return false;
  }

  clone(forCell: ICell): ICellBehaviour {
    return new PartialClearBehaviour(forCell, this._grid);
  }

  get type(): CellType {
    return CellType.PartialClear;
  }
  toChallengeCellType() {
    return ChallengeCellType.PartialClear;
  }
  getImageFilename() {
    return 'barrier';
  }
  hasWorldImage() {
    return false;
  }
  hasWorldVariationImage() {
    return false;
  }
}
