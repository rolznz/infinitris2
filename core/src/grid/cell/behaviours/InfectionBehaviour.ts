import CellType from '@models/CellType';
import ChallengeCellType from '@models/ChallengeCellType';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import IGrid from '@models/IGrid';
import NormalCellBehaviour from './NormalCellBehaviour';

const infectionCellLife = 1000;
const infectionCellSpread = 100;

export default class InfectionBehaviour implements ICellBehaviour {
  private _cell: ICell;
  private _grid: IGrid;
  private _spreadTimer: number;
  private _life: number;
  constructor(cell: ICell, grid: IGrid) {
    this._grid = grid;
    this._cell = cell;
    this._spreadTimer = 0;
    this._life = infectionCellLife;
  }

  step(): void {
    if (this._life === 0) {
      this._cell.isEmpty = false;
      this._cell.behaviour = new NormalCellBehaviour(this._cell, 0x9944ee);
      this._grid.checkLineClears([this._cell.row]);
      return;
    }
    this._life--;
    if (this._spreadTimer++ > infectionCellSpread) {
      this._spreadTimer = 0;

      for (let row = -1; row <= 1; row++) {
        for (let column = -1; column <= 1; column++) {
          if (row === 0 && column === 0) {
            continue;
          }
          const cell =
            this._grid.cells[this._cell.row + row]?.[
              (((this._cell.column + column) % this._grid.numColumns) +
                this._grid.numColumns) %
                this._grid.numColumns
            ];
          if (cell && cell.isPassable /* && cell.behaviour.isReplaceable*/) {
            cell.behaviour = new InfectionBehaviour(cell, this._grid);
          }
        }
      }
    }
  }

  clone(forCell: ICell): ICellBehaviour {
    const newBehaviour = new InfectionBehaviour(forCell, this._grid);
    newBehaviour._life = this._life;
    newBehaviour._spreadTimer = this._spreadTimer;
    return newBehaviour;
  }

  get isReplaceable(): boolean {
    return true;
  }

  get color(): number {
    return 0xaa00ff;
  }

  get alpha(): number {
    return 1;
  }

  get isPassable(): boolean {
    return false;
  }

  get type(): CellType {
    return CellType.Infection;
  }

  toChallengeCellType() {
    return ChallengeCellType.Infection;
  }
  getImageFilename() {
    return 'virus';
  }
  hasWorldImage() {
    return true;
  }
  hasWorldVariationImage() {
    return true;
  }
}
