import { IBlock, ICell } from '../index';
import CellType from './CellType';

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
