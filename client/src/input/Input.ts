import ControllablePlayer from '../ControllablePlayer';
import Grid from '@core/grid/Grid';
import Simulation from '@core/Simulation';
import ControlSettings from './ControlSettings';
import InputAction from '@models/InputAction';
import IBlock from '@models/IBlock';

const DEFAULT_CONTROLS: ControlSettings = new Map<InputAction, string>([
  [InputAction.MoveLeft, 'ArrowLeft'],
  [InputAction.MoveRight, 'ArrowRight'],
  [InputAction.Drop, 'ArrowUp'],
  [InputAction.MoveDown, 'ArrowDown'],
  [InputAction.RotateAntiClockwise, 'z'],
  [InputAction.RotateClockwise, 'x'],
  [InputAction.MoveLeft, 'ArrowLeft'],
]);
/*start: 'Enter',
  pause: 'p',*/

type ActionListener = (action: InputAction) => void;

export default class Input {
  private _player: ControllablePlayer;
  private _simulation: Simulation;
  private _grid: Grid;
  private _controls: ControlSettings;
  private _allowedActions?: InputAction[];
  private _actionListeners: ActionListener[];

  constructor(
    simulation: Simulation,
    player: ControllablePlayer,
    controls: ControlSettings = DEFAULT_CONTROLS
  ) {
    this._simulation = simulation;
    this._grid = simulation.grid;
    this._player = player;
    this._controls = controls;
    this._actionListeners = [];
    document.addEventListener('keydown', this._onKeyDown);
  }

  set allowedActions(allowedActions: InputAction[] | undefined) {
    this._allowedActions = allowedActions;
  }

  get controls(): ControlSettings {
    return this._controls;
  }

  addListener(listener: ActionListener) {
    this._actionListeners.push(listener);
  }

  /**
   * Removes all input listeners.
   */
  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  private _isActionAllowed(action: InputAction) {
    return !this._allowedActions || this._allowedActions.indexOf(action) >= 0;
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    if (!this._simulation.isRunning) {
      return;
    }

    const block: IBlock | undefined = this._player.block;
    if (block) {
      if (
        (this._isActionAllowed(InputAction.MoveLeft) &&
          event.key === this._controls.get(InputAction.MoveLeft)) ||
        (this._isActionAllowed(InputAction.MoveRight) &&
          event.key === this._controls.get(InputAction.MoveRight))
      ) {
        const action =
          event.key === this._controls.get(InputAction.MoveLeft)
            ? InputAction.MoveLeft
            : InputAction.MoveRight;
        this._fireAction(action);
        block.move(
          this._grid.cells,
          action === InputAction.MoveLeft ? -1 : 1,
          0,
          0
        );
      } else if (
        this._isActionAllowed(InputAction.MoveDown) &&
        event.key === this._controls.get(InputAction.MoveDown)
      ) {
        this._fireAction(InputAction.MoveDown);
        block.move(this._grid.cells, 0, 1, 0);
      } else if (
        this._isActionAllowed(InputAction.Drop) &&
        event.key === this._controls.get(InputAction.Drop)
      ) {
        this._fireAction(InputAction.Drop);
        block.drop();
      } else if (
        (this._isActionAllowed(InputAction.RotateAntiClockwise) &&
          event.key === this._controls.get(InputAction.RotateAntiClockwise)) ||
        (this._isActionAllowed(InputAction.RotateClockwise) &&
          event.key === this._controls.get(InputAction.RotateClockwise))
      ) {
        const action =
          event.key === this._controls.get(InputAction.RotateAntiClockwise)
            ? InputAction.RotateAntiClockwise
            : InputAction.RotateClockwise;
        this._fireAction(action);
        block.move(
          this._grid.cells,
          0,
          0,
          action === InputAction.RotateClockwise ? 1 : -1
        );
      }
    }
  };

  private _fireAction(action: InputAction) {
    this._actionListeners.forEach((listener) => listener(action));
  }
}
