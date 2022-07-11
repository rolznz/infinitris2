import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import CellType from '@models/CellType';
import ICellBehaviour from '@models/ICellBehaviour';
import NormalCellBehaviour from './behaviours/NormalCellBehaviour';
import IGrid from '@models/IGrid';
import ICellEventListener from '@models/ICellEventListener';
import { IPlayer } from '@models/IPlayer';

export default class Cell implements ICell {
  private _grid: IGrid;
  private _row: number;
  private _column: number;
  private _behaviour: ICellBehaviour;
  private _isEmpty: boolean;
  private readonly _blocks: IBlock[];
  private readonly _eventListener?: ICellEventListener;
  private _player: IPlayer | undefined;
  private _requiresRerender;
  constructor(grid: IGrid, row: number, column: number) {
    this._grid = grid;
    this._row = row;
    this._column = column;
    this._behaviour = new NormalCellBehaviour(this);
    this._isEmpty = true;
    this._blocks = [];
    this._eventListener = grid;
    this._requiresRerender = false;
  }

  get grid(): IGrid {
    return this._grid;
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

  get requiresRerender(): boolean {
    return this._requiresRerender;
  }
  set requiresRerender(requiresRerender: boolean) {
    this._requiresRerender = requiresRerender;
  }

  get isPassable(): boolean {
    return this._behaviour.isPassable && this._isEmpty;
  }
  get isPassableWhileDropping(): boolean {
    return this._behaviour.isPassableWhileDropping || false;
  }

  get isEmpty(): boolean {
    return this._isEmpty;
  }
  get isEmptyWithNoBlocks(): boolean {
    return this._isEmpty && !this._blocks.length;
  }
  set isEmpty(isEmpty: boolean) {
    if (isEmpty !== this._isEmpty) {
      this._isEmpty = isEmpty;
      this._eventListener?.onCellIsEmptyChanged(this);
    }
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

  get player(): IPlayer | undefined {
    return this._player;
  }

  set player(player: IPlayer | undefined) {
    this._player = player;
  }

  /**
   * @param player if undefined, will fill the cell with a non-player filled cell behaviour
   */
  place(player: IPlayer | undefined) {
    this._player = player;
    this.isEmpty = false;
    if (this.behaviour.isReplaceable) {
      this.behaviour = new NormalCellBehaviour(this, player?.color);
    }
  }

  step() {
    this._behaviour?.step?.();
  }

  replaceWith(cell: ICell) {
    this.behaviour = cell.behaviour.clone(this);
    this.isEmpty = cell.isEmpty;
    this._player = cell.player;
  }
  reset(): void {
    this.makeEmpty();
    this.behaviour = new NormalCellBehaviour(this);
  }

  makeEmpty(): void {
    this._player = undefined;
    this.isEmpty = true;
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

  isConnectedTo(cell: ICell) {
    // TODO: need to store player's ID in the cell after they have placed it
    return cell && cell.isEmpty === this.isEmpty && cell.color === this.color;
  }
}
