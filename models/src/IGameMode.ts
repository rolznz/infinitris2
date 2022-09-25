import ICell from '@models/ICell';
import { IPlayer } from '@models/IPlayer';
import ISimulationEventListener from '@models/ISimulationEventListener';

export interface IGameMode<GameModeState>
  extends Partial<ISimulationEventListener> {
  get hasRounds(): boolean;
  get hasHealthbars(): boolean;
  get hasLineClearReward(): boolean;
  get hasBlockPlacementReward(): boolean;
  get shouldNewPlayerSpectate(): boolean;
  step(): void;
  serialize(): GameModeState;
  deserialize(state: GameModeState): void;
  checkMistake?(player: IPlayer, cells: ICell[], isMistake: boolean): boolean;
  getFallDelay?(player: IPlayer): number;
  getSpawnDelay?(player: IPlayer): number;
  getMinPlayersForRound?(): number;
}
