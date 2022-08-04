import CellType from '@models/CellType';
import ChallengeCellType from '@models/ChallengeCellType';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';

export default class NormalCellBehaviour implements ICellBehaviour {
  private _color: number;
  private _cell: ICell;
  constructor(cell: ICell, color: number = 0xaaaaaa) {
    this._cell = cell;
    this._color = color;
  }

  clone(cell: ICell): ICellBehaviour {
    return new NormalCellBehaviour(cell, this._color);
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

  toChallengeCellType(): ChallengeCellType {
    if (this._cell.isEmpty) {
      return ChallengeCellType.Empty;
    } else {
      return ChallengeCellType.Full;
    }
  }
  getImageFilename(): string | undefined {
    if (this._cell.isEmpty) {
      return undefined;
    }
    return 'fill';
  }
  hasWorldImage() {
    return true;
  }
  hasWorldVariationImage() {
    return true;
  }
  hasTileset() {
    return true;
  }
}
