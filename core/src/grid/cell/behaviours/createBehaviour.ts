import CellType from '../CellType';
import ICellBehaviour from './ICellBehaviour';
import LaserBehaviour from './LaserBehaviour';

export default function createBehaviour(
  cellType: CellType
): ICellBehaviour | undefined {
  switch (cellType) {
    case CellType.Laser:
      return new LaserBehaviour();
    default:
      return undefined;
  }
}
