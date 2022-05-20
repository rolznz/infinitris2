import ControlSettings from '@models/ControlSettings';
import InputAction, { InputActionListener } from '@models/InputAction';

// TODO: make these customisable
const repeatDelay = 500; //ms
const repeatRate = 40;

type ButtonPressState = {
  lastAction: number;
  hasRepeated: boolean;
  isPressing: boolean;
};

export default class GamepadInput {
  private _controls: ControlSettings;
  private _controlEntries: [InputAction, string][];
  private _fireAction: InputActionListener;
  private _pressStates: ButtonPressState[];

  constructor(fireAction: InputActionListener, controls: ControlSettings) {
    this._controls = controls;
    this._controlEntries = Object.entries(
      controls
    ) as typeof this._controlEntries;
    this._fireAction = fireAction;
    this._pressStates = [];
    requestAnimationFrame(this._onAnimationFrame);
  }

  get controls(): ControlSettings {
    return this._controls;
  }
  destroy() {}

  private _onAnimationFrame = () => {
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
        let delay = pressState.hasRepeated ? repeatRate : repeatDelay;
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
          this._fireAction({ type: controlAction });
          pressState.lastAction = time;
        }
      } else {
        pressState.isPressing = false;
      }
    }
  };
}
