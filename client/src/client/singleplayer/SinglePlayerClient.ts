import Simulation from '@core/Simulation';
import IRenderer from '@src/rendering/IRenderer';
import MinimalRenderer from '@src/rendering/renderers/minimal/MinimalRenderer';
import ControllablePlayer from '@src/ControllablePlayer';
import Grid from '@core/grid/Grid';
import Input from '@src/input/Input';
import IClient from '../../../../models/src/IClient';
import ISimulationEventListener from '@models/ISimulationEventListener';
import IBlock from '@models/IBlock';
import ControlSettings from '@models/ControlSettings';

export default class SinglePlayerClient
  implements IClient, ISimulationEventListener {
  // FIXME: restructure to not require definite assignment
  private _renderer!: IRenderer;
  private _simulation!: Simulation;
  private _input!: Input;
  private _controls?: ControlSettings;
  constructor(controls?: ControlSettings) {
    this._controls = controls;
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
  onBlockCreated(block: IBlock) {}

  /**
   * @inheritdoc
   */
  onBlockCreateFailed(block: IBlock) {}
  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {}
  /**
   * @inheritdoc
   */
  onBlockMoved(block: IBlock) {}
  /**
   * @inheritdoc
   */
  onBlockDied(block: IBlock) {}
  /**
   * @inheritdoc
   */
  onLineCleared(row: number) {}

  /**
   * @inheritdoc
   */
  onBlockWrapped(block: IBlock, wrapIndexChange: number) {}

  /**
   * @inheritdoc
   */
  restart(): void {
    throw new Error('Method not implemented.');
  }

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
    this._input = new Input(this._simulation, player, this._controls);
  }
}
