import { IGameMode } from '@models/IGameMode';
import ISimulation from '@models/ISimulation';

type BattleGameModeState = {};
export class BattleGameMode implements IGameMode<BattleGameModeState> {
  constructor(simulation: ISimulation) {}
  step(): void {}

  serialize(): BattleGameModeState {
    return {};
  }
  deserialize(state: BattleGameModeState) {}

  get hasRounds(): boolean {
    return false;
  }
  get hasHealthbars(): boolean {
    return false;
  }
  get hasLineClearReward(): boolean {
    return false;
  }
}
