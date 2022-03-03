import { IPlayerEventListener } from '@models/IPlayerEventListener';
import IBlockEventListener from './IBlockEventListener';
import ICellEventListener from './ICellEventListener';
import IGridEventListener from './IGridEventListener';
import ISimulation from './ISimulation';

export default interface ISimulationEventListener
  extends IPlayerEventListener,
    IGridEventListener {
  /**
   * Called when the simulation first starts running.
   */
  onSimulationInit(simulation: ISimulation): void;

  /**
   * Called after each single simulation step/frame (optimally 60 times per second).
   */
  onSimulationStep(simulation: ISimulation): void;

  onSimulationNextRound(simulation: ISimulation): void;
}
