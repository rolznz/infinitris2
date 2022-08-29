import ControllablePlayer from '@src/ControllablePlayer';
import Grid from '@core/grid/Grid';
import Input from '@src/input/Input';
import ISimulationEventListener from '@models/ISimulationEventListener';
import CellType from '@models/CellType';
import IBlock from '@models/IBlock';
import IChallengeClient from '@models/IChallengeClient';
import { InputMethod } from '@models/InputMethod';
import { IChallenge } from '@models/IChallenge';
import Simulation from '@core/simulation/Simulation';
import ChallengeCompletionStats from '@models/ChallengeCompletionStats';
import ChallengeCellType from '@models/ChallengeCellType';
import ControlSettings, {
  DEFAULT_KEYBOARD_CONTROLS,
} from '@models/ControlSettings';
import parseGrid from '@models/util/parseGrid';
import { PlayerStatus } from '@models/IPlayer';
import {
  ChallengeAttemptRecording,
  ChallengeStatusCode,
  IIngameChallengeAttempt,
} from '@models/IChallengeAttempt';
import ChallengeRewardCriteria from '@models/ChallengeRewardCriteria';
import { ChallengeLaunchOptions, ClientApiConfig } from '@models/IClientApi';
import { BaseClient } from '@src/client/BaseClient';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import Infinitris2Renderer from '@src/rendering/renderers/infinitris2/Infinitris2Renderer';
import { ChallengeEditor } from '@src/client/singleplayer/ChallengeEditor';
import createBehaviourFromChallengeCellType from '@core/grid/cell/behaviours/createBehaviourFromChallengeCellType';
import { IChallengeEditor } from '@models/IChallengeEditor';
import ICell from '@models/ICell';
import { IChallengeEventListener } from '@models/IChallengeEventListener';
import MinimalRenderer from '@src/rendering/renderers/minimal/MinimalRenderer';
import { ChallengeAttemptRecorder } from '@src/client/singleplayer/ChallengeAttemptRecorder';
import { ChallengeAttemptRecordPlayer } from '@src/client/singleplayer/ChallengeAttemptRecordPlayer';

// TODO: enable support for multiplayer challenges (challenges)
// this client should be replaced with a single player / network client that supports a challenge
export default class ChallengeClient
  extends BaseClient<ChallengeLaunchOptions>
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
  //private _controls?: ControlSettings;
  private _editor?: IChallengeEditor;
  private _listener: IChallengeEventListener;
  private _recorder: ChallengeAttemptRecorder;
  private _recordPlayer: ChallengeAttemptRecordPlayer;
  private _recording: ChallengeAttemptRecording | undefined;
  private _currentAttempt: IIngameChallengeAttempt | undefined;

  constructor(
    clientApiConfig: ClientApiConfig,
    challenge: IChallenge,
    listener: IChallengeEventListener,
    options: ChallengeLaunchOptions
  ) {
    super(clientApiConfig, options);
    this._preferredInputMethod = options.preferredInputMethod;
    this._listener = listener;
    //this._controls = options.controls_keyboard;
    this._recorder = new ChallengeAttemptRecorder();
    this._recordPlayer = new ChallengeAttemptRecordPlayer();
    if (options.challengeEditorSettings) {
      this._editor = new ChallengeEditor(
        this,
        options.challengeEditorSettings.listeners,
        options.challengeEditorSettings.isEditing
      );
    }
    this._recording = options.recording;
    this._create(challenge);
  }
  get challenge(): IChallenge {
    return this._challenge;
  }
  get editor(): IChallengeEditor | undefined {
    return this._editor;
  }
  set recording(recording: ChallengeAttemptRecording | undefined) {
    this._recording = recording;
  }
  get recording(): ChallengeAttemptRecording | undefined {
    return this._recording;
  }

  get launchOptions(): ChallengeLaunchOptions {
    return this._launchOptions;
  }

  onSimulationPreStep() {
    // TODO: shouldn't the simulation be paused while waiting for the next round?
    if (this._recording && !this._simulation?.round?.isWaitingForNextRound) {
      this._recordPlayer.step();
    }
  }

  onSimulationStep() {
    this._checkChallengeStatus();
    // TODO: shouldn't the simulation be paused while waiting for the next round?
    if (
      this._simulation.followingPlayer &&
      !this._recording &&
      !this._simulation?.round?.isWaitingForNextRound
    ) {
      this._recorder.record(this._simulation.followingPlayer.firedActions);
    }
    if (
      this._currentAttempt &&
      this._currentAttempt.status !== 'pending' &&
      this._simulation.isRunning
    ) {
      this._simulation.stopInterval();
      this._listener.onAttempt(this._currentAttempt);
    }
  }
  onBlockMoved() {
    this._checkChallengeStatus();
  }
  private _checkChallengeStatus() {
    if (
      !this._currentAttempt ||
      (this._currentAttempt.status !== 'failed' &&
        this._currentAttempt.status !== 'success')
    ) {
      this._currentAttempt = this.getChallengeAttempt();
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

  onEndRound() {
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
    this._simulation.destroy();
    this._currentAttempt = undefined;
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
      if (this._simulation.round) {
        if (this._simulation.round.winner) {
          return true;
        }
        if (
          !this._simulation.round.isWaitingForNextRound &&
          this._simulation.humanPlayers[0].status === PlayerStatus.knockedOut
        ) {
          return true;
        }

        return false;
      }
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
        if (this._simulation.round) {
          if (
            this._simulation.round.winner === this._simulation.humanPlayers[0]
          ) {
            return true;
          }

          return false;
        }

        if (
          this
            ._blockCreateFailed /* || (this._blockDied && criteria.noMistakes)*/
        ) {
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

    return {
      status,
      medalIndex,
      stats,
      recording: this._recorder.recording,
    };
  }

  private async _create(challenge: IChallenge) {
    this._challenge = challenge;
    this._renderer =
      this._launchOptions.rendererSettings?.rendererType === 'minimal'
        ? new MinimalRenderer(this._clientApiConfig)
        : new Infinitris2Renderer(
            this._clientApiConfig,
            this._preferredInputMethod,
            this._launchOptions.controls_keyboard || DEFAULT_KEYBOARD_CONTROLS,
            undefined,
            challenge.worldType,
            challenge.worldVariation,
            undefined,
            false,
            this._launchOptions.rendererSettings?.gridLineType,
            this._launchOptions.rendererSettings?.blockShadowType,
            this._launchOptions.rendererSettings?.showFaces,
            this._launchOptions.rendererSettings?.showPatterns,
            this._launchOptions.rendererSettings?.showNicknames,
            this._launchOptions.showUI !== false
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
    let grid: Grid;
    if (typeof this._challenge.grid === 'string') {
      cellTypes.push(...parseGrid(this._challenge.grid));
      grid = new Grid(cellTypes[0].length, cellTypes.length, false);
    } else if (
      this._challenge.grid.numRows &&
      this._challenge.grid.numColumns
    ) {
      grid = new Grid(
        this._challenge.grid.numColumns,
        this._challenge.grid.numRows,
        false
      );
    } else {
      throw new Error('Unsupported grid type');
    }

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

    const isClassicChallenge =
      (this._challenge.simulationSettings?.gameModeType || 'infinity') ===
      'infinity';

    this._renderer.challengeEditorEnabled = this._editor?.isEditing || false;
    this._renderer.gridLineType = this._editor?.isEditing
      ? 'editor'
      : this._launchOptions.rendererSettings?.gridLineType;

    const simulation = (this._simulation = new Simulation(
      grid,
      {
        preventTowers: !isClassicChallenge,
        saveSpawnPositionOnDeath: !isClassicChallenge || !spawnLocationCell,
        // replaceUnplayableBlocks: !isClassicChallenge, // this is always on now (better gameplay experience and confusing setting for users)
        ...this._challenge.simulationSettings,
      },
      undefined,
      this._recording?.simulationRootSeed
    ));
    simulation.addEventListener(this, this._renderer);
    if (this._launchOptions.listeners) {
      simulation.addEventListener(...this._launchOptions.listeners);
    }
    simulation.init();
    this._recorder.reset(simulation);
    const playerId = 0;
    const player = new ControllablePlayer(
      simulation,
      playerId,
      this._simulation.shouldNewPlayerSpectate
        ? PlayerStatus.knockedOut
        : PlayerStatus.ingame,
      this._launchOptions.player?.nickname,
      this._launchOptions.player?.color,
      this._launchOptions.player?.patternFilename,
      this._launchOptions.player?.characterId,
      this._launchOptions.player?.isPremium,
      this._launchOptions.player?.isNicknameVerified
    );
    if (spawnLocationCell) {
      player.spawnLocationCell = spawnLocationCell;
    }
    simulation.addPlayer(player);
    simulation.followPlayer(player);
    this._simulation.addBots(this._launchOptions.allCharacters);
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
      false,
      this._launchOptions?.useCustomRepeat
        ? this._launchOptions.customRepeatInitialDelay
        : undefined,
      this._launchOptions?.useCustomRepeat
        ? this._launchOptions.customRepeatRate
        : undefined
    );
    //this._renderer.virtualKeyboardControls = this._input.controls;
    if (this._editor) {
      this._editor.simulation = simulation;
      this._input.addListener(this._editor.inputActionListener);
    }

    if (this._recording) {
      this._recordPlayer.reset(player, this._recording);
      this._input.playerActionsEnabled = false;
    }

    if (!this._editor || !this._editor.isEditing) {
      // execute one frame to warm up the simulation (creates the player's block, etc)
      simulation.step();
    }
    this._listener.onChallengeReady(simulation);
    //this._renderer.startTicker();
  }
}
