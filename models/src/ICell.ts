import { IBlock, ICellBehaviour } from '../index';
import CellType from './CellType';

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
}
