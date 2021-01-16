import ICellBehaviour from '@models/ICellBehaviour';
import TutorialCellType from '@models/TutorialCellType';
import KeyBehaviour from './KeyBehaviour';
import LaserBehaviour from './LaserBehaviour';
import LockBehaviour from './LockBehaviour';
import ICell from '@models/ICell';
import NormalCellBehaviour from './NormalCellBehaviour';
import TutorialFinishBehaviour from './TutorialFinishBehaviour';

const redColor = 0xff0000;
const blueColor = 0x0000ff;
const greenColor = 0x00ff00;
const yellowColor = 0xffff00;

// TODO: move this to tutorial
export default function createBehaviour(
  cell: ICell,
  tutorialCellType: TutorialCellType
): ICellBehaviour {
  switch (tutorialCellType) {
    case TutorialCellType.Empty:
    case TutorialCellType.Full:
      return new NormalCellBehaviour();
    case TutorialCellType.Laser:
      return new LaserBehaviour(cell);
    // TODO: find way to reduce duplication
    case TutorialCellType.RedKey:
      return new KeyBehaviour(redColor);
    case TutorialCellType.RedLock:
      return new LockBehaviour(cell, redColor);
    case TutorialCellType.GreenKey:
      return new KeyBehaviour(greenColor);
    case TutorialCellType.GreenLock:
      return new LockBehaviour(cell, greenColor);
    case TutorialCellType.BlueKey:
      return new KeyBehaviour(blueColor);
    case TutorialCellType.BlueLock:
      return new LockBehaviour(cell, blueColor);
    case TutorialCellType.YellowKey:
      return new KeyBehaviour(yellowColor);
    case TutorialCellType.YellowLock:
      return new LockBehaviour(cell, yellowColor);
    case TutorialCellType.Finish:
      return new TutorialFinishBehaviour();
    default:
      throw new Error('Unknown tutorial cell type: ' + tutorialCellType);
  }
}
