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

export default class TutorialClient
  implements IClient, ISimulationEventListener {
  // FIXME: restructure to not require definite assignment
  private _renderer!: IRenderer;
  private _simulation!: Simulation;
  private _tutorial!: Tutorial;
  private _input!: Input;
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
      cellTypes.length ? cellTypes[0].length : undefined,
      cellTypes.length ? cellTypes.length : undefined
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

    this._simulation = new Simulation(grid);
    this._simulation.addEventListener(this, this._renderer);
    if (listener) {
      this._simulation.addEventListener(listener);
    }

    this._simulation.init();
    const playerId = 0;
    const player = new ControllablePlayer(playerId, this._simulation);
    this._simulation.addPlayer(player);
    this._simulation.followPlayer(player);
    player.nextLayout = tutorial.layout;
    player.nextLayoutRotation = tutorial.layoutRotation;
    this._simulation.step();
    this._input = new Input(this._simulation, player, undefined, tutorial);
  }
}
