enum ChallengeCellType {
  Empty = '0',
  Full = 'X',
  Laser = 'L',
  Deadly = 'D',
  RedKey = 'R',
  RedLock = 'r',
  ReverseRedLock = 'd',
  RedSwitch = 'h',
  GreenKey = 'G',
  GreenLock = 'g',
  ReverseGreenLock = 'n',
  GreenSwitch = 'H',
  BlueKey = 'B',
  BlueLock = 'b',
  ReverseBlueLock = 'e',
  BlueSwitch = 'c',
  YellowKey = 'Y',
  YellowLock = 'y',
  ReverseYellowLock = 'w',
  YellowSwitch = 't',
  Finish = 'F',
  Wafer = 'W',
  Infection = 'I',
  RockGenerator = 'S',
  SpawnLocation = 's',
  GestureMoveLeft = '1',
  GestureMoveRight = '2',
  GestureMoveDown = '3',
  GestureRotateClockwise = '4',
  GestureRotateAnticlockwise = '5',
  GestureDrop = '6',
  Checkpoint = 'C',
}
const duplicateChallengeCellTypeValue = Object.values(ChallengeCellType).find(
  (v, i, a) => a.indexOf(v) !== i
);
if (duplicateChallengeCellTypeValue) {
  throw new Error(
    'Duplicate challenge cell type value: ' + duplicateChallengeCellTypeValue
  );
}

export default ChallengeCellType;

export function getChallengeCellTypeDescription(
  type: ChallengeCellType
): string {
  switch (type) {
    case ChallengeCellType.Empty:
      return 'Empty';
    case ChallengeCellType.Full:
      return 'Full';
    case ChallengeCellType.Laser:
      return 'Laser';
    case ChallengeCellType.Deadly:
      return 'Deadly';
    case ChallengeCellType.RedKey:
      return 'Red Key';
    case ChallengeCellType.RedLock:
      return 'Red Lock';
    case ChallengeCellType.ReverseRedLock:
      return 'Reverse Red Lock';
    case ChallengeCellType.RedSwitch:
      return 'Red Switch';
    case ChallengeCellType.GreenKey:
      return 'Green Key';
    case ChallengeCellType.GreenLock:
      return 'Green Lock';
    case ChallengeCellType.ReverseGreenLock:
      return 'Reverse Green Lock';
    case ChallengeCellType.GreenSwitch:
      return 'Green Switch';
    case ChallengeCellType.BlueKey:
      return 'Blue Key';
    case ChallengeCellType.BlueLock:
      return 'Blue Lock';
    case ChallengeCellType.ReverseBlueLock:
      return 'Reverse Blue Lock';
    case ChallengeCellType.BlueSwitch:
      return 'Blue Switch';
    case ChallengeCellType.YellowKey:
      return 'Yellow Key';
    case ChallengeCellType.YellowLock:
      return 'Yellow Lock';
    case ChallengeCellType.ReverseYellowLock:
      return 'Reverse Yellow Lock';
    case ChallengeCellType.YellowSwitch:
      return 'Yellow Switch';
    case ChallengeCellType.Finish:
      return 'Finish';
    case ChallengeCellType.Wafer:
      return 'Wafer';
    case ChallengeCellType.Infection:
      return 'Infection';
    case ChallengeCellType.RockGenerator:
      return 'Rock Generator';
    case ChallengeCellType.SpawnLocation:
      return 'Spawn Location';
    case ChallengeCellType.GestureMoveLeft:
      return 'Gesture MoveLeft';
    case ChallengeCellType.GestureMoveRight:
      return 'Gesture MoveRight';
    case ChallengeCellType.GestureMoveDown:
      return 'Gesture MoveDown';
    case ChallengeCellType.GestureRotateClockwise:
      return 'Gesture RotateClockwise';
    case ChallengeCellType.GestureRotateAnticlockwise:
      return 'Gesture RotateAnticlockwise';
    case ChallengeCellType.GestureDrop:
      return 'Gesture Drop';
    case ChallengeCellType.Checkpoint:
      return 'Checkpoint';
  }
}

export function isChallengeCellTypeEnabled(type: ChallengeCellType): boolean {
  if (type === ChallengeCellType.Laser) {
    return false;
  }
  return true;
}
