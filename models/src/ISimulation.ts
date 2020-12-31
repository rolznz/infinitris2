import IBlockEventListener from './IBlockEventListener';
import IGridEventListener from './IGridEventListener';

export default interface ISimulation
  extends IBlockEventListener,
    IGridEventListener {
  startInterval(): void;
  stopInterval(): void;
}
