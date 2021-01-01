import ICell from './ICell';
import ISimulationSettings from './ISimulationSettings';

export default interface IBlock {
  playerId: number;
  cells: ICell[];
  color: number;
  width: number;
  height: number;
  row: number;
  column: number;
  update(gridCells: ICell[][], simulationSettings: ISimulationSettings): void;
  move(
    gridCells: ICell[][],
    dx: number,
    dy: number,
    dr: number,
    force?: boolean
  ): boolean;
  drop(): void;
  die(): void;
}
