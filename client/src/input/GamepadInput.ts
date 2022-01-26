import ControlSettings from '@models/ControlSettings';
import InputAction from '@models/InputAction';
import { ActionListener } from './Input';

// TODO: make these customisable
const repeatDelay = 500; //ms
const repeatRate = 50;

export default class GamepadInput {
  private _controls: ControlSettings;
  private _fireAction: ActionListener;
  private _lastAction: number;
  private _hasRepeated: boolean;
  private _isPressing: boolean;

  constructor(fireAction: ActionListener, controls: ControlSettings) {
    this._controls = controls;
    this._fireAction = fireAction;
    this._lastAction = 0;
    this._hasRepeated = false;
    this._isPressing = false;
    requestAnimationFrame(this._onAnimationFrame);
  }
  destroy() {}

  private _onAnimationFrame = () => {
    requestAnimationFrame(this._onAnimationFrame);
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads?.[0];
    if (!gamepad) {
      return;
    }
    let didPress = false;
    for (let controlEntry of Object.entries(this._controls)) {
      const controlValue = controlEntry[1];
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
        didPress = true;
        let fireAction = true;
        let delay = this._hasRepeated ? repeatRate : repeatDelay;
        const time = Date.now();
        if (!this._isPressing) {
          this._isPressing = true;
          this._hasRepeated = false;
        } else if (time - this._lastAction > delay) {
          this._hasRepeated = true;
        } else {
          fireAction = false;
        }
        if (fireAction) {
          this._fireAction(controlEntry[0] as InputAction);
          this._lastAction = time;
        }
      }
    }
    if (!didPress) {
      this._isPressing = false;
    }
  };
}
