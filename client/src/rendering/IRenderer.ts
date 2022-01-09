import ISimulationEventListener from '@models/ISimulationEventListener';
import ControlSettings from '@models/ControlSettings';

export default interface IRenderer extends ISimulationEventListener {
  /**
   * Creates the renderer.
   */
  create(): void;

  /**
   * Permanently destroys the renderer (Unattaching it from the DOM, removing listeners, etc).
   */
  destroy(): void;

  rerenderGrid(): void;

  /**
   * Helper controls to render on the screen
   */
  virtualKeyboardControls?: ControlSettings;
}
