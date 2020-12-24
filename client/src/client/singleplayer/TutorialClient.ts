import Simulation from '@core/Simulation';
import IRenderer from '@src/rendering/IRenderer';
import MinimalRenderer from '@src/rendering/renderers/minimal/MinimalRenderer';
import ControllablePlayer from '@src/ControllablePlayer';
import Grid from '@core/grid/Grid';
import Input from '@src/input/Input';
import IClient from '../Client';
import Tutorial from '../../../../models/src/Tutorial';
import ISimulationEventListener from '@models/ISimulationEventListener';
import Block from '@core/block/Block';
import CellType from '@core/grid/cell/CellType';
import { InputAction } from 'models';

export default class TutorialClient
  implements IClient, ISimulationEventListener {
  // FIXME: restructure to not require definite assignment
  private _renderer!: IRenderer;
  private _simulation!: Simulation;
  private _tutorial!: Tutorial;
  private _input!: Input;
  private _allowedActions?: InputAction[];

  constructor(tutorial: Tutorial, listener?: ISimulationEventListener) {
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
  onBlockCreated(block: Block) {}
  /**
   * @inheritdoc
   */
  onBlockPlaced(block: Block) {}

  /**
   * @inheritdoc
   */
  onBlockDied(block: Block) {}

  /**
   * @inheritdoc
   */
  onBlockMoved(block: Block) {}
  /**
   * @inheritdoc
   */
  onLineCleared(row: number) {}

  /**
   * @inheritdoc
   */
  destroy() {
    this._simulation.stopInterval();
    this._renderer.destroy();
    this._input.destroy();
  }

  private async _create(
    tutorial: Tutorial,
    listener?: ISimulationEventListener
  ) {
    this._tutorial = tutorial;
    this._renderer = new MinimalRenderer();
    await this._renderer.create();

    const cellTypes: CellType[][] = [];
    if (tutorial.grid) {
      cellTypes.push(
        ...tutorial.grid
          .split('\n')
          .map((row) => row.trim())
          .filter((row) => row && !row.startsWith('//'))
          .map((row) => row.split('').map((c) => c as CellType))
      );
      if (cellTypes.find((r) => r.length !== cellTypes[0].length)) {
        throw new Error('Invalid tutorial grid: ' + tutorial.title);
      }
    }

    const grid = new Grid(
      cellTypes.length ? cellTypes[0].length : tutorial.gridNumColumns,
      cellTypes.length ? cellTypes.length : tutorial.gridNumRows
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

    this._simulation = new Simulation(grid, tutorial.simulationSettings);
    this._simulation.addEventListener(this, this._renderer);
    if (listener) {
      this._simulation.addEventListener(listener);
    }

    const playerId = 0;
    const player = new ControllablePlayer(playerId, this._simulation);
    this._simulation.addPlayer(player);
    this._simulation.followPlayer(player);
    player.nextLayout = tutorial.layout;
    player.nextLayoutRotation = tutorial.layoutRotation;

    this._input = new Input(this._simulation, player, undefined);
    this._renderer.virtualKeyboardControls = this._input.controls;
    this._updateAllowedActions(tutorial.allowedActions);

    if (tutorial.teachControls) {
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
