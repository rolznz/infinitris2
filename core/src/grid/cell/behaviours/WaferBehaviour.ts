import CellType from '@models/CellType';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import IGrid from '@models/IGrid';
import NormalCellBehaviour from './NormalCellBehaviour';

export default class WaferBehaviour implements ICellBehaviour {
  private _cell: ICell;
  private _grid: IGrid;
  constructor(cell: ICell, grid: IGrid) {
    this._grid = grid;
    this._cell = cell;
  }

  step(): void {
    if (
      this._cell.row > 0 &&
      this._grid.cells[this._cell.row - 1][this._cell.column].blocks.some(
        (block) => block.isDropping
      )
    ) {
      this._cell.behaviour = new NormalCellBehaviour();
      this._grid.cells[this._cell.row - 1][
        this._cell.column
      ].blocks.forEach((block) => block.slowDown(this._cell.row));
      // TODO: rather than cancelling the drop, slow it down slightly
      /*this._grid.cells[this._cell.row - 1][
        this._cell.column
      ].blocks.forEach((block) => block.cancelDrop());*/
    }
  }

  get color(): number {
    return 0xd4bbb1;
  }

  get alpha(): number {
    return 1;
  }

  get isPassable(): boolean {
    return false;
  }

  get isReplaceable(): boolean {
    return false;
  }

  clone(_forCell: ICell): ICellBehaviour {
    throw new Error('clone unsupported');
  }

  get type(): CellType {
    return CellType.Wafer;
  }
}
