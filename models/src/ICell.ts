import IBlock from './IBlock';
import CellType from './CellType';
import ICellBehaviour from './ICellBehaviour';
import { IPlayer } from './IPlayer';

export type NetworkCellInfo = {
  readonly playerId?: number;
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
  get behaviour(): ICellBehaviour;
  set behaviour(behaviour: ICellBehaviour);
  get blocks(): IBlock[];
  get player(): IPlayer | undefined;
  set player(player: IPlayer | undefined);
  addBlock(block: IBlock): void;
  removeBlock(block: IBlock): void;
  step(): void;
  replaceWith(cell: ICell): void;
  reset(): void;
  isConnectedTo(cell: ICell): boolean;
  place(player: IPlayer): void;
}
