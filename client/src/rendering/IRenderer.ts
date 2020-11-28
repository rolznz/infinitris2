import ISimulationEventListener from '@core/ISimulationEventListener';

export default interface IRenderer extends ISimulationEventListener {
  /**
   * Creates the renderer.
   */
  create();

  /**
   * Permanently destroys the renderer (Unattaching it from the DOM, removing listeners, etc).
   */
  destroy();
}
