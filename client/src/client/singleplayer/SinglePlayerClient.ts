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
    /*if (this._tutorial) {
      this._simulation.stopInterval();
      this._input.destroy();

      // FIXME: on block placed, check if line clear was triggered?
      // line clear should be delayed, 1 s + colors changing
      const success = this._simulation.getPlayer(block.playerId).score > 0;
      //this._listeners.
    }*/
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

    let filledLocations: boolean[][] = null;
    if (tutorial) {
      if (tutorial.grid) {
        filledLocations = tutorial.grid
          .split('\n')
          .map((row) => row.trim())
          .filter((row) => row)
          .map((row) => row.split('').map((c) => c === 'X'));
        if (
          filledLocations.find((r) => r.length !== filledLocations[0].length)
        ) {
          throw new Error('Invalid tutorial grid: ' + tutorial.title);
        }
      }
    }

    const grid = new Grid(
      filledLocations ? filledLocations[0].length : undefined,
      filledLocations ? filledLocations.length : undefined
    );
    if (tutorial) {
      if (filledLocations) {
        for (let r = 0; r < grid.cells.length; r++) {
          for (let c = 0; c < grid.cells[0].length; c++) {
            grid.cells[r][c].opacity = filledLocations[r][c] ? 1 : 0;
          }
        }
      }
    }

    this._simulation = new Simulation(grid);
    this._simulation.addEventListener(this, this._renderer);

    this._simulation.init();
    const playerId = 0;
    const player = new ControllablePlayer(playerId, this._simulation);
    this._simulation.addPlayer(player);
    this._simulation.followPlayer(player);
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
