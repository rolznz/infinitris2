import IBlock from '@models/IBlock';
import createBehaviour from './behaviours/createBehaviour';
import ICell from '@models/ICell';
import CellType from '@models/CellType';
import ICellBehaviour from '@models/ICellBehaviour';
import NormalCellBehaviour from './behaviours/NormalCellBehaviour';
import IGrid from '@models/IGrid';
import ICellEventListener from '@models/ICellEventListener';

export default class Cell implements ICell {
  private _grid: IGrid;
  private _row: number;
  private _column: number;
  private _behaviour: ICellBehaviour;
  private _isEmpty: boolean;
  private readonly _blocks: IBlock[];
  private readonly _eventListener?: ICellEventListener;
  constructor(grid: IGrid, row: number, column: number) {
    this._grid = grid;
    this._row = row;
    this._column = column;
    this._behaviour = new NormalCellBehaviour();
    this._isEmpty = true;
    this._blocks = [];
    this._eventListener = grid;
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
    return this._blocks.length
      ? this._blocks[0].player.color
      : this._behaviour?.color || 0xffffff;
  }

  get isPassable(): boolean {
    return this._behaviour.isPassable && this._isEmpty;
  }

  get isEmpty(): boolean {
    return this._isEmpty;
  }
  get isEmptyWithNoBlocks(): boolean {
    return this._isEmpty && !this._blocks.length;
  }
  set isEmpty(isEmpty: boolean) {
    this._isEmpty = isEmpty;
  }

  get behaviour(): ICellBehaviour {
    return this._behaviour;
  }
  set behaviour(behaviour: ICellBehaviour) {
    const previousBehaviour = this._behaviour;
    this._behaviour = behaviour;
    this._eventListener?.onCellBehaviourChanged(this, previousBehaviour);
  }

  get blocks(): IBlock[] {
    return this._blocks;
  }

  step() {
    this._behaviour?.step?.();
  }

  replaceWith(cell: ICell) {
    this._behaviour = cell.behaviour.clone(this);
    this._isEmpty = cell.isEmpty;
  }
  reset(): void {
    this._behaviour = new NormalCellBehaviour();
    this._isEmpty = true;
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
