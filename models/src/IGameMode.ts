import ICell from '@models/ICell';
import { IPlayer } from '@models/IPlayer';
import ISimulationEventListener from '@models/ISimulationEventListener';

export interface IGameMode<GameModeState>
  extends Partial<ISimulationEventListener> {
  get hasRounds(): boolean;
  get hasHealthbars(): boolean;
  step(): void;
  serialize(): GameModeState;
  deserialize(state: GameModeState): void;
  checkMistake?(player: IPlayer, cells: ICell[], isMistake: boolean): boolean;
}
