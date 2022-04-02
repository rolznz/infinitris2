import ISimulationEventListener from '@models/ISimulationEventListener';

export interface IGameMode<GameModeState>
  extends Partial<ISimulationEventListener> {
  get hasRounds(): boolean;
  get hasHealthbars(): boolean;
  step(): void;
  serialize(): GameModeState;
  deserialize(state: GameModeState): void;
}
