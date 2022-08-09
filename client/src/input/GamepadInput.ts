import ControlSettings from '@models/ControlSettings';
import InputAction, {
  CustomizableInputAction,
  InputActionListener,
} from '@models/InputAction';
import {
  defaultKeyRepeatInitialDelay,
  defaultKeyRepeatRate,
} from '@models/IUser';

export type ButtonPressState = {
  lastAction: number;
  hasRepeated: boolean;
  isPressing: boolean;
};

export default class GamepadInput {
  private _controls: ControlSettings;
  private _controlEntries: [InputAction, string][];
  private _fireAction: InputActionListener;
  private _pressStates: ButtonPressState[];
  private _customRepeatInitialDelay: number;
  private _customRepeatRate: number;
  private _destroyed: boolean;

  constructor(
    fireAction: InputActionListener,
    controls: ControlSettings,
    customRepeatInitialDelay: number | undefined,
    customRepeatRate: number | undefined
  ) {
    this._destroyed = false;
    this._controls = controls;
    this._controlEntries = Object.entries(
      controls
    ) as typeof this._controlEntries;
    this._fireAction = fireAction;
    this._pressStates = [];
    requestAnimationFrame(this._onAnimationFrame);
    this._customRepeatInitialDelay =
      customRepeatInitialDelay || defaultKeyRepeatInitialDelay;
    this._customRepeatRate = customRepeatRate || defaultKeyRepeatRate;
  }

  get controls(): ControlSettings {
    return this._controls;
  }
  destroy() {
    this._destroyed = true;
  }

  private _onAnimationFrame = () => {
    if (this._destroyed) {
      return;
    }
    requestAnimationFrame(this._onAnimationFrame);
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads?.[0];
    if (!gamepad) {
      return;
    }
    for (let i = 0; i < this._controlEntries.length; i++) {
      if (i >= this._pressStates.length) {
        this._pressStates.push({
          hasRepeated: false,
          isPressing: false,
          lastAction: 0,
        });
      }
      const pressState = this._pressStates[i];
      const controlAction = this._controlEntries[i][0];
      const controlValue = this._controlEntries[i][1];
      // control format = button_{index} | axis_{index}_{approxValue}
      if (
        (controlValue.startsWith('button_') &&
          gamepad.buttons[parseInt(controlValue.split('_')[1])]?.pressed) ||
        (controlValue.startsWith('axis_') &&
          Math.abs(
            gamepad.axes[parseInt(controlValue.split('_')[1])] -
              parseFloat(controlValue.split('_')[2])
          ) < 0.1)
      ) {
        let fireAction = true;
        const delay = pressState.hasRepeated
          ? this._customRepeatRate
          : this._customRepeatInitialDelay;
        const time = Date.now();
        if (!pressState.isPressing) {
          pressState.isPressing = true;
          pressState.hasRepeated = false;
        } else if (time - pressState.lastAction > delay) {
          pressState.hasRepeated = true;
        } else {
          fireAction = false;
        }
        if (fireAction) {
          if (
            controlAction === CustomizableInputAction.RotateClockwise ||
            controlAction === CustomizableInputAction.RotateAnticlockwise
          ) {
            this._fireAction({
              type: controlAction,
              data: {
                rotateDown:
                  this._pressStates[
                    this._controlEntries.findIndex(
                      (entry) => entry[0] === CustomizableInputAction.MoveDown
                    )
                  ]?.isPressing,
              },
            });
          } else {
            this._fireAction({ type: controlAction });
          }
          pressState.lastAction = time;
        }
      } else {
        pressState.isPressing = false;
      }
    }
  };
}
