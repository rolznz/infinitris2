import IRenderer from '@src/rendering/IRenderer';
import MinimalRenderer from '@src/rendering/renderers/minimal/MinimalRenderer';
import ControllablePlayer from '@src/ControllablePlayer';
import Grid from '@core/grid/Grid';
import Input from '@src/input/Input';
import ISimulationEventListener from '@models/ISimulationEventListener';
import CellType from '@models/CellType';
import InputAction from '@models/InputAction';
import IBlock from '@models/IBlock';
import IChallengeClient from '@models/IChallengeClient';
import InputMethod from '@models/InputMethod';
import { IChallenge } from '@models/IChallenge';
import ISimulation from '@models/ISimulation';
import Simulation from '@core/Simulation';
import ChallengeCompletionStats from '@models/ChallengeCompletionStats';
import ChallengeCellType from '@models/ChallengeCellType';
import createBehaviour from '@core/grid/cell/behaviours/createBehaviour';
import ControlSettings from '@models/ControlSettings';
import parseGrid from '@models/util/parseGrid';
import tetrominoes from '@models/exampleBlockLayouts/Tetrominoes';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import IPlayer from '@models/IPlayer';
import {
  ChallengeStatusCode,
  IChallengeAttempt,
  IIngameChallengeAttempt,
} from '@models/IChallengeAttempt';
import ChallengeRewardCriteria from '@models/ChallengeRewardCriteria';
import { LaunchOptions } from '@models/IInfinitrisApi';

// TODO: enable support for multiplayer challenges (challenges)
// this client should be replaced with a single player / network client that supports a challenge
export default class ChallengeClient
  implements IChallengeClient, ISimulationEventListener
{
  // FIXME: restructure to not require definite assignment
  private _renderer!: IRenderer;
  private _simulation!: ISimulation;
  private _challenge!: IChallenge;
  private _input!: Input;
  private _preferredInputMethod?: InputMethod;
  private _simulationEventListener?: ISimulationEventListener;
  private _numBlocksPlaced!: number;
  private _numLinesCleared!: number;
  private _blockCreateFailed!: boolean;
  private _blockDied!: boolean;
  private _controls?: ControlSettings;
  private _player?: IPlayer;

  constructor(challenge: IChallenge, options: LaunchOptions) {
    this._preferredInputMethod = options.preferredInputMethod;
    this._controls = options.controls;
    this._player = options.player;
    this._create(challenge, options.listener);
  }

  /**
   * @inheritdoc
   */
  onSimulationInit(simulation: ISimulation) {}
  /**
   * @inheritdoc
   */
  onSimulationStep(simulation: ISimulation) {
    if (this.getChallengeAttempt().status !== 'pending') {
      simulation.stopInterval();
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
  onBlockCreated(block: IBlock) {}
  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    ++this._numBlocksPlaced;
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
  onBlockMoved(block: IBlock) {}

  /**
   * @inheritdoc
   */
  onBlockWrapped(block: IBlock, wrapIndexChange: number) {}
  /**
   * @inheritdoc
   */
  onLineCleared(row: number) {
    ++this._numLinesCleared;
  }

  /**
   * @inheritdoc
   */
  onCellBehaviourChanged(_cell: ICell, _previousBehaviour: ICellBehaviour) {}

  /**
   * @inheritdoc
   */
  destroy() {
    this._renderer.destroy();
    this._destroyTempObjects();
  }

  private _destroyTempObjects() {
    this._simulation.stopInterval();
    // TODO: shouldn't have to destroy the input each time
    this._input.destroy();
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
      if (this._blockCreateFailed || this._blockDied) {
        return true;
      }
      if (
        !this._simulation.grid.reducedCells.some(
          (cell) => !cell.isEmpty && cell.type === CellType.FinishChallenge
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

  private async _create(
    challenge: IChallenge,
    listener?: ISimulationEventListener
  ) {
    this._challenge = challenge;
    this._renderer = new MinimalRenderer(
      this._preferredInputMethod,
      true // TODO: check if there is 1+ key instruction cell
    );
    this._simulationEventListener = listener;
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

    const grid = new Grid(cellTypes[0].length, cellTypes.length);
    if (cellTypes.length) {
      for (let r = 0; r < grid.cells.length; r++) {
        for (let c = 0; c < grid.cells[0].length; c++) {
          const cell = grid.cells[r][c];
          const cellType = cellTypes[r][c];
          cell.behaviour = createBehaviour(cell, grid, cellType);

          if (cellType === ChallengeCellType.Full) {
            cell.isEmpty = false;
          }
        }
      }
    }

    const simulation = (this._simulation = new Simulation(
      grid,
      this._challenge.simulationSettings
    ));
    simulation.addEventListener(this, this._renderer);
    if (this._simulationEventListener) {
      simulation.addEventListener(this._simulationEventListener);
    }

    const playerId = 0;
    const player = new ControllablePlayer(
      playerId,
      this._player?.nickname,
      this._player?.color
    );
    simulation.addPlayer(player);
    simulation.followPlayer(player);
    if (this._challenge.firstBlockLayoutId) {
      // TODO: remove hard coded tetrominoes to support multiple block sets from Firestore
      player.nextLayout = tetrominoes[this._challenge.firstBlockLayoutId];
    }
    //player.nextLayoutRotation = this._challenge.layoutRotation;

    this._input = new Input(simulation, player, this._controls);
    this._renderer.virtualKeyboardControls = this._input.controls;

    simulation.init();
    simulation.step();
  }
}
