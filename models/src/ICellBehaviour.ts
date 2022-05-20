import ChallengeCellType from '@models/ChallengeCellType';
import CellType from './CellType';
import IBlock from './IBlock';
import ICell from './ICell';

export default interface ICellBehaviour {
  step?(): void;
  onAddBlock?(block: IBlock): void;
  onRemoveBlock?(block: IBlock): void;
  clone(forCell: ICell): ICellBehaviour;
  toChallengeCellType(): ChallengeCellType;
  color?: number;
  alpha: number;
  isPassable: boolean;
  isPassableWhileDropping?: boolean;
  isReplaceable: boolean;
  type: CellType;
  requiresRerender?: boolean;
}
