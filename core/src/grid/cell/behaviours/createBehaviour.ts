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

const redColor = 0xff0000;
const blueColor = 0x0000ff;
const greenColor = 0x00ff00;
const yellowColor = 0xffff00;

// TODO: move this to challenge
export default function createBehaviour(
  cell: ICell,
  grid: IGrid,
  challengeCellType: ChallengeCellType
): ICellBehaviour {
  switch (challengeCellType) {
    case ChallengeCellType.Empty:
    case ChallengeCellType.Full:
      return new NormalCellBehaviour();
    case ChallengeCellType.Laser:
      return new LaserBehaviour(cell);
    case ChallengeCellType.Deadly:
      return new DeadlyBehaviour(cell);
    // TODO: find way to reduce duplication
    case ChallengeCellType.RedKey:
      return new KeyBehaviour(redColor);
    case ChallengeCellType.RedLock:
      return new LockBehaviour(cell, grid, redColor);
    case ChallengeCellType.GreenKey:
      return new KeyBehaviour(greenColor);
    case ChallengeCellType.GreenLock:
      return new LockBehaviour(cell, grid, greenColor);
    case ChallengeCellType.BlueKey:
      return new KeyBehaviour(blueColor);
    case ChallengeCellType.BlueLock:
      return new LockBehaviour(cell, grid, blueColor);
    case ChallengeCellType.YellowKey:
      return new KeyBehaviour(yellowColor);
    case ChallengeCellType.YellowLock:
      return new LockBehaviour(cell, grid, yellowColor);
    case ChallengeCellType.Finish:
      return new ChallengeFinishBehaviour();
    case ChallengeCellType.Wafer:
      return new WaferBehaviour(cell, grid);
    case ChallengeCellType.Infection:
      return new InfectionBehaviour(cell, grid);
    default:
      throw new Error('Unknown challenge cell type: ' + challengeCellType);
  }
}
