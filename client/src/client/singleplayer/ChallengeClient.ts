import ControllablePlayer from '@src/ControllablePlayer';
import Grid from '@core/grid/Grid';
import Input from '@src/input/Input';
import ISimulationEventListener from '@models/ISimulationEventListener';
import CellType from '@models/CellType';
import IBlock from '@models/IBlock';
import IChallengeClient from '@models/IChallengeClient';
import { InputMethod } from '@models/InputMethod';
import { IChallenge } from '@models/IChallenge';
import ISimulation from '@models/ISimulation';
import Simulation from '@core/simulation/Simulation';
import ChallengeCompletionStats from '@models/ChallengeCompletionStats';
import ChallengeCellType from '@models/ChallengeCellType';
import ControlSettings from '@models/ControlSettings';
import parseGrid from '@models/util/parseGrid';
import tetrominoes from '@models/blockLayouts/Tetrominoes';
import { PlayerStatus } from '@models/IPlayer';
import {
  ChallengeStatusCode,
  IIngameChallengeAttempt,
} from '@models/IChallengeAttempt';
import ChallengeRewardCriteria from '@models/ChallengeRewardCriteria';
import { ClientApiConfig, LaunchOptions } from '@models/IClientApi';
import { BaseClient } from '@src/client/BaseClient';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import Infinitris2Renderer from '@src/rendering/renderers/infinitris2/Infinitris2Renderer';
import { ChallengeEditor } from '@src/client/singleplayer/ChallengeEditor';
import createBehaviourFromChallengeCellType from '@core/grid/cell/behaviours/createBehaviourFromChallengeCellType';
import { IChallengeEditor } from '@models/IChallengeEditor';
import ICell from '@models/ICell';

// TODO: enable support for multiplayer challenges (challenges)
// this client should be replaced with a single player / network client that supports a challenge
export default class ChallengeClient
  extends BaseClient
  implements IChallengeClient, Partial<ISimulationEventListener>
{
  // FIXME: restructure to not require definite assignment
  private _renderer!: BaseRenderer;
  private _challenge!: IChallenge;
  private _input!: Input;
  private _preferredInputMethod?: InputMethod;
  private _numBlocksPlaced!: number;
  private _numLinesCleared!: number;
  private _blockCreateFailed!: boolean;
  private _blockDied!: boolean;
  private _controls?: ControlSettings;
  private _editor?: IChallengeEditor;

  constructor(
    clientApiConfig: ClientApiConfig,
    challenge: IChallenge,
    options: LaunchOptions
  ) {
    super(clientApiConfig, options);
    this._preferredInputMethod = options.preferredInputMethod;
    this._controls = options.controls_keyboard;
    if (options.challengeEditorSettings) {
      this._editor = new ChallengeEditor(
        this,
        options.challengeEditorSettings.listeners,
        options.challengeEditorSettings.isEditing
      );
    }
    this._create(challenge);
  }
  get challenge(): IChallenge {
    return this._challenge;
  }
  get editor(): IChallengeEditor | undefined {
    return this._editor;
  }

  onSimulationStep() {
    this._checkChallengeStatus();
  }
  onBlockMoved() {
    this._checkChallengeStatus();
  }
  private _checkChallengeStatus() {
    if (this.getChallengeAttempt().status !== 'pending') {
      this._simulation.stopInterval();
      if (this.getChallengeAttempt().status === 'failed') {
        setTimeout(() => {
          this.restart();
          this._simulation.startInterval();
        }, 1000);
      }
    }
  }

  /**
   * @inheritdoc
   */
  onBlockCreateFailed(block: IBlock) {
    this._blockCreateFailed = true;
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    ++this._numBlocksPlaced;
    this._checkChallengeStatus();
  }

  /**
   * @inheritdoc
   */
  onBlockDied(block: IBlock) {
    this._blockDied = true;
  }

  /**
   * @inheritdoc
   */
  onLineClear(row: number) {
    ++this._numLinesCleared;
  }
  /**
   * @inheritdoc
   */
  destroy() {
    this._renderer.destroy();
    this._destroyTempObjects();
  }

  private _destroyTempObjects() {
    if (!this._simulation) {
      return;
    }
    this._simulation.stopInterval();
    // TODO: shouldn't have to destroy the input each time
    this._input?.destroy();
  }

  /**
   * @inheritdoc
   */
  restart() {
    this._destroyTempObjects();
    this._createTempObjects();
  }

  getChallengeAttempt(): IIngameChallengeAttempt {
    const { finishCriteria, rewardCriteria } = this._challenge;
    const matchesFinishCriteria = () => {
      if (
        this._blockCreateFailed ||
        (this._blockDied && finishCriteria?.noMistakes)
      ) {
        return true;
      }
      if (
        !this._simulation.grid.reducedCells.some(
          (cell) =>
            (!cell.isEmpty || cell.blocks.length) &&
            cell.type === CellType.FinishChallenge
        )
      ) {
        return false;
      }
      if (
        finishCriteria?.maxBlocksPlaced &&
        this._numBlocksPlaced < finishCriteria.maxBlocksPlaced
      ) {
        return false;
      }
      if (finishCriteria?.gridEmpty && !this._simulation.grid.isEmpty) {
        return false;
      }
      if (
        finishCriteria?.maxLinesCleared &&
        this._numLinesCleared < finishCriteria.maxLinesCleared
      ) {
        return false;
      }
      if (
        finishCriteria?.maxTimeTakenMs &&
        this._simulation.runningTime < finishCriteria.maxTimeTakenMs
      ) {
        return false;
      }

      return true;
    };
    const finished = matchesFinishCriteria();

    const getMedalIndex = () => {
      const matchesRewardCriteria = (
        criteria: ChallengeRewardCriteria
      ): boolean => {
        if (this._blockCreateFailed || this._blockDied) {
          return false;
        }
        if (
          criteria.minBlocksPlaced &&
          this._numBlocksPlaced < criteria.minBlocksPlaced
        ) {
          return false;
        }
        if (
          criteria.maxBlocksPlaced &&
          this._numBlocksPlaced > criteria.maxBlocksPlaced
        ) {
          return false;
        }
        if (
          criteria.minLinesCleared &&
          this._numLinesCleared < criteria.minLinesCleared
        ) {
          return false;
        }
        if (
          criteria.maxLinesCleared &&
          this._numLinesCleared > criteria.maxLinesCleared
        ) {
          return false;
        }
        if (
          criteria.maxTimeTakenMs &&
          this._simulation.runningTime > criteria.maxTimeTakenMs
        ) {
          return false;
        }
        return true;
      };

      const mergeRewardCriteria = (criteria?: ChallengeRewardCriteria) => {
        return {
          ...(rewardCriteria?.all || {}),
          ...(criteria || {}),
        };
      };

      return [
        rewardCriteria?.bronze,
        rewardCriteria?.silver,
        rewardCriteria?.gold,
      ]
        .map((criteria) => matchesRewardCriteria(mergeRewardCriteria(criteria)))
        .filter((result) => result).length;
    };

    const medalIndex = finished ? getMedalIndex() : 0;
    //this._numLinesCleared >= (this._challenge.successLinesCleared || 0);
    const status: ChallengeStatusCode = finished
      ? medalIndex > 0
        ? 'success'
        : 'failed'
      : 'pending';

    const stats: ChallengeCompletionStats | undefined = finished
      ? {
          blocksPlaced: this._numBlocksPlaced,
          linesCleared: this._numLinesCleared,
          timeTakenMs: this._simulation.runningTime,
        }
      : undefined;

    // TODO:
    return {
      status,
      medalIndex,
      stats,
      userId: null as unknown as string,
    };
  }

  private async _create(challenge: IChallenge) {
    this._challenge = challenge;
    this._renderer = new Infinitris2Renderer(
      this._clientApiConfig,
      this._preferredInputMethod,
      undefined,
      undefined,
      challenge.worldType,
      challenge.worldVariation,
      undefined,
      false,
      this._launchOptions.challengeEditorSettings
        ? 'editor'
        : this._launchOptions.gridLineType,
      !!this._launchOptions.challengeEditorSettings
    );
    if (this._editor) {
      this._editor.renderer = this._renderer;
    }
    await this._renderer.create();

    this._createTempObjects();
  }

  private _createTempObjects() {
    this._numBlocksPlaced = 0;
    this._numLinesCleared = 0;
    this._blockCreateFailed = false;
    this._blockDied = false;

    const cellTypes: ChallengeCellType[][] = [];
    if (this._challenge.grid) {
      cellTypes.push(...parseGrid(this._challenge.grid));
    }

    const grid = new Grid(cellTypes[0].length, cellTypes.length, false);

    let spawnLocationCell: ICell | undefined;

    if (cellTypes.length) {
      for (let r = 0; r < grid.cells.length; r++) {
        for (let c = 0; c < grid.cells[0].length; c++) {
          const cell = grid.cells[r][c];
          const cellType = cellTypes[r][c];
          createBehaviourFromChallengeCellType(cell, grid, cellType);
          if (cell.behaviour.type === CellType.SpawnLocation) {
            spawnLocationCell = cell;
          }
        }
      }
    }

    const simulation = (this._simulation = new Simulation(grid, {
      preventTowers: false, // TODO: re-enable for some challenges
      ...this._challenge.simulationSettings,
    }));
    simulation.addEventListener(this, this._renderer);
    if (this._launchOptions.listeners) {
      simulation.addEventListener(...this._launchOptions.listeners);
    }
    simulation.init();
    const playerId = 0;
    const player = new ControllablePlayer(
      simulation,
      playerId,
      this._simulation.shouldNewPlayerSpectate
        ? PlayerStatus.knockedOut
        : PlayerStatus.ingame,
      this._launchOptions.player?.nickname,
      this._launchOptions.player?.color
    );
    if (spawnLocationCell) {
      player.spawnLocationCell = spawnLocationCell;
    }
    simulation.addPlayer(player);
    simulation.followPlayer(player);
    /*if (this._challenge.firstBlockLayoutId) {
      player.nextLayout = simulation.layoutSet[this._challenge.firstBlockLayoutId];
    }*/

    //player.nextLayoutRotation = this._challenge.layoutRotation;

    // TODO: shouldn't have to create the input each time
    this._input = new Input(
      simulation,
      this._renderer.onInputAction,
      this._renderer.screenPositionToCell,
      player,
      this._launchOptions.controls_keyboard,
      this._launchOptions.controls_gamepad,
      !!this._launchOptions.challengeEditorSettings,
      false
    );
    //this._renderer.virtualKeyboardControls = this._input.controls;
    if (this._editor) {
      this._editor.simulation = simulation;
      this._input.addListener(this._editor.inputActionListener);
    }

    if (!this._editor || !this._editor.isEditing) {
      // execute one frame to warm up the simulation (creates the player's block, etc)
      simulation.step();
    }
  }
}
