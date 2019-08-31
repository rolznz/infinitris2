import ISimulationEventListener from "./ISimulationEventListener";
import Player from "./player/Player";

export default class Simulation
{
    _players: {[playerId: number]: Player};
    private _eventListeners: ISimulationEventListener[];

    constructor(...eventListeners: ISimulationEventListener[])
    {
        this._eventListeners = eventListeners;
        this._players = {};
        console.log("Simulation loaded");
    }

    /**
     * Starts a simulation running.
     */
    start()
    // tslint:disable-next-line: no-empty
    {

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
}