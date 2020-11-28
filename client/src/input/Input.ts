import ControllablePlayer from '../ControllablePlayer';
import Block from '@core/block/Block';
import Grid from '@core/grid/Grid';
import IControlSettings from './IControlSettings';

const DEFAULT_CONTROLS: IControlSettings = {
  moveLeft: 37,
  moveRight: 39,
  moveDown: 40,
  drop: 38,
  rotateClockwise: 88,
  rotateAnticlockwise: 90,
};

export default class Input {
  _player: ControllablePlayer;
  _grid: Grid;
  _controls: IControlSettings;
  constructor(
    grid: Grid,
    player: ControllablePlayer,
    controls: IControlSettings = DEFAULT_CONTROLS
  ) {
    this._grid = grid;
    this._player = player;
    this._controls = controls;
    document.addEventListener('keydown', this._onKeyDown);
  }

  /**
   * Removes all input listeners.
   */
  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    const block: Block = this._player.block;
    if (block) {
      if (
        event.which === this._controls.moveLeft ||
        event.which === this._controls.moveRight
      ) {
        block.move(
          this._grid.cells,
          event.which === this._controls.moveLeft ? -1 : 1,
          0,
          0
        );
      } else if (event.which === this._controls.moveDown) {
        block.move(this._grid.cells, 0, 1, 0);
      } else if (event.which === this._controls.drop) {
        block.drop();
      } else if (
        [
          this._controls.rotateClockwise,
          this._controls.rotateAnticlockwise,
        ].indexOf(event.which) >= 0
      ) {
        block.move(
          this._grid.cells,
          0,
          0,
          event.which === this._controls.rotateClockwise ? 1 : -1
        );
      }
    }
  };
}
