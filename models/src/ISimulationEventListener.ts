import { IGameModeEventListener } from '@models/IGameModeEventListener';
import { IPlayerEventListener } from '@models/IPlayerEventListener';
import { IRoundEventListener } from '@models/IRoundEventListener';
import IGridEventListener from './IGridEventListener';
import ISimulation from './ISimulation';

export default interface ISimulationEventListener
  extends IPlayerEventListener,
    IGridEventListener,
    IGameModeEventListener,
    IRoundEventListener {
  /**
   * Fired when the simulation first starts running.
   */
  onSimulationInit(simulation: ISimulation): void;

  /**
   * Fired before each single simulation step/frame (optimally 60 times per second).
   */
  onSimulationPreStep(simulation: ISimulation): void;
  /**
   * Fired after each single simulation step/frame (optimally 60 times per second).
   */
  onSimulationStep(simulation: ISimulation): void;
}
