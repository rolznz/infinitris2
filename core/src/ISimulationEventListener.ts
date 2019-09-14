import Grid from "./grid/Grid";
import IBlockEventListener from "./block/IBlockEventListener";
import IGridEventListener from "./grid/IGridEventListener";

export default interface ISimulationEventListener extends IBlockEventListener, IGridEventListener
{
    onSimulationStarted(grid: Grid): void;
}