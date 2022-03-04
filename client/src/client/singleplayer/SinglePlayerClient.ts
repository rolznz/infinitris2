import Simulation from '@core/Simulation';
import MinimalRenderer from '@src/rendering/renderers/minimal/MinimalRenderer';
import ControllablePlayer from '@src/ControllablePlayer';
import Grid from '@core/grid/Grid';
import Input from '@src/input/Input';
import ISimulationEventListener from '@models/ISimulationEventListener';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import { IPlayer } from '@models/IPlayer';
import Infinitris2Renderer from '@src/rendering/renderers/infinitris2/Infinitris2Renderer';
import { ClientApiConfig, LaunchOptions } from '@models/IClientApi';
import { SimulationSettings } from '@models/SimulationSettings';
import AIPlayer from '@core/player/AIPlayer';
import { stringToHex } from '@models/util/stringToHex';
import { colors } from '@models/colors';
import IGrid from '@models/IGrid';
import { BaseClient } from '@src/client/BaseClient';
import { BaseRenderer } from '@src/rendering/BaseRenderer';

export default class SinglePlayerClient
  extends BaseClient
  implements ISimulationEventListener
{
  // FIXME: restructure to not require definite assignment
  private _renderer!: BaseRenderer;
  private _simulation!: Simulation;
  private _input!: Input;

  constructor(clientApiConfig: ClientApiConfig, options: LaunchOptions) {
    super(clientApiConfig, options);
    this._create(options);
  }

  /**
   * @inheritdoc
   */
  onGridCollapsed(grid: IGrid): void {}

  onGridReset(grid: IGrid): void {}

  /**
   * @inheritdoc
   */
  onSimulationInit(simulation: Simulation) {}
  /**
   * @inheritdoc
   */
  onSimulationStep(simulation: Simulation) {}

  onSimulationNextRound(): void {}

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
  onBlockDropped(block: IBlock) {}
  onBlockDied(block: IBlock) {}
  onBlockDestroyed(block: IBlock): void {}

  onPlayerCreated(player: IPlayer): void {}
  onPlayerDestroyed(player: IPlayer): void {}
  onPlayerToggleChat(player: IPlayer): void {}
  onPlayerToggleSpectating() {}
  /**
   * @inheritdoc
   */
  onLineClear(row: number) {}
  onLineClearing() {}
  onClearLines() {}

  /**
   * @inheritdoc
   */
  onCellBehaviourChanged(_cell: ICell, _previousBehaviour: ICellBehaviour) {}

  onCellIsEmptyChanged() {}
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
    if (!this._simulation) {
      return;
    }
    console.log('Destroying Single Player Client');
    this._simulation.stopInterval();
    this._renderer.destroy();
    this._input?.destroy();
  }

  private async _create(options: LaunchOptions) {
    this._renderer =
      options.rendererType === 'minimal'
        ? new MinimalRenderer(this._clientApiConfig)
        : new Infinitris2Renderer(
            this._clientApiConfig,
            undefined,
            undefined,
            options.rendererQuality,
            options.worldType
          );
    await this._renderer.create();

    const simulationSettings: SimulationSettings =
      options.simulationSettings || {};

    this._simulation = new Simulation(
      new Grid(options.gridNumColumns, options.gridNumRows),
      simulationSettings
    );
    this._simulation.addEventListener(this, this._renderer);
    if (options.listener) {
      this._simulation.addEventListener(options.listener);
    }

    this._simulation.init();
    // FIXME: player should still be created, just marked as spectator
    const playerId = 0;
    const player = new ControllablePlayer(
      this._simulation,
      playerId,
      options.player?.nickname,
      options.player?.color,
      options.spectate || this._simulation.shouldNewPlayerSpectate,
      options.player?.patternFilename,
      options.player?.characterId
    );
    this._simulation.addPlayer(player);
    this._simulation.followPlayer(player);
    this._input = new Input(
      this._simulation,
      this._renderer,
      player,
      options.controls_keyboard,
      options.controls_gamepad
    );

    if (options.numBots) {
      for (let i = 0; i < options.numBots; i++) {
        // find a random bot color - unique until there are more players than colors
        // TODO: move to simulation and notify player of color switch if their color is already in use
        let freeColors = colors
          .map((color) => stringToHex(color.hex))
          .filter(
            (color) =>
              this._simulation.players
                .map((player) => player.color)
                .indexOf(color) < 0
          );
        if (!freeColors.length) {
          freeColors = colors.map((color) => stringToHex(color.hex));
        }

        this._simulation.addPlayer(
          new AIPlayer(
            this._simulation,
            i + 1,
            'Bot ' + (i + 1),
            freeColors[Math.floor(Math.random() * (freeColors.length - 1))],
            (options.botReactionDelay || 20) +
              Math.floor(
                Math.random() * (options.botRandomReactionDelay || 20)
              ),
            this._simulation.shouldNewPlayerSpectate,
            'pattern_' + Math.floor(Math.random() * 12) + '.png', // TODO: pass characters from app
            '' + Math.floor(Math.random() * 100) // TODO: pass characters from app
          )
        );
      }
    }

    this._simulation.startInterval();
  }
}
