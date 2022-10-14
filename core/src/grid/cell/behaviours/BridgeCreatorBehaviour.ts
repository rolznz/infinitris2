import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';
import ICell from '@models/ICell';
import ChallengeCellType from '@models/ChallengeCellType';
import IBlock from '@models/IBlock';
import NormalCellBehaviour from '@core/grid/cell/behaviours/NormalCellBehaviour';
import IGrid from '@models/IGrid';
import { wrap } from '@core/utils/wrap';

export default class BridgeCreatorBehaviour implements ICellBehaviour {
  private _cell: ICell;
  private _grid: IGrid;
  constructor(cell: ICell, grid: IGrid) {
    this._cell = cell;
    this._grid = grid;
  }
  step(): void {}

  onAddBlock(_block: IBlock) {}

  // onCellIsEmptyChanged() {
  // if (this._cell.player) {
  //   this._cell.behaviour = new NormalCellBehaviour(this._cell);
  // }
  // if (this._cell.player) {
  //   [
  //     [-1, 0],
  //     [1, 0],
  //     [0, -1],
  //     [0, 1],
  //   ].forEach((direction) => {
  //     const neighbour =
  //       this._grid.cells[this._cell.row + direction[1]]?.[
  //         wrap(this._cell.column + direction[0], this._grid.numColumns)
  //       ];
  //     if (
  //       neighbour &&
  //       neighbour.isEmpty &&
  //       neighbour.type === CellType.BridgeCreator
  //     ) {
  //       neighbour.place(this._cell.player);
  //     }
  //   });
  // }
  // }

  get alpha(): number {
    return this._cell.player ? 1 : 0.1;
  }

  get color(): number {
    return 0xff00ff;
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
    return 'finish';
  }
  hasWorldImage() {
    return false;
  }
  hasWorldVariationImage() {
    return false;
  }
}
