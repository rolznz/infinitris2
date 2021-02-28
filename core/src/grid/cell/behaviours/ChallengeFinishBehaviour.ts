import CellType from '@models/CellType';
import ICellBehaviour from '@models/ICellBehaviour';

export default class ChallengeFinishBehaviour implements ICellBehaviour {
  constructor() {}
  get color(): number {
    return 0x00ff00;
  }

  get isPassable(): boolean {
    return true;
  }

  get type(): CellType {
    return CellType.FinishChallenge;
  }

  get alpha(): number {
    return 0.25;
  }
}
