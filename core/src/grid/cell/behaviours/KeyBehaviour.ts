import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';
import ICell from '@models/ICell';
import { keyColors } from '@core/grid/cell/behaviours/createBehaviourFromChallengeCellType';
import ChallengeCellType from '@models/ChallengeCellType';
import NormalCellBehaviour from '@core/grid/cell/behaviours/NormalCellBehaviour';

export default class KeyBehaviour implements ICellBehaviour {
  private _color: number;
  private _cell: ICell;
  constructor(cell: ICell, color: number) {
    this._color = color;
    this._cell = cell;
  }
  get color(): number {
    return this._color;
  }

  get isPassable(): boolean {
    return true;
  }

  get isReplaceable(): boolean {
    return false;
  }

  clone(): ICellBehaviour {
    return new KeyBehaviour(this._cell, this._color);
  }

  onAddBlock() {
    this._cell.behaviour = new NormalCellBehaviour(this._cell);
  }

  get type(): CellType {
    return CellType.Key;
  }

  get alpha(): number {
    return 1;
  }

  toChallengeCellType() {
    switch (this._color) {
      case keyColors.redColor:
        return ChallengeCellType.RedKey;
      case keyColors.blueColor:
        return ChallengeCellType.BlueKey;
      case keyColors.yellowColor:
        return ChallengeCellType.YellowKey;
      case keyColors.greenColor:
        return ChallengeCellType.GreenKey;
      default:
        throw new Error('Unsupported key color: ' + this._color);
    }
  }
  getImageFilename() {
    switch (this._color) {
      case keyColors.redColor:
        return 'key_red';
      case keyColors.blueColor:
        return 'key_blue';
      case keyColors.yellowColor:
        return 'key_yellow';
      case keyColors.greenColor:
        return 'key_green';
      default:
        throw new Error('Unsupported key color: ' + this._color);
    }
  }
}
