import ControlSettings from '@models/ControlSettings';
import {
  CustomizableInputAction,
  HardCodedInputAction,
} from '@models/InputAction';
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
    if (event.key === this._controls[CustomizableInputAction.Esc]) {
      this._fireAction({ type: CustomizableInputAction.Esc });
    } else if (event.key === this._controls[CustomizableInputAction.Chat]) {
      this._fireAction({ type: CustomizableInputAction.Chat });
    } else if (
      event.key === this._controls[CustomizableInputAction.MoveLeft] ||
      event.key === this._controls[CustomizableInputAction.MoveRight]
    ) {
      const action =
        event.key === this._controls[CustomizableInputAction.MoveLeft]
          ? CustomizableInputAction.MoveLeft
          : CustomizableInputAction.MoveRight;
      this._fireAction({ type: action });
    } else if (event.key === this._controls[CustomizableInputAction.MoveDown]) {
      this._fireAction({ type: CustomizableInputAction.MoveDown });
    } else if (event.key === this._controls[CustomizableInputAction.Drop]) {
      this._fireAction({ type: CustomizableInputAction.Drop });
    } else if (
      event.key ===
        this._controls[CustomizableInputAction.RotateAnticlockwise] ||
      event.key === this._controls[CustomizableInputAction.RotateClockwise]
    ) {
      const action =
        event.key ===
        this._controls[CustomizableInputAction.RotateAnticlockwise]
          ? CustomizableInputAction.RotateAnticlockwise
          : CustomizableInputAction.RotateClockwise;
      this._fireAction({ type: action });
    }
    this._fireAction({ type: HardCodedInputAction.KeyDown, data: event });
  };
}
