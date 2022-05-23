import ICellBehaviour from '@models/ICellBehaviour';
import ChallengeCellType from '@models/ChallengeCellType';
import KeyBehaviour from './KeyBehaviour';
import LaserBehaviour from './LaserBehaviour';
import LockBehaviour from './LockBehaviour';
import ICell from '@models/ICell';
import NormalCellBehaviour from './NormalCellBehaviour';
import ChallengeFinishBehaviour from './ChallengeFinishBehaviour';
import DeadlyBehaviour from './DeadlyBehaviour';
import WaferBehaviour from './WaferBehaviour';
import IGrid from '@models/IGrid';
import InfectionBehaviour from './InfectionBehaviour';
import RockGeneratorBehaviour from '@core/grid/cell/behaviours/RockGeneratorBehaviour';
import SpawnLocationCellBehaviour from '@core/grid/cell/behaviours/SpawnLocationCellBehaviour';

export const keyColors = {
  redColor: 0xff0000,
  blueColor: 0x0000ff,
  greenColor: 0x00ff00,
  yellowColor: 0xffff00,
};
export const lockColors = keyColors;

export default function createBehaviourFromChallengeCellType(
  cell: ICell,
  grid: IGrid,
  challengeCellType: ChallengeCellType
): void {
  cell.behaviour = getBehaviour(cell, grid, challengeCellType);
  if (challengeCellType === ChallengeCellType.Full) {
    cell.isEmpty = false;
  } else if (challengeCellType === ChallengeCellType.Empty) {
    cell.isEmpty = true;
  }
}
function getBehaviour(
  cell: ICell,
  grid: IGrid,
  challengeCellType: ChallengeCellType
): ICellBehaviour {
  switch (challengeCellType) {
    case ChallengeCellType.Empty:
    case ChallengeCellType.Full:
      return new NormalCellBehaviour(cell);
    case ChallengeCellType.SpawnLocation:
      return new SpawnLocationCellBehaviour(cell);
    case ChallengeCellType.Laser:
      return new LaserBehaviour(cell);
    case ChallengeCellType.Deadly:
      return new DeadlyBehaviour(cell);
    // TODO: find way to reduce duplication
    case ChallengeCellType.RedKey:
      return new KeyBehaviour(keyColors.redColor);
    case ChallengeCellType.RedLock:
      return new LockBehaviour(cell, grid, lockColors.redColor);
    case ChallengeCellType.GreenKey:
      return new KeyBehaviour(keyColors.greenColor);
    case ChallengeCellType.GreenLock:
      return new LockBehaviour(cell, grid, lockColors.greenColor);
    case ChallengeCellType.BlueKey:
      return new KeyBehaviour(keyColors.blueColor);
    case ChallengeCellType.BlueLock:
      return new LockBehaviour(cell, grid, lockColors.blueColor);
    case ChallengeCellType.YellowKey:
      return new KeyBehaviour(keyColors.yellowColor);
    case ChallengeCellType.YellowLock:
      return new LockBehaviour(cell, grid, lockColors.yellowColor);
    case ChallengeCellType.Finish:
      return new ChallengeFinishBehaviour();
    case ChallengeCellType.Wafer:
      return new WaferBehaviour(cell, grid);
    case ChallengeCellType.Infection:
      return new InfectionBehaviour(cell, grid);
    case ChallengeCellType.RockGenerator:
      return new RockGeneratorBehaviour(cell, grid);
    default:
      throw new Error('Unknown challenge cell type: ' + challengeCellType);
  }
}