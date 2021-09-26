import IBlock from './IBlock';
import CellType from './CellType';
import ICellBehaviour from './ICellBehaviour';

export default interface ICell {
  row: number;
  column: number;
  type: CellType;
  color: number;
  isEmpty: boolean;
  isPassable: boolean;
  behaviour: ICellBehaviour;
  blocks: IBlock[];
  addBlock(block: IBlock): void;
  removeBlock(block: IBlock): void;
  step(): void;
  replaceWith(cell: ICell): void;
  reset(): void;
}
