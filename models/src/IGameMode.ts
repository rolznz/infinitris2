import ISimulationEventListener from '@models/ISimulationEventListener';

export interface IGameMode<GameModeState>
  extends Partial<ISimulationEventListener> {
  step(): void;
  serialize(): GameModeState;
  deserialize(state: GameModeState): void;
}
