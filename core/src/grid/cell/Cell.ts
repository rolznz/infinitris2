import Block from 'core/src/block/Block';
import createBehaviour from './behaviours/createBehaviour';
import ICellBehaviour from './behaviours/ICellBehaviour';
import CellType from './CellType';

export default class Cell {
  private _row: number;
  private _column: number;
  private _type: CellType;
  private _behaviour?: ICellBehaviour;
  private readonly _blocks: Block[];
  constructor(column: number, row: number) {
    this._row = row;
    this._column = column;
    this._type = CellType.Empty;
    this._blocks = [];
  }
  get row(): number {
    return this._row;
  }
  get column(): number {
    return this._column;
  }
  get type(): CellType {
    return this._type;
  }
  set type(type: CellType) {
    this._type = type;
    this._behaviour = createBehaviour(type);
  }
  get isEmpty(): boolean {
    return this._type !== CellType.Full;
  }

  get behaviour(): ICellBehaviour | undefined {
    return this._behaviour;
  }

  get blocks(): ReadonlyArray<Block> {
    return this._blocks;
  }

  step() {
    this._behaviour?.step(this);
  }

  addBlock(block: Block) {
    if (this._blocks.find((existingBlock) => existingBlock === block)) {
      throw new Error('Cannot add the same block to a cell');
    }
    console.log('Block added to ', this._row, this._column);
    this._blocks.push(block);
  }

  removeBlock(block: Block) {
    const index = this._blocks.indexOf(block);
    if (index < 0) {
      throw new Error('Block does not exist in cell');
    }
    this._blocks.splice(index, 1);
  }
}
