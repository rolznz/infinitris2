import ControllablePlayer from '../ControllablePlayer';
import Block from '@core/block/Block';
import Grid from '@core/grid/Grid';
import IControlSettings from './IControlSettings';
import Tutorial from 'models/src/Tutorial';
import Simulation from '@core/Simulation';
import InputAction from '../../../models/src/InputAction';

const DEFAULT_CONTROLS: IControlSettings = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  moveDown: 'ArrowDown',
  drop: 'ArrowUp',
  rotateClockwise: 'x',
  rotateAntiClockwise: 'z',
  start: 'Enter',
  pause: 'p',
};

export default class Input {
  _player: ControllablePlayer;
  _simulation: Simulation;
  _grid: Grid;
  _controls: IControlSettings;
  _tutorial?: Tutorial; // TODO: remove dependency on tutorial
  constructor(
    simulation: Simulation,
    player: ControllablePlayer,
    controls: IControlSettings = DEFAULT_CONTROLS,
    tutorial?: Tutorial
  ) {
    this._simulation = simulation;
    this._grid = simulation.grid;
    this._player = player;
    this._controls = controls;
    this._tutorial = tutorial;
    document.addEventListener('keydown', this._onKeyDown);
  }

  /**
   * Removes all input listeners.
   */
  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  private _isActionAllowed(action: InputAction) {
    return (
      !this._tutorial ||
      !this._tutorial.allowedActions ||
      this._tutorial.allowedActions.indexOf(action) >= 0
    );
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    if (this._tutorial && !this._simulation.isRunning) {
      this._simulation.startInterval();
    }

    const block: Block = this._player.block;
    if (block) {
      if (
        (this._isActionAllowed(InputAction.MoveLeft) &&
          event.key === this._controls.moveLeft) ||
        (this._isActionAllowed(InputAction.MoveRight) &&
          event.key === this._controls.moveRight)
      ) {
        block.move(
          this._grid.cells,
          event.key === this._controls.moveLeft ? -1 : 1,
          0,
          0
        );
      } else if (
        this._isActionAllowed(InputAction.MoveDown) &&
        event.key === this._controls.moveDown
      ) {
        block.move(this._grid.cells, 0, 1, 0);
      } else if (
        this._isActionAllowed(InputAction.Drop) &&
        event.key === this._controls.drop
      ) {
        block.drop();
      } else if (
        (this._isActionAllowed(InputAction.RotateAntiClockwise) &&
          event.key === this._controls.rotateAntiClockwise) ||
        (this._isActionAllowed(InputAction.RotateClockwise) &&
          event.key === this._controls.rotateClockwise)
      ) {
        block.move(
          this._grid.cells,
          0,
          0,
          event.key === this._controls.rotateClockwise ? 1 : -1
        );
      }
    }
  };
}
