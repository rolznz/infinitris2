import { IBlock } from '.';
import IBlockEventListener from './IBlockEventListener';
import ICell from './ICell';
import { SimulationSettings } from './SimulationSettings';

export default interface IPlayer {
  get nickname(): string;
  get color(): number;
  get id(): number;

  get block(): IBlock | undefined;
  get score(): number;
  get estimatedSpawnDelay(): number;

  update(cells: ICell[][], settings: SimulationSettings): void;
  addEventListener(eventListener: IBlockEventListener): void;
}
