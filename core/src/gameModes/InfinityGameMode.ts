import { GameModeEvent } from '@models/GameModeEvent';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import { IGameMode } from '@models/IGameMode';
import IGrid from '@models/IGrid';
import { IPlayer } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

type InfinityGameModeState = {};
export class InfinityGameMode implements IGameMode<InfinityGameModeState> {
  constructor(simulation: ISimulation) {}
  step(): void {}

  serialize(): InfinityGameModeState {
    return {};
  }
  deserialize(state: InfinityGameModeState) {}
}
