import Simulation from "@core/Simulation";
import "../styles/client.css";
import IRenderer from "./rendering/IRenderer";
import MinimalRenderer from "./rendering/renderers/minimal/MinimalRenderer";
import ControllablePlayer from "./ControllablePlayer";
import Grid from "@core/grid/Grid";
import Input from "./input/Input";

export default class SinglePlayerClient
{
    private _renderer: IRenderer;
    private _simulation: Simulation;
    private _input: Input;
    constructor()
    {
        this._create();
    }

    private async _create()
    {
        this._renderer = new MinimalRenderer();
        await this._renderer.create();
        this._simulation = new Simulation(this._renderer);
        const playerId = 0;
        const player = new ControllablePlayer(playerId, this._simulation);
        this._simulation.addPlayer(player);
        const grid = new Grid(undefined, undefined, this._simulation);
        this._simulation.start(grid);
        this._input = new Input(grid, player);
    }
}