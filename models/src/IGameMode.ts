import ISimulationEventListener from '@models/ISimulationEventListener';

export interface IGameMode extends ISimulationEventListener {
  step(): void;
}
