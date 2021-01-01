import ICell from './ICell';

export default interface ICellBehaviour {
  step(cell: ICell): void;
}
