import Simulation from '@core/Simulation';
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

// TODO: enable support for multiplayer tutorials (challenges)
// this client should be replaced with a single player / network client that supports a challenge
export default class TutorialClient
  implements ITutorialClient, ISimulationEventListener {
  // FIXME: restructure to not require definite assignment
  private _renderer!: IRenderer;
  private _simulation!: Simulation;
  private _tutorial!: ITutorial;
  private _input!: Input;
  private _allowedActions?: InputAction[];
  private _preferredInputMethod: InputMethod;
  private _simulationEventListener?: ISimulationEventListener;
  private _numBlocksPlaced: number;
  private _numLinesCleared: number;

  constructor(
    tutorial: ITutorial,
    listener?: ISimulationEventListener,
    preferredInputMethod: InputMethod = 'keyboard'
  ) {
    this._preferredInputMethod = preferredInputMethod;
    // TODO: store in status object instead
    this._numBlocksPlaced = 0;
    this._numLinesCleared = 0;
    this._create(tutorial, listener);
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
    this._numBlocksPlaced = 0;
    this._numLinesCleared = 0;
  }

  getStatus(): TutorialStatus {
    const finished =
      this._tutorial.maxBlocks &&
      this._numBlocksPlaced >= this._tutorial.maxBlocks;
    const won =
      this._numLinesCleared >= (this._tutorial.successLinesCleared || 0);
    const status = finished ? (won ? 'success' : 'failed') : 'pending';

    // TODO:
    return {
      status,
      stars: 0,
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

    this._simulation = new Simulation(grid, this._tutorial.simulationSettings);
    this._simulation.addEventListener(this, this._renderer);
    if (this._simulationEventListener) {
      this._simulation.addEventListener(this._simulationEventListener);
    }

    const playerId = 0;
    const player = new ControllablePlayer(playerId, this._simulation);
    this._simulation.addPlayer(player);
    this._simulation.followPlayer(player);
    player.nextLayout = this._tutorial.layout;
    player.nextLayoutRotation = this._tutorial.layoutRotation;

    this._input = new Input(this._simulation, player, undefined);
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

    this._simulation.init();
    this._simulation.step();
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
