import Layout from './Layout';
import ICell from './ICell';
import IPlayer from './IPlayer';
import { SimulationSettings } from './SimulationSettings';

export default interface IBlock {
  player: IPlayer;
  cells: ICell[];
  width: number;
  height: number;
  row: number;
  column: number;
  centreX: number;
  get isDropping(): boolean;
  get initialLayout(): Layout;
  get layout(): Layout;
  update(gridCells: ICell[][], simulationSettings: SimulationSettings): void;
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
