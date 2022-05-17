enum ChallengeCellType {
  Empty = '0',
  Full = 'X',
  Laser = 'L',
  Deadly = 'D',
  RedKey = 'R',
  RedLock = 'r',
  GreenKey = 'G',
  GreenLock = 'g',
  BlueKey = 'B',
  BlueLock = 'b',
  YellowKey = 'Y',
  YellowLock = 'y',
  Finish = 'F',
  Wafer = 'W',
  Infection = 'I',
  // TODO: fans (up, down, left, right)
  // TODO: teleport (to, from)
  // TODO:
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
    case ChallengeCellType.GreenKey:
      return 'Green Key';
    case ChallengeCellType.GreenLock:
      return 'Green Lock';
    case ChallengeCellType.BlueKey:
      return 'Blue Key';
    case ChallengeCellType.BlueLock:
      return 'Blue Lock';
    case ChallengeCellType.YellowKey:
      return 'Yellow Key';
    case ChallengeCellType.YellowLock:
      return 'Yellow Lock';
    case ChallengeCellType.Finish:
      return 'Finish';
    case ChallengeCellType.Wafer:
      return 'Wafer';
    case ChallengeCellType.Infection:
      return 'Infection';
    default:
      throw new Error('No challenge cell type description for ' + type);
  }
}
