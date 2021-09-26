import IBlockEventListener from './IBlockEventListener';
import ICellEventListener from './ICellEventListener';
import IGrid from './IGrid';
import IGridEventListener from './IGridEventListener';

export default interface ISimulation
  extends IBlockEventListener,
    ICellEventListener,
    IGridEventListener {
  startInterval(): void;
  stopInterval(): void;
  runningTime: number;
  grid: IGrid;
}
