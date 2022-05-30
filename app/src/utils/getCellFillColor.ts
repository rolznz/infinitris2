import { ChallengeCellType } from 'infinitris2-models';

export function getCellFillColor(cellType: ChallengeCellType): string {
  switch (cellType) {
    case ChallengeCellType.Laser:
    case ChallengeCellType.Deadly:
      return '#c2261f';
    case ChallengeCellType.RedKey:
    case ChallengeCellType.RedLock:
      return '#f00';
    case ChallengeCellType.BlueKey:
    case ChallengeCellType.BlueLock:
      return '#00f';
    case ChallengeCellType.GreenKey:
    case ChallengeCellType.GreenLock:
      return '#0f0';
    case ChallengeCellType.YellowKey:
    case ChallengeCellType.YellowLock:
      return '#ff0';
    case ChallengeCellType.Finish:
      return '#aaffaa';
    case ChallengeCellType.SpawnLocation:
      return '#ffffff';
    case ChallengeCellType.RockGenerator:
      return '#49311d';
    case ChallengeCellType.Wafer:
      return '#d4bbb1';
    case ChallengeCellType.GestureMoveLeft:
    case ChallengeCellType.GestureMoveRight:
    case ChallengeCellType.GestureMoveDown:
    case ChallengeCellType.GestureRotateClockwise:
    case ChallengeCellType.GestureRotateAnticlockwise:
    case ChallengeCellType.GestureDrop:
      return '#f0f';
    default:
      return '#aaaaaa';
  }
}
