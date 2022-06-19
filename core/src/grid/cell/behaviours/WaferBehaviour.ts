import IBlock from '@models/IBlock';
import CellType from '@models/CellType';
import ChallengeCellType from '@models/ChallengeCellType';
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
    let fallingBlock: IBlock | undefined;
    if (
      this._cell.row > 0 &&
      (fallingBlock = this._grid.cells[this._cell.row - 1][
        this._cell.column
      ].blocks.find((block) => block.isDropping))
    ) {
      this._explode(fallingBlock);
    }
  }

  onAddBlock(block: IBlock) {
    block.cells.forEach((cell) => {
      if (cell.behaviour === this) {
        this._explode(block);
      }
    });
  }
  private _explode(block: IBlock) {
    this._cell.behaviour = new NormalCellBehaviour(this._cell);
    block.slowDown();
    // TODO: rather than cancelling the drop, slow it down slightly
    /*this._grid.cells[this._cell.row - 1][
      this._cell.column
    ].blocks.forEach((block) => block.cancelDrop());*/
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
  get isPassableWhileDropping(): boolean {
    return true;
  }

  get isReplaceable(): boolean {
    return false;
  }

  clone(cell: ICell): ICellBehaviour {
    return new WaferBehaviour(cell, this._grid);
  }

  get type(): CellType {
    return CellType.Wafer;
  }
  toChallengeCellType() {
    return ChallengeCellType.Wafer;
  }

  shouldExplode() {
    return true;
  }
  getImageFilename() {
    return 'wafer';
  }
}
