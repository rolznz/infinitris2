import IRenderer from '@src/rendering/IRenderer';
import MinimalRenderer from '@src/rendering/renderers/minimal/MinimalRenderer';
import ControllablePlayer from '@src/ControllablePlayer';
import Grid from '@core/grid/Grid';
import Input from '@src/input/Input';
import ISimulationEventListener from '@models/ISimulationEventListener';
import CellType from '@models/CellType';
import InputAction from '@models/InputAction';
import IBlock from '@models/IBlock';
import ITutorialClient, { TutorialStatus } from '@models/ITutorialClient';
import InputMethod from '@models/InputMethod';
import ITutorial from '@models/ITutorial';
import TutorialSuccessCriteria from '@models/TutorialSuccessCriteria';
import ISimulation from '@models/ISimulation';
import Simulation from '@core/Simulation';
import TutorialCompletionStats from '@models/TutorialCompletionStats';

// TODO: enable support for multiplayer tutorials (challenges)
// this client should be replaced with a single player / network client that supports a challenge
export default class TutorialClient
  implements ITutorialClient, ISimulationEventListener {
  // FIXME: restructure to not require definite assignment
  private _renderer!: IRenderer;
  private _simulation!: ISimulation;
  private _tutorial!: ITutorial;
  private _input!: Input;
  private _allowedActions?: InputAction[];
  private _preferredInputMethod: InputMethod;
  private _simulationEventListener?: ISimulationEventListener;
  private _numBlocksPlaced!: number;
  private _numLinesCleared!: number;
  private _blockCreateFailed!: boolean;

  constructor(
    tutorial: ITutorial,
    listener?: ISimulationEventListener,
    preferredInputMethod: InputMethod = 'keyboard'
  ) {
    this._preferredInputMethod = preferredInputMethod;
    this._create(tutorial, listener);
  }

  /**
   * @inheritdoc
   */
  onSimulationInit(simulation: ISimulation) {}
  /**
   * @inheritdoc
   */
  onSimulationStep(simulation: ISimulation) {
    if (this.getStatus().status !== 'pending') {
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
  onBlockDied(block: IBlock) {}

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

  getStatus(): TutorialStatus {
    const { finishCriteria, successCriteria } = this._tutorial;
    const matchesFinishCriteria = () => {
      if (this._blockCreateFailed) {
        return true;
      }
      if (
        finishCriteria.maxBlocks &&
        this._numBlocksPlaced < finishCriteria.maxBlocks
      ) {
        return false;
      }
      if (finishCriteria.emptyGrid && !this._simulation.grid.isEmpty) {
        return false;
      }
      if (
        finishCriteria.maxLinesCleared &&
        this._numLinesCleared < finishCriteria.maxLinesCleared
      ) {
        return false;
      }
      if (
        finishCriteria.maxTime &&
        this._simulation.runningTime < finishCriteria.maxTime
      ) {
        return false;
      }

      return true;
    };
    const finished = matchesFinishCriteria();

    const getStars = () => {
      const matchesSuccessCriteria = (
        criteria: TutorialSuccessCriteria
      ): boolean => {
        if (this._blockCreateFailed) {
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
          criteria.maxTimeTaken &&
          this._simulation.runningTime > criteria.maxTimeTaken
        ) {
          return false;
        }
        return true;
      };

      const mergeCriteria = (criteria?: TutorialSuccessCriteria) => {
        return {
          ...successCriteria.all,
          ...(criteria || {}),
        };
      };

      return [
        successCriteria.gold,
        successCriteria.silver,
        successCriteria.bronze,
      ]
        .map((criteria) => matchesSuccessCriteria(mergeCriteria(criteria)))
        .filter((result) => result).length;
    };

    const stars = finished ? getStars() : 0;
    //this._numLinesCleared >= (this._tutorial.successLinesCleared || 0);
    const status = finished ? (stars > 0 ? 'success' : 'failed') : 'pending';

    const stats: TutorialCompletionStats | undefined = finished
      ? {
          blocksPlaced: this._numBlocksPlaced,
          linesCleared: this._numLinesCleared,
          timeTaken: this._simulation.runningTime,
        }
      : undefined;

    // TODO:
    return {
      status,
      stars,
      stats,
    };
  }

  private async _create(
    tutorial: ITutorial,
    listener?: ISimulationEventListener
  ) {
    this._tutorial = tutorial;
    this._renderer = new MinimalRenderer(this._preferredInputMethod);
    this._simulationEventListener = listener;
    await this._renderer.create();

    this._createTempObjects();
  }

  private _createTempObjects() {
    this._numBlocksPlaced = 0;
    this._numLinesCleared = 0;
    this._blockCreateFailed = false;

    const cellTypes: CellType[][] = [];
    if (this._tutorial.grid) {
      cellTypes.push(
        ...this._tutorial.grid
          .split('\n')
          .map((row) => row.trim())
          .filter((row) => row && !row.startsWith('//'))
          .map((row) => row.split('').map((c) => c as CellType))
      );
      if (cellTypes.find((r) => r.length !== cellTypes[0].length)) {
        throw new Error('Invalid tutorial grid: ' + this._tutorial.title);
      }
    }

    const grid = new Grid(
      cellTypes.length ? cellTypes[0].length : this._tutorial.gridNumColumns,
      cellTypes.length ? cellTypes.length : this._tutorial.gridNumRows
    );
    if (cellTypes.length) {
      for (let r = 0; r < grid.cells.length; r++) {
        for (let c = 0; c < grid.cells[0].length; c++) {
          const cell = grid.cells[r][c];
          const cellType = cellTypes[r][c];
          cell.type = cellType;
        }
      }
    }

    const simulation = (this._simulation = new Simulation(
      grid,
      this._tutorial.simulationSettings
    ));
    simulation.addEventListener(this, this._renderer);
    if (this._simulationEventListener) {
      simulation.addEventListener(this._simulationEventListener);
    }

    const playerId = 0;
    const player = new ControllablePlayer(playerId, this._simulation);
    simulation.addPlayer(player);
    simulation.followPlayer(player);
    player.nextLayout = this._tutorial.layout;
    player.nextLayoutRotation = this._tutorial.layoutRotation;

    this._input = new Input(simulation, player, undefined);
    this._renderer.virtualKeyboardControls = this._input.controls;
    this._updateAllowedActions(this._tutorial.allowedActions);

    if (this._tutorial.teachControls) {
      this._teachNextControl();
      this._input.addListener(
        (action) =>
          (this._allowedActions as InputAction[]).indexOf(action) >= 0 &&
          this._teachNextControl()
      );
    }

    simulation.init();
    simulation.step();
  }

  private _updateAllowedActions(allowedActions?: InputAction[]) {
    this._allowedActions = allowedActions;
    this._input.allowedActions = allowedActions;
    this._renderer.allowedActions = allowedActions;
  }

  private _teachNextControl() {
    if (!this._allowedActions) {
      return;
    }
    const nextAction =
      this._allowedActions.length === 0
        ? InputAction.MoveLeft
        : ((this._allowedActions[0] + 1) as InputAction);
    if (nextAction > InputAction.Drop) {
      // TODO: finish tutorial
    } else {
      this._updateAllowedActions([nextAction]);
    }
  }
}
