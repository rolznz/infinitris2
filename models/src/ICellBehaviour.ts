import CellType from './CellType';
import IBlock from './IBlock';
import ICell from './ICell';

export default interface ICellBehaviour {
  step?(): void;
  onAddBlock?(block: IBlock): void;
  onRemoveBlock?(block: IBlock): void;
  clone(forCell: ICell): ICellBehaviour;
  color?: number;
  alpha: number;
  isPassable: boolean;
  isReplaceable: boolean;
  type: CellType;
  requiresRerender?: boolean;
}
