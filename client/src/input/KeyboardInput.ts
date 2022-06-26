import ControlSettings from '@models/ControlSettings';
import {
  CustomizableInputAction,
  HardCodedInputAction,
  InputActionListener,
} from '@models/InputAction';

let pressedKeys: { [key: string]: boolean };
export default class KeyboardInput {
  private _controls: ControlSettings;
  private _fireAction: InputActionListener;

  constructor(fireAction: InputActionListener, controls: ControlSettings) {
    this._controls = controls;
    this._fireAction = fireAction;
    pressedKeys = {};
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
  }
  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    pressedKeys[event.key] = true;
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
      this._fireAction({
        type: action,
        data: {
          rotateDown:
            pressedKeys[this._controls[CustomizableInputAction.MoveDown]],
        },
      });
    }
    this._fireAction({ type: HardCodedInputAction.KeyDown, data: event });
  };

  private _onKeyUp = (event: KeyboardEvent) => {
    pressedKeys[event.key] = false;
  };
}
