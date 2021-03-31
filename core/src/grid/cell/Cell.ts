import IBlock from '@models/IBlock';
import createBehaviour from './behaviours/createBehaviour';
import ICell from '@models/ICell';
import CellType from '@models/CellType';
import ICellBehaviour from '@models/ICellBehaviour';
import NormalCellBehaviour from './behaviours/NormalCellBehaviour';
import IGrid from '@models/IGrid';

export default class Cell implements ICell {
  private _grid: IGrid;
  private _row: number;
  private _column: number;
  private _behaviour: ICellBehaviour;
  private _isEmpty: boolean;
  private readonly _blocks: IBlock[];
  constructor(grid: IGrid, row: number, column: number) {
    this._grid = grid;
    this._row = row;
    this._column = column;
    this._behaviour = new NormalCellBehaviour();
    this._isEmpty = true;
    this._blocks = [];
  }
  get row(): number {
    return this._row;
  }
  get column(): number {
    return this._column;
  }
  get type(): CellType {
    return this._behaviour.type;
  }

  get color(): number {
    return this._behaviour?.color || 0xffffff;
  }

  get isPassable(): boolean {
    return this._behaviour.isPassable && this._isEmpty;
  }

  get isEmpty(): boolean {
    return this._isEmpty;
  }
  set isEmpty(isEmpty: boolean) {
    this._isEmpty = isEmpty;
  }

  get behaviour(): ICellBehaviour {
    return this._behaviour;
  }
  set behaviour(behaviour: ICellBehaviour) {
    this._behaviour = behaviour;
  }

  get blocks(): IBlock[] {
    return this._blocks;
  }

  step() {
    this._behaviour?.step?.();
  }

  replaceWith(cell: ICell) {
    this._behaviour = cell.behaviour;
    this._isEmpty = cell.isEmpty;
  }
  reset(): void {
    this._behaviour = new NormalCellBehaviour();
  }

  addBlock(block: IBlock) {
    if (this._blocks.find((existingBlock) => existingBlock === block)) {
      throw new Error('Cannot add the same block to a cell');
    }
    this._blocks.push(block);
    this._behaviour?.onAddBlock?.(block);
  }

  removeBlock(block: IBlock) {
    const index = this._blocks.indexOf(block);
    if (index < 0) {
      throw new Error('Block does not exist in cell');
    }
    this._blocks.splice(index, 1);
    this._behaviour?.onRemoveBlock?.(block);
  }
}
