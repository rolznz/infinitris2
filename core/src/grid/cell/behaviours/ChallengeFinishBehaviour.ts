import CellType from '@models/CellType';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';

export default class ChallengeFinishBehaviour implements ICellBehaviour {
  constructor() {}
  get color(): number {
    return 0x00ff00;
  }

  get isPassable(): boolean {
    return true;
  }

  clone(_forCell: ICell): ICellBehaviour {
    throw new Error('clone unsupported');
  }

  get isReplaceable(): boolean {
    return false;
  }

  get type(): CellType {
    return CellType.FinishChallenge;
  }

  get alpha(): number {
    return 0.25;
  }
}
