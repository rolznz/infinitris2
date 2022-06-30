import IBlock from './IBlock';
import CellType from './CellType';
import ICellBehaviour from './ICellBehaviour';
import { IPlayer } from './IPlayer';
import IGrid from '@models/IGrid';

export type NetworkCellInfo = {
  readonly playerId?: number;
  readonly isEmpty: boolean;
};

export default interface ICell {
  get row(): number;
  get column(): number;
  get type(): CellType;
  get color(): number;
  get isEmpty(): boolean;
  set isEmpty(empty: boolean);
  get isEmptyWithNoBlocks(): boolean;
  get isPassable(): boolean;
  get isPassableWhileDropping(): boolean;
  get grid(): IGrid;
  get behaviour(): ICellBehaviour;
  set behaviour(behaviour: ICellBehaviour);
  get blocks(): IBlock[];
  get player(): IPlayer | undefined;
  get wasPlayerRemoved(): boolean;
  set player(player: IPlayer | undefined);
  addBlock(block: IBlock): void;
  removeBlock(block: IBlock): void;
  step(): void;
  replaceWith(cell: ICell): void;
  reset(): void;
  makeEmpty(): void;
  isConnectedTo(cell: ICell): boolean;
  place(player: IPlayer | undefined): void;
}
