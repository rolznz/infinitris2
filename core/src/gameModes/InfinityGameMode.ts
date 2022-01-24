import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import { IGameMode } from '@models/IGameMode';
import IGrid from '@models/IGrid';
import { IPlayer } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

export class InfinityGameMode implements IGameMode {
  constructor(simulation: ISimulation) {}
  step(): void {}
  onSimulationInit(simulation: ISimulation): void {}
  onSimulationStep(simulation: ISimulation): void {}
  onSimulationNextDay(simulation: ISimulation): void {}
  onPlayerCreated(player: IPlayer): void {}
  onPlayerDestroyed(player: IPlayer): void {}
  onPlayerToggleChat(player: IPlayer, wasCancelled: boolean): void {}
  onBlockCreated(block: IBlock): void {}
  onBlockCreateFailed(block: IBlock): void {}
  onBlockPlaced(block: IBlock): void {}
  onBlockMoved(block: IBlock, dx: number, dy: number, dr: number): void {}
  onBlockDropped(block: IBlock): void {}
  onBlockDied(block: IBlock): void {}
  onBlockDestroyed(block: IBlock): void {}
  onLineCleared(row: number): void {}
  onGridCollapsed(grid: IGrid): void {}
  onCellBehaviourChanged(
    cell: ICell,
    previousBehaviour: ICellBehaviour
  ): void {}
}