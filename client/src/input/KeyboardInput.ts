import ControlSettings from '@models/ControlSettings';
import {
  CustomizableInputAction,
  HardCodedInputAction,
  InputActionListener,
} from '@models/InputAction';
import {
  defaultKeyRepeatInitialDelay,
  defaultKeyRepeatRate,
} from '@models/IUser';
import { ButtonPressState } from '@src/input/GamepadInput';

export default class KeyboardInput {
  private _controls: ControlSettings;
  private _fireAction: InputActionListener;
  private _customRepeatInitialDelay: number | undefined;
  private _customRepeatRate: number | undefined;
  private _useCustomDAS: boolean;
  private _destroyed: boolean;
  private _pressedKeys: {
    [key: string]: Omit<ButtonPressState, 'isPressing'> & {
      event: KeyboardEvent | undefined;
    };
  };

  constructor(
    fireAction: InputActionListener,
    controls: ControlSettings,
    customRepeatInitialDelay: number | undefined,
    customRepeatRate: number | undefined
  ) {
    this._destroyed = false;
    this._controls = controls;
    this._fireAction = fireAction;
    this._customRepeatInitialDelay = customRepeatInitialDelay;
    this._customRepeatRate = customRepeatRate;
    this._pressedKeys = {};
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    this._useCustomDAS =
      this._customRepeatInitialDelay !== undefined ||
      this._customRepeatRate !== undefined;
    if (this._useCustomDAS) {
      requestAnimationFrame(this._onAnimationFrame);
    }
  }
  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    this._destroyed = true;
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    this._onKeyDownInternal(event);
  };

  private _onKeyDownInternal(event: KeyboardEvent, isRepeat = false) {
    const now = Date.now();
    if (!this._pressedKeys[event.key] || !this._pressedKeys[event.key].event) {
      this._pressedKeys[event.key] = {
        hasRepeated: false,
        lastAction: now,
        event,
      };
    } else if (!isRepeat && this._useCustomDAS) {
      return; // cancel OS-defined repeat rate
    }

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
            !!this._pressedKeys[
              this._controls[CustomizableInputAction.MoveDown]
            ]?.event,
        },
      });
    }
    this._fireAction({ type: HardCodedInputAction.KeyDown, data: event });
  }

  private _onKeyUp = (event: KeyboardEvent) => {
    this._pressedKeys[event.key] = {
      hasRepeated: false,
      lastAction: 0,
      event: undefined,
    };
  };

  private _onAnimationFrame = () => {
    if (this._destroyed) {
      return;
    }
    requestAnimationFrame(this._onAnimationFrame);

    const now = Date.now();
    for (const pressState of Object.values(this._pressedKeys)) {
      if (pressState.event) {
        const delay = pressState.hasRepeated
          ? this._customRepeatRate ?? defaultKeyRepeatRate
          : this._customRepeatInitialDelay ?? defaultKeyRepeatInitialDelay;

        if (now - pressState.lastAction > delay) {
          this._onKeyDownInternal(pressState.event, true);
          pressState.hasRepeated = true;
          pressState.lastAction = now;
        }
      }
    }
  };
}
