import InputAction from '@models/InputAction';
import ControlSettings from './ControlSettings';
import { ActionListener } from './Input';

export const DEFAULT_CONTROLS: ControlSettings = new Map<InputAction, string>([
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

export default class KeyboardInput {
  private _controls: ControlSettings;
  private _fireAction: ActionListener;

  constructor(fireAction: ActionListener, controls: ControlSettings) {
    this._controls = controls;
    this._fireAction = fireAction;
    document.addEventListener('keydown', this._onKeyDown);
  }
  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    if (
      event.key === this._controls.get(InputAction.MoveLeft) ||
      event.key === this._controls.get(InputAction.MoveRight)
    ) {
      const action =
        event.key === this._controls.get(InputAction.MoveLeft)
          ? InputAction.MoveLeft
          : InputAction.MoveRight;
      this._fireAction(action);
    } else if (event.key === this._controls.get(InputAction.MoveDown)) {
      this._fireAction(InputAction.MoveDown);
    } else if (event.key === this._controls.get(InputAction.Drop)) {
      this._fireAction(InputAction.Drop);
    } else if (
      event.key === this._controls.get(InputAction.RotateAntiClockwise) ||
      event.key === this._controls.get(InputAction.RotateClockwise)
    ) {
      const action =
        event.key === this._controls.get(InputAction.RotateAntiClockwise)
          ? InputAction.RotateAntiClockwise
          : InputAction.RotateClockwise;
      this._fireAction(action);
    }
  };
}
