import IBlock from '@models/IBlock';
import createBehaviour from './behaviours/createBehaviour';
import ICell from '@models/ICell';
import CellType from '@models/CellType';
import ICellBehaviour from '@models/ICellBehaviour';

export default class Cell implements ICell {
  private _row: number;
  private _column: number;
  private _type: CellType;
  private _behaviour?: ICellBehaviour;
  private readonly _blocks: IBlock[];
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

  get blocks(): ReadonlyArray<IBlock> {
    return this._blocks;
  }

  step() {
    this._behaviour?.step(this);
  }

  addBlock(block: IBlock) {
    if (this._blocks.find((existingBlock) => existingBlock === block)) {
      throw new Error('Cannot add the same block to a cell');
    }
    this._blocks.push(block);
  }

  removeBlock(block: IBlock) {
    const index = this._blocks.indexOf(block);
    if (index < 0) {
      throw new Error('Block does not exist in cell');
    }
    this._blocks.splice(index, 1);
  }
}
