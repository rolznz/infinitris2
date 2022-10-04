import ISimulationEventListener from '@models/ISimulationEventListener';

export interface IGameModeRenderer extends Partial<ISimulationEventListener> {
  resize(): void;
  tick?(): void;
}
