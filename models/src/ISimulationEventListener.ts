import { IGameModeEventListener } from '@models/IGameModeEventListener';
import { IPlayerEventListener } from '@models/IPlayerEventListener';
import IBlockEventListener from './IBlockEventListener';
import ICellEventListener from './ICellEventListener';
import IGridEventListener from './IGridEventListener';
import ISimulation from './ISimulation';

export default interface ISimulationEventListener
  extends IPlayerEventListener,
    IGridEventListener,
    IGameModeEventListener {
  /**
   * Fired when the simulation first starts running.
   */
  onSimulationInit(simulation: ISimulation): void;

  /**
   * Fired after each single simulation step/frame (optimally 60 times per second).
   */
  onSimulationStep(simulation: ISimulation): void;

  /**
   * Fired when a new round starts (only applicable for certain game modes e.g. conquest)
   */
  onSimulationNextRound(simulation: ISimulation): void;
}
