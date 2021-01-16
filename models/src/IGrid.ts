import ICell from './ICell';

export default interface IGrid {
  isEmpty: boolean;
  reducedCells: ICell[];
}
