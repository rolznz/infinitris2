import { CustomizableInputAction } from './InputAction';
import { EnumDictionary } from './util/EnumDictionary';

type ControlSettings = EnumDictionary<CustomizableInputAction, string>;

export default ControlSettings;

export const DEFAULT_KEYBOARD_CONTROLS: ControlSettings = {
  [CustomizableInputAction.MoveLeft]: 'ArrowLeft',
  [CustomizableInputAction.MoveRight]: 'ArrowRight',
  [CustomizableInputAction.Drop]: ' ',
  [CustomizableInputAction.MoveDown]: 'ArrowDown',
  [CustomizableInputAction.RotateAnticlockwise]: 'z',
  [CustomizableInputAction.RotateClockwise]: 'x',
  [CustomizableInputAction.Chat]: 'Enter',
  [CustomizableInputAction.Esc]: 'Escape',
};
/*start: 'Enter',
  pause: 'p',*/
