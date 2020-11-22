import Simulation from "@core/Simulation";
import IRenderer from "@src/rendering/IRenderer";
import MinimalRenderer from "@src/rendering/renderers/minimal/MinimalRenderer";
import ControllablePlayer from "@src/ControllablePlayer";
import Grid from "@core/grid/Grid";
import Input from "@src/input/Input";
import IClient from "./Client";

export default class SinglePlayerClient implements IClient
{
  private _renderer: IRenderer;
  private _simulation: Simulation;
  private _input: Input;
  constructor()
  {
    this._create();
  }

  /**
   * @inheritdoc
   */
  destroy() {
    this._simulation.stop();
    this._renderer.destroy();
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