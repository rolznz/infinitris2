import useIngameStore from '@/state/IngameStore';
import { ISimulation, ISimulationEventListener } from 'infinitris2-models';

function updateRound(simulation: ISimulation) {
  useIngameStore
    .getState()
    .setEndRoundDisplayOpen(
      simulation?.round?.isWaitingForNextRound ||
        (simulation?.round && !simulation.round.conditionsAreMet) ||
        false
    );
  useIngameStore
    .getState()
    .setRoundConditionsAreMet(simulation?.round?.conditionsAreMet || false);
}

export const roundListener: Partial<ISimulationEventListener> = {
  onNextRound: updateRound,
  onEndRound: updateRound,
  onStartNextRoundTimer: updateRound,
  onSimulationInit: (simulation) => {
    updateRound(simulation);
    setTimeout(() => updateRound(simulation), 1000);
  },
  onPlayerDestroyed: () => {
    setTimeout(() => {
      updateRound(useIngameStore.getState().simulation!);
    }, 1);
  },
};
