import ISimulation from '@models/ISimulation';

// rounds only applicable for certain game modes e.g. conquest
export interface IRoundEventListener {
  /**
   * Fired when a new round starts
   */
  onNextRound(simulation: ISimulation): void;

  /**
   * Fired when the current round ends
   */
  onEndRound(simulation: ISimulation): void;

  /**
   * Fired when the timer for the next round starts (either on end round, or enough players join the game)
   */
  onStartNextRoundTimer(simulation: ISimulation): void;
}
