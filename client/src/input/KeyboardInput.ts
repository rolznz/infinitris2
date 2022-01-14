import ControlSettings from '@models/ControlSettings';
import InputAction from '@models/InputAction';
import { ActionListener } from './Input';

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
    if (event.key === this._controls[InputAction.Esc]) {
      this._fireAction(InputAction.Esc);
    } else if (event.key === this._controls[InputAction.Chat]) {
      this._fireAction(InputAction.Chat);
    } else if (
      event.key === this._controls[InputAction.MoveLeft] ||
      event.key === this._controls[InputAction.MoveRight]
    ) {
      const action =
        event.key === this._controls[InputAction.MoveLeft]
          ? InputAction.MoveLeft
          : InputAction.MoveRight;
      this._fireAction(action);
    } else if (event.key === this._controls[InputAction.MoveDown]) {
      this._fireAction(InputAction.MoveDown);
    } else if (event.key === this._controls[InputAction.Drop]) {
      this._fireAction(InputAction.Drop);
    } else if (
      event.key === this._controls[InputAction.RotateAnticlockwise] ||
      event.key === this._controls[InputAction.RotateClockwise]
    ) {
      const action =
        event.key === this._controls[InputAction.RotateAnticlockwise]
          ? InputAction.RotateAnticlockwise
          : InputAction.RotateClockwise;
      this._fireAction(action);
    }
  };
}
