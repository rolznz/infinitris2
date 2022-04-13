import Simulation from '@core/simulation/Simulation';
import MinimalRenderer from '@src/rendering/renderers/minimal/MinimalRenderer';
import ControllablePlayer from '@src/ControllablePlayer';
import Grid from '@core/grid/Grid';
import Input from '@src/input/Input';
import ISimulationEventListener from '@models/ISimulationEventListener';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import { IPlayer, PlayerStatus } from '@models/IPlayer';
import Infinitris2Renderer from '@src/rendering/renderers/infinitris2/Infinitris2Renderer';
import { ClientApiConfig, LaunchOptions } from '@models/IClientApi';
import { SimulationSettings } from '@models/SimulationSettings';
import AIPlayer from '@core/player/AIPlayer';
import { stringToHex } from '@models/util/stringToHex';
import { colors } from '@models/colors';
import IGrid from '@models/IGrid';
import { BaseClient } from '@src/client/BaseClient';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import { GameModeEvent } from '@models/GameModeEvent';
import { ICharacter } from '@models/ICharacter';

let oldCursor: string;
export default class SinglePlayerClient
  extends BaseClient
  implements Partial<ISimulationEventListener>
{
  // FIXME: restructure to not require definite assignment
  private _renderer!: BaseRenderer;
  private _simulation!: Simulation;
  private _input!: Input;

  constructor(clientApiConfig: ClientApiConfig, options: LaunchOptions) {
    super(clientApiConfig, options);
    this._create(options);
  }

  onSimulationInit() {}

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
    window.document.body.style.cursor = oldCursor;
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
            options.worldType,
            options.worldVariation,
            options.useFallbackUI,
            options.isDemo
          );
    await this._renderer.create();

    oldCursor = window.document.body.style.cursor;
    if (options.isDemo) {
      window.document.body.style.cursor = `none`;
    }

    const simulationSettings: SimulationSettings =
      options.simulationSettings || {};

    this._simulation = new Simulation(
      new Grid(options.gridNumColumns, options.gridNumRows),
      simulationSettings
    );
    this._simulation.addEventListener(this, this._renderer);
    if (options.listeners) {
      this._simulation.addEventListener(...options.listeners);
    }

    this._simulation.init();
    // FIXME: player should still be created, just marked as spectator
    const playerId = 0;
    const player = new ControllablePlayer(
      this._simulation,
      playerId,
      options.spectate
        ? PlayerStatus.spectating
        : this._simulation.shouldNewPlayerSpectate
        ? PlayerStatus.knockedOut
        : PlayerStatus.ingame,
      options.player?.nickname,
      options.player?.color,
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

        const botId = this._simulation.getFreePlayerId();
        const character: Partial<ICharacter> =
          this._simulation.generateCharacter(
            this._launchOptions.allCharacters,
            botId,
            true
          );

        this._simulation.addPlayer(
          new AIPlayer(
            this._simulation,
            botId,
            this._simulation.shouldNewPlayerSpectate
              ? PlayerStatus.knockedOut
              : PlayerStatus.ingame,
            character.name!,
            stringToHex(character.color!),
            (options.botReactionDelay || 20) +
              Math.floor(
                Math.random() * (options.botRandomReactionDelay || 20)
              ),
            character.patternFilename,
            character.id!.toString()
          )
        );
      }
    }

    this._simulation.startInterval();
  }
}
