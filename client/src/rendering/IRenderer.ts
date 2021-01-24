import ISimulationEventListener from '@models/ISimulationEventListener';
import ControlSettings from '@models/ControlSettings';
import { InputAction } from 'models';

export default interface IRenderer extends ISimulationEventListener {
  /**
   * Creates the renderer.
   */
  create(): void;

  /**
   * Permanently destroys the renderer (Unattaching it from the DOM, removing listeners, etc).
   */
  destroy(): void;

  /**
   * Helper controls to render on the screen
   */
  virtualKeyboardControls?: ControlSettings;

  /**
   * Used to render which actions are currently allowed on the virtual keyboard
   */
  allowedActions?: InputAction[];
}
