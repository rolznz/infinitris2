import useIngameStore from '@/state/IngameStore';
import {
  hexToString,
  IPlayer,
  ISimulation,
  ISimulationEventListener,
} from 'infinitris2-models';

export const simulationMessageListener: Partial<ISimulationEventListener> = {
  onSimulationMessage(
    _simulation: ISimulation,
    message: string,
    player: IPlayer | undefined,
    _isSynced: boolean
  ) {
    useIngameStore.getState().addToMessageLog({
      createdTime: Date.now(),
      message,
      nickname: player ? player.nickname : '[SERVER]',
      color: player ? hexToString(player.color) : '#ff0000',
    });
  },
};
