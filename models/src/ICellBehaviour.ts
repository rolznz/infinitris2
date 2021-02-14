import { IBlock } from '../index';
import CellType from './CellType';

export default interface ICellBehaviour {
  step?(): void;
  onAddBlock?(block: IBlock): void;
  onRemoveBlock?(block: IBlock): void;
  color?: number;
  alpha: number;
  isPassable: boolean;
  type: CellType;
  requiresRerender?: boolean;
}
