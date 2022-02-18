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
  onSimulationInit(simulation: ISimulation): void {}
  onSimulationStep(simulation: ISimulation): void {}
  onSimulationNextDay(simulation: ISimulation): void {}
  onSimulationNextRound(simulation: ISimulation): void {}
  onPlayerCreated(player: IPlayer): void {}
  onPlayerDestroyed(player: IPlayer): void {}
  onPlayerToggleChat(player: IPlayer, wasCancelled: boolean): void {}
  onPlayerToggleSpectating(player: IPlayer): void {}
  onBlockCreated(block: IBlock): void {}
  onBlockCreateFailed(block: IBlock): void {}
  onBlockPlaced(block: IBlock): void {}
  onBlockMoved(block: IBlock, dx: number, dy: number, dr: number): void {}
  onBlockDropped(block: IBlock): void {}
  onBlockDied(block: IBlock): void {}
  onBlockDestroyed(block: IBlock): void {}
  onLineCleared(row: number): void {}
  onGridCollapsed(grid: IGrid): void {}
  onGridReset(grid: IGrid): void {}
  onCellBehaviourChanged(
    cell: ICell,
    previousBehaviour: ICellBehaviour
  ): void {}

  onCellIsEmptyChanged(cell: ICell): void {}

  getCurrentState(): InfinityGameModeState {
    return {};
  }
  loadState(state: InfinityGameModeState) {}
}
