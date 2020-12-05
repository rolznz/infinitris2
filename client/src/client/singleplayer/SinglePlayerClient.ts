import Simulation from '@core/Simulation';
import IRenderer from '@src/rendering/IRenderer';
import MinimalRenderer from '@src/rendering/renderers/minimal/MinimalRenderer';
import ControllablePlayer from '@src/ControllablePlayer';
import Grid from '@core/grid/Grid';
import Input from '@src/input/Input';
import IClient from '../Client';
import Tutorial from '../../../../models/src/Tutorial';
import ISimulationEventListener from '@core/ISimulationEventListener';
import Block from '@core/block/Block';

export default class SinglePlayerClient
  implements IClient, ISimulationEventListener {
  private _renderer: IRenderer;
  private _simulation: Simulation;
  private _tutorial: Tutorial;
  private _input: Input;
  constructor(tutorial?: Tutorial) {
    this._create(tutorial);
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
  onBlockPlaced(block: Block) {
    if (this._tutorial) {
      this._simulation.stopInterval();
    }
  }
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
  }

  private async _create(tutorial?: Tutorial) {
    this._tutorial = tutorial;
    this._renderer = new MinimalRenderer(this._tutorial);
    await this._renderer.create();
    const grid = new Grid(tutorial?.gridWidth, tutorial?.gridHeight);
    if (tutorial) {
      tutorial.filledRows?.forEach((r) => {
        for (let c = 0; c < grid.cells[0].length; c++) {
          grid.cells[r][c].opacity = 1;
        }
      });

      tutorial.filledCellLocations?.forEach((location) => {
        grid.cells[location.row][location.col].opacity = 1;
      });
    }

    this._simulation = new Simulation(grid);
    this._simulation.addEventListener(this, this._renderer);

    this._simulation.init();
    const playerId = 0;
    const player = new ControllablePlayer(playerId, this._simulation);
    this._simulation.addPlayer(player);
    if (tutorial) {
      player.nextLayout = tutorial.layout;
      player.nextLayoutRotation = tutorial.layoutRotation;
      this._simulation.step();
    } else {
      this._simulation.startInterval();
    }
    this._input = new Input(this._simulation, player, undefined, tutorial);
  }
}
