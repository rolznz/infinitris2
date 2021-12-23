import IBlockEventListener from './IBlockEventListener';
import ICellEventListener from './ICellEventListener';
import IGrid from './IGrid';
import IGridEventListener from './IGridEventListener';
import IPlayer from './IPlayer';

export default interface ISimulation
  extends IBlockEventListener,
    ICellEventListener,
    IGridEventListener {
  startInterval(): void;
  stopInterval(): void;
  addPlayer(player: IPlayer): void;
  runningTime: number;
  grid: IGrid;
}
