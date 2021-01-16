import CellType from './CellType';
import ICell from './ICell';

export default interface ICellBehaviour {
  step?(gridCells: ICell[]): void;
  color?: number;
  alpha: number;
  isPassable: boolean;
  type: CellType;
  requiresRerender?: boolean;
}
