import ISimulationEventListener from '@models/ISimulationEventListener';

export default interface IRenderer extends ISimulationEventListener {
  /**
   * Creates the renderer.
   */
  create(): void;

  /**
   * Permanently destroys the renderer (Unattaching it from the DOM, removing listeners, etc).
   */
  destroy(): void;
}
