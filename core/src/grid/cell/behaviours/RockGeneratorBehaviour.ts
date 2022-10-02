import RockBehaviour from '@core/grid/cell/behaviours/RockBehaviour';
import CellType from '@models/CellType';
import ChallengeCellType from '@models/ChallengeCellType';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import IGrid from '@models/IGrid';

const rockFallInterval = 150;

export default class RockGeneratorBehaviour implements ICellBehaviour {
  private _cell: ICell;
  private _grid: IGrid;
  private _nextRockTimer: number;
  constructor(cell: ICell, grid: IGrid) {
    this._grid = grid;
    this._cell = cell;
    this._nextRockTimer = rockFallInterval;
  }

  step(): void {
    if (this._nextRockTimer++ >= rockFallInterval) {
      this._nextRockTimer = 0;

      const belowCell = this._grid.cells[this._cell.row + 1][this._cell.column];
      if (
        belowCell &&
        belowCell.isPassable &&
        belowCell.behaviour.isReplaceable
      ) {
        belowCell.behaviour = new RockBehaviour(belowCell, this._grid);
      }
    }
  }

  clone(forCell: ICell): ICellBehaviour {
    return new RockGeneratorBehaviour(forCell, this._grid);
  }

  get isReplaceable(): boolean {
    return false;
  }

  get color(): number {
    return 0x49311d;
  }

  get alpha(): number {
    return 1;
  }

  get isPassable(): boolean {
    return false;
  }

  get type(): CellType {
    return CellType.RockGenerator;
  }

  toChallengeCellType() {
    return ChallengeCellType.RockGenerator;
  }
  getImageFilename() {
    return 'rock-generator';
  }
  hasWorldImage() {
    return true;
  }
  hasWorldVariationImage() {
    return true;
  }
}
