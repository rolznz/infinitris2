import ICell from './ICell';
import IPlayer from './IPlayer';
import ISimulationSettings from './ISimulationSettings';

export default interface IBlock {
  player: IPlayer;
  cells: ICell[];
  width: number;
  height: number;
  row: number;
  column: number;
  centreX: number;
  isDropping: boolean;
  update(gridCells: ICell[][], simulationSettings: ISimulationSettings): void;
  move(
    gridCells: ICell[][],
    dx: number,
    dy: number,
    dr: number,
    force?: boolean
  ): boolean;
  drop(): void;
  cancelDrop(): void;
  slowDown(row: number): void;
  die(): void;
}
