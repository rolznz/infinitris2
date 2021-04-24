import { ICellEventListener } from '../index';
import IBlockEventListener from './IBlockEventListener';
import IGridEventListener from './IGridEventListener';
import ISimulation from './ISimulation';

export default interface ISimulationEventListener
  extends IBlockEventListener,
    ICellEventListener,
    IGridEventListener {
  /**
   * Called when the simulation first starts running.
   */
  onSimulationInit(simulation: ISimulation): void;

  /**
   * Called after each simulation step.
   */
  onSimulationStep(simulation: ISimulation): void;
}
