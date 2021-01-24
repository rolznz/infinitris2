import InputAction from './InputAction';
import { EnumDictionary } from './util/EnumDictionary';

type ControlSettings = EnumDictionary<InputAction, string>;

export default ControlSettings;

export const DEFAULT_KEYBOARD_CONTROLS: ControlSettings = {
  [InputAction.MoveLeft]: 'ArrowLeft',
  [InputAction.MoveRight]: 'ArrowRight',
  [InputAction.Drop]: ' ',
  [InputAction.MoveDown]: 'ArrowDown',
  [InputAction.RotateAnticlockwise]: 'z',
  [InputAction.RotateClockwise]: 'x',
};
/*start: 'Enter',
  pause: 'p',*/
