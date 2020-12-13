import Simulation from '@core/Simulation';
import IRenderer from '@src/rendering/IRenderer';
import MinimalRenderer from '@src/rendering/renderers/minimal/MinimalRenderer';
import ControllablePlayer from '@src/ControllablePlayer';
import Grid from '@core/grid/Grid';
import Input from '@src/input/Input';
import IClient from '../Client';
import ISimulationEventListener from '@core/ISimulationEventListener';
import Block from '@core/block/Block';

export default class SinglePlayerClient
  implements IClient, ISimulationEventListener {
  private _renderer: IRenderer;
  private _simulation: Simulation;
  private _input: Input;
  constructor() {
    this._create();
  }

  /**
   * @inheritdoc
   */
  onSimulationInit(simulation: Simulation) {}
  /**
   * @inheritdoc
   */
  onSimulationStep(simulation: Simulation) {}

  /**
   * @inheritdoc
   */
  onBlockCreated(block: Block) {}
  /**
   * @inheritdoc
   */
  onBlockPlaced(block: Block) {}
  /**
   * @inheritdoc
   */
  onBlockMoved(block: Block) {}
  /**
   * @inheritdoc
   */
  onLineCleared(row: number) {}

  /**
   * @inheritdoc
   */
  destroy() {
    this._simulation.stopInterval();
    this._renderer.destroy();
    this._input.destroy();
  }

  private async _create() {
    this._renderer = new MinimalRenderer();
    await this._renderer.create();

    this._simulation = new Simulation(new Grid());
    this._simulation.addEventListener(this, this._renderer);

    this._simulation.init();
    const playerId = 0;
    const player = new ControllablePlayer(playerId, this._simulation);
    this._simulation.addPlayer(player);
    this._simulation.followPlayer(player);
    this._simulation.startInterval();
    this._input = new Input(this._simulation, player, undefined);
  }
}
