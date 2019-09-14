import ISimulationEventListener from "./ISimulationEventListener";
import Grid from "./grid/Grid";
import Player from "./player/Player";
import Block from "./block/Block";
import IBlockEventListener from "./block/IBlockEventListener";
import IGridEventListener from "./grid/IGridEventListener";

export const FRAME_LENGTH: number = 1000 / 30;

export default class Simulation implements IBlockEventListener, IGridEventListener
{
    private _players: {[playerId: number]: Player};
    private _grid: Grid;
    private _eventListeners: ISimulationEventListener[];
    private _interval: NodeJS.Timeout;

    constructor(...eventListeners: ISimulationEventListener[])
    {
        this._eventListeners = eventListeners;
        this._players = {};
        console.log("Simulation loaded");
    }

    /**
     * Starts a simulation running.
     * @param grid The grid to run the simulation on.
     */
    start(grid: Grid)
    {
        this._grid = grid;
        this._interval = setInterval(this._step, FRAME_LENGTH);
        this._eventListeners.forEach(listener => listener.onSimulationStarted(this._grid));
    }

    stop()
    {
        clearInterval(this._interval);
    }

    addPlayer(player: Player)
    {
        this._players[player.id] = player;
    }

    removePlayer(playerId: number)
    {
        delete this._players[playerId];
    }

    getPlayerIds(): number[]
    {
        return Array.from(Object.entries(this._players).keys());
    }

    onBlockCreated = (block: Block) =>
    {
        this._eventListeners.forEach(listener => listener.onBlockCreated(block));
    }
    onBlockMoved = (block: Block) =>
    {
        this._eventListeners.forEach(listener => listener.onBlockMoved(block));
    }
    onBlockPlaced = (block: Block) =>
    {
        this._eventListeners.forEach(listener => listener.onBlockPlaced(block));
        this._grid.checkLineClears(block.cells.map(cell => cell.row).filter((row, i, rows) => rows.indexOf(row) === i));
    }
    onLineCleared(row: number)
    {
        this._eventListeners.forEach(listener => listener.onLineCleared(row));
    }

    private _step = () =>
    {
        Object.values(this._players).forEach(this._updatePlayer);
    }

    private _updatePlayer = (player: Player) =>
    {
        player.update(this._grid.cells);
    }
}