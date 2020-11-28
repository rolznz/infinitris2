import Grid from './grid/Grid';
import IBlockEventListener from './block/IBlockEventListener';
import IGridEventListener from './grid/IGridEventListener';

export default interface ISimulationEventListener
  extends IBlockEventListener,
    IGridEventListener {
  /**
   * Called when the simulation first starts running.
   *
   * @param grid The grid on which the simulation runs
   */
  onSimulationStarted(grid: Grid);
}
