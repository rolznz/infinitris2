import { IBlock, ICellBehaviour } from '../index';
import CellType from './CellType';

export default interface ICell {
  row: number;
  column: number;
  type: CellType;
  isEmpty: boolean;
  behaviour: ICellBehaviour | undefined;
  addBlock(block: IBlock): void;
  removeBlock(block: IBlock): void;
  step(): void;
}
