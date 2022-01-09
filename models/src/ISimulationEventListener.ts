import IBlockEventListener from './IBlockEventListener';
import ICellEventListener from './ICellEventListener';
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
   * Called after each single simulation step/frame (optimally 60 times per second).
   */
  onSimulationStep(simulation: ISimulation): void;

  onSimulationNextDay(simulation: ISimulation): void;
}
