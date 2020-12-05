import Simulation from '@core/Simulation';
import IRenderer from '@src/rendering/IRenderer';
import MinimalRenderer from '@src/rendering/renderers/minimal/MinimalRenderer';
import ControllablePlayer from '@src/ControllablePlayer';
import Grid from '@core/grid/Grid';
import Input from '@src/input/Input';
import IClient from '../Client';
import Tutorial from './Tutorial';

export default class SinglePlayerClient implements IClient {
  private _renderer: IRenderer;
  private _simulation: Simulation;
  private _input: Input;
  constructor(tutorial?: Tutorial) {
    this._create(tutorial);
  }

  /**
   * @inheritdoc
   */
  destroy() {
    this._simulation.stop();
    this._renderer.destroy();
  }

  private async _create(tutorial?: Tutorial) {
    this._renderer = new MinimalRenderer();
    await this._renderer.create();
    this._simulation = new Simulation(this._renderer);
    const grid = new Grid(
      tutorial?.gridWidth,
      tutorial?.gridHeight,
      this._simulation
    );
    this._simulation.setGrid(grid);
    const playerId = 0;
    const player = new ControllablePlayer(playerId, this._simulation);
    this._simulation.addPlayer(player);
    if (tutorial) {
      this._simulation.step();
    } else {
      this._simulation.start();
    }
    this._input = new Input(grid, player);
  }
}
