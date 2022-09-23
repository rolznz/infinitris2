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
import { DEFAULT_KEYBOARD_CONTROLS } from '@models/ControlSettings';

let oldCursor: string;
export default class SinglePlayerClient
  extends BaseClient
  implements Partial<ISimulationEventListener>
{
  // FIXME: restructure to not require definite assignment
  private _renderer!: BaseRenderer;
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
      options.rendererSettings?.rendererType === 'minimal'
        ? new MinimalRenderer(
            this._clientApiConfig,
            options.rendererSettings?.showNicknames
          )
        : new Infinitris2Renderer(
            this._clientApiConfig,
            undefined,
            this._launchOptions.controls_keyboard || DEFAULT_KEYBOARD_CONTROLS,
            options.rendererSettings?.rendererQuality,
            options.worldType,
            options.worldVariation,
            options.useFallbackUI,
            options.isDemo,
            options.rendererSettings?.gridLineType,
            options.rendererSettings?.blockShadowType,
            options.rendererSettings?.showFaces,
            options.rendererSettings?.showPatterns,
            options.rendererSettings?.showNicknames,
            options.showUI !== false,
            options.teachAllControls
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
      options.player?.characterId,
      options.player?.isPremium,
      options.player?.isNicknameVerified
    );
    this._simulation.addPlayer(player);
    this._simulation.followPlayer(player);
    this._input = new Input(
      this._simulation,
      this._renderer.onInputAction,
      this._renderer.screenPositionToCell,
      player,
      options.controls_keyboard,
      options.controls_gamepad,
      undefined,
      this._launchOptions.chatEnabled ?? false,
      this._launchOptions?.useCustomRepeat
        ? this._launchOptions.customRepeatInitialDelay
        : undefined,
      this._launchOptions?.useCustomRepeat
        ? this._launchOptions.customRepeatRate
        : undefined
    );
    this._simulation.addBots(this._launchOptions.allCharacters);

    this._simulation.startInterval();
  }
}
