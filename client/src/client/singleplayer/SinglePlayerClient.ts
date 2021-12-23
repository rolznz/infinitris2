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
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import IPlayer from '@models/IPlayer';
import Infinitris2Renderer from '@src/rendering/renderers/infinitris2/Infinitris2Renderer';
import { LaunchOptions } from '@models/IInfinitrisApi';
import { SimulationSettings } from '@models/SimulationSettings';

export default class SinglePlayerClient
  implements IClient, ISimulationEventListener
{
  // FIXME: restructure to not require definite assignment
  private _renderer!: IRenderer;
  private _simulation!: Simulation;
  private _input!: Input;
  private _controls?: ControlSettings;
  constructor(options: LaunchOptions) {
    this._controls = options.controls;
    this._create(options);
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
  onCellBehaviourChanged(_cell: ICell, _previousBehaviour: ICellBehaviour) {}

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

  private async _create(options: LaunchOptions) {
    this._renderer =
      options.rendererType === 'minimal'
        ? new MinimalRenderer()
        : new Infinitris2Renderer();
    await this._renderer.create();

    const simulationSettings: SimulationSettings = {
      randomBlockPlacement: true,
    };

    this._simulation = new Simulation(new Grid(40, 20), simulationSettings);
    this._simulation.addEventListener(this, this._renderer);
    if (options.listener) {
      this._simulation.addEventListener(options.listener);
    }

    this._simulation.init();
    const playerId = 0;
    const player = new ControllablePlayer(
      playerId,
      options.player?.nickname,
      options.player?.color
    );
    this._simulation.addPlayer(player);
    this._simulation.followPlayer(player);

    if (options.otherPlayers) {
      for (const otherPlayer of options.otherPlayers) {
        this._simulation.addPlayer(otherPlayer);
      }
    }

    this._simulation.startInterval();
    this._input = new Input(this._simulation, player, this._controls);
  }
}
