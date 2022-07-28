import CellType from '@models/CellType';
import ChallengeCellType from '@models/ChallengeCellType';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import IGrid from '@models/IGrid';
import NormalCellBehaviour from './NormalCellBehaviour';

const rockFallInterval = 10;

export default class RockBehaviour implements ICellBehaviour {
  private _cell: ICell;
  private _grid: IGrid;
  private _nextRockTimer: number;
  private _offsetY: number;
  private _shouldExplode: boolean;
  private _imageFilename: string;
  private _rockFallInterval: number;
  private _rotation: number;
  constructor(
    cell: ICell,
    grid: IGrid,
    imageFilename?: string,
    speed?: number,
    rotation?: number
  ) {
    this._grid = grid;
    this._cell = cell;
    this._nextRockTimer = 0;
    this._offsetY = 0;
    this._rotation =
      rotation ?? this._grid.nextRandom('rockRotation') * Math.PI * 2;
    this._shouldExplode = false;
    this._rockFallInterval =
      speed ||
      Math.ceil(
        rockFallInterval +
          this._grid.nextRandom('rockFallInterval') * 0.25 * rockFallInterval
      );
    const filenames = [
      'rock1a',
      'rock1b',
      'rock2',
      'rock3a',
      'rock3b',
      'rock4',
      'rock5',
      'rock6',
    ];
    this._imageFilename =
      imageFilename || filenames[Math.floor(Math.random() * filenames.length)];
  }

  step(): void {
    const belowCell = this._grid.cells[this._cell.row + 1]?.[this._cell.column];
    if (belowCell?.blocks.length) {
      for (const block of belowCell.blocks) {
        block.die();
      }
      this._remove();
    } else if (
      !belowCell ||
      !belowCell.isPassable ||
      !belowCell.behaviour.isReplaceable
    ) {
      this._remove();
    }

    if (++this._nextRockTimer > this._rockFallInterval) {
      //this._nextRockTimer = 0;
      if (
        belowCell &&
        belowCell.isPassable &&
        belowCell.behaviour.isReplaceable
      ) {
        belowCell.behaviour = new RockBehaviour(
          belowCell,
          this._grid,
          this._imageFilename,
          this._rockFallInterval,
          this._rotation
        );
        this._remove(false);
      } else {
        this._remove();
      }
    }
    this._offsetY = this._nextRockTimer / this._rockFallInterval;
  }
  private _remove(shouldExplode = true) {
    this._shouldExplode = shouldExplode;
    // TODO: particle animation
    this._cell.behaviour = new NormalCellBehaviour(this._cell);
  }

  shouldExplode(): boolean {
    return this._shouldExplode;
  }

  clone(forCell: ICell): ICellBehaviour {
    return new RockBehaviour(forCell, this._grid);
  }

  get isReplaceable(): boolean {
    return false;
  }

  get color(): number {
    return 0x624226;
  }

  get alpha(): number {
    return 1;
  }

  get isPassable(): boolean {
    return true;
  }

  get offsetY(): number {
    return this._offsetY;
  }

  get type(): CellType {
    return CellType.Rock;
  }

  toChallengeCellType(): ChallengeCellType {
    throw new Error('Unsupported');
  }
  getImageFilename() {
    return this._imageFilename;
  }

  get rotation(): number {
    return this._rotation;
  }
  hasWorldImage() {
    return true;
  }
  hasWorldVariationImage() {
    return true;
  }
}
