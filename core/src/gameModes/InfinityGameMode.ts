import { IGameMode } from '@models/IGameMode';
import ISimulation from '@models/ISimulation';

export class InfinityGameMode implements IGameMode {
  constructor(simulation: ISimulation) {}
  step(): void {}
}
