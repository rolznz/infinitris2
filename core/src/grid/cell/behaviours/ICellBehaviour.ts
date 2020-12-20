import Cell from '../Cell';

export default interface ICellBehaviour {
  step(cell: Cell): void;
}
