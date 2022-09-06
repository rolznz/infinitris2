import useIngameStore from '@/state/IngameStore';
import { ISimulation, ISimulationEventListener } from 'infinitris2-models';

export const simulationMessageListener: Partial<ISimulationEventListener> = {
  onSimulationMessage(_simulation: ISimulation, message: string) {
    useIngameStore.getState().addToMessageLog({
      createdTime: Date.now(),
      message,
      color: '#ff0000',
    });
  },
};
