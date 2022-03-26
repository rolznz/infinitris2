import { IGameMode } from '@models/IGameMode';
import ISimulation from '@models/ISimulation';

type InfinityGameModeState = {};
export class InfinityGameMode implements IGameMode<InfinityGameModeState> {
  constructor(simulation: ISimulation) {}
  step(): void {}

  serialize(): InfinityGameModeState {
    return {};
  }
  deserialize(state: InfinityGameModeState) {}

  get hasRounds(): boolean {
    return false;
  }
}
