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
import { CustomizableInputAction } from '@models/InputAction';
import GestureBehaviour from '@core/grid/cell/behaviours/GestureBehaviour';
import ReverseLockBehaviour from '@core/grid/cell/behaviours/ReverseLockBehaviour';
import CheckpointBehaviour from '@core/grid/cell/behaviours/CheckpointBehaviour';
import SwitchBehaviour from '@core/grid/cell/behaviours/SwitchBehaviour';
import BridgeCreatorBehaviour from '@core/grid/cell/behaviours/BridgeCreatorBehaviour';

// currently keyColors must match lock colors and switch colors for behaviour to work (direct color match)
export const keyColors = {
  redColor: 0xff0000,
  blueColor: 0x0000ff,
  greenColor: 0x00ff00,
  yellowColor: 0xffff00,
};
export const lockColors = keyColors;
export const switchColors = keyColors;

export default function createBehaviourFromChallengeCellType(
  cell: ICell,
  grid: IGrid,
  challengeCellType: ChallengeCellType
): void {
  cell.behaviour = getBehaviour(cell, grid, challengeCellType);
  cell.extendTopRow = true;
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
    case ChallengeCellType.RedKey:
      return new KeyBehaviour(cell, keyColors.redColor);
    case ChallengeCellType.RedSwitch:
      return new SwitchBehaviour(cell, switchColors.redColor);
    case ChallengeCellType.RedLock:
      return new LockBehaviour(cell, grid, lockColors.redColor);
    case ChallengeCellType.ReverseRedLock:
      return new ReverseLockBehaviour(cell, grid, lockColors.redColor);
    case ChallengeCellType.GreenKey:
      return new KeyBehaviour(cell, keyColors.greenColor);
    case ChallengeCellType.GreenSwitch:
      return new SwitchBehaviour(cell, switchColors.greenColor);
    case ChallengeCellType.GreenLock:
      return new LockBehaviour(cell, grid, lockColors.greenColor);
    case ChallengeCellType.ReverseGreenLock:
      return new ReverseLockBehaviour(cell, grid, lockColors.greenColor);
    case ChallengeCellType.BlueKey:
      return new KeyBehaviour(cell, keyColors.blueColor);
    case ChallengeCellType.BlueSwitch:
      return new SwitchBehaviour(cell, switchColors.blueColor);
    case ChallengeCellType.BlueLock:
      return new LockBehaviour(cell, grid, lockColors.blueColor);
    case ChallengeCellType.ReverseBlueLock:
      return new ReverseLockBehaviour(cell, grid, lockColors.blueColor);
    case ChallengeCellType.YellowKey:
      return new KeyBehaviour(cell, keyColors.yellowColor);
    case ChallengeCellType.YellowSwitch:
      return new SwitchBehaviour(cell, switchColors.yellowColor);
    case ChallengeCellType.YellowLock:
      return new LockBehaviour(cell, grid, lockColors.yellowColor);
    case ChallengeCellType.ReverseYellowLock:
      return new ReverseLockBehaviour(cell, grid, lockColors.yellowColor);
    case ChallengeCellType.Finish:
      return new ChallengeFinishBehaviour();
    case ChallengeCellType.Wafer:
      return new WaferBehaviour(cell, grid);
    case ChallengeCellType.Infection:
      return new InfectionBehaviour(cell, grid);
    case ChallengeCellType.RockGenerator:
      return new RockGeneratorBehaviour(cell, grid);
    case ChallengeCellType.GestureMoveLeft:
      return new GestureBehaviour(CustomizableInputAction.MoveLeft);
    case ChallengeCellType.GestureMoveRight:
      return new GestureBehaviour(CustomizableInputAction.MoveRight);
    case ChallengeCellType.GestureMoveDown:
      return new GestureBehaviour(CustomizableInputAction.MoveDown);
    case ChallengeCellType.GestureRotateClockwise:
      return new GestureBehaviour(CustomizableInputAction.RotateClockwise);
    case ChallengeCellType.GestureRotateAnticlockwise:
      return new GestureBehaviour(CustomizableInputAction.RotateAnticlockwise);
    case ChallengeCellType.GestureRotateDownClockwise:
      return new GestureBehaviour(
        CustomizableInputAction.RotateClockwise,
        CustomizableInputAction.MoveDown
      );
    case ChallengeCellType.GestureRotateDownAnticlockwise:
      return new GestureBehaviour(
        CustomizableInputAction.RotateAnticlockwise,
        CustomizableInputAction.MoveDown
      );
    case ChallengeCellType.GestureDrop:
      return new GestureBehaviour(CustomizableInputAction.Drop);
    case ChallengeCellType.Checkpoint:
      return new CheckpointBehaviour(cell);
    case ChallengeCellType.BridgeCreator:
      return new BridgeCreatorBehaviour(cell, grid);
  }
}
