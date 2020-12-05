import Grid from './grid/Grid';
import IBlockEventListener from './block/IBlockEventListener';
import IGridEventListener from './grid/IGridEventListener';
import Simulation from './Simulation';

export default interface ISimulationEventListener
  extends IBlockEventListener,
    IGridEventListener {
  /**
   * Called when the simulation first starts running.
   */
  onSimulationInit(simulation: Simulation);

  /**
   * Called after each simulation step.
   */
  onSimulationStep(simulation: Simulation);
}
