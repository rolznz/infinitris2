import ISimulationEventListener from '@models/ISimulationEventListener';

export interface IGameMode<GameModeState> extends ISimulationEventListener {
  step(): void;
  getCurrentState(): GameModeState;
  loadState(state: GameModeState): void;
}
