import { IBlock } from '.';
import IBlockEventListener from './IBlockEventListener';
import ICell from './ICell';
import { SimulationSettings } from './SimulationSettings';

export default interface IPlayer {
  nickname: string;
  color: number;
  id: number;

  get block(): IBlock | undefined;

  update(cells: ICell[][], settings: SimulationSettings): void;
  addEventListener(eventListener: IBlockEventListener): void;
}
