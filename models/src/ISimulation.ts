import IBlockEventListener from './IBlockEventListener';
import IGrid from './IGrid';
import IGridEventListener from './IGridEventListener';

export default interface ISimulation
  extends IBlockEventListener,
    IGridEventListener {
  startInterval(): void;
  stopInterval(): void;
  runningTime: number;
  grid: IGrid;
}
