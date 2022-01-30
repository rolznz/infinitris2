import ISimulationEventListener from '@models/ISimulationEventListener';
import ControlSettings from '@models/ControlSettings';
import ISimulation from '@models/ISimulation';
import { IRenderableEntity } from '@src/rendering/IRenderableEntity';

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

  get simulation(): ISimulation | undefined;
  get cellSize(): number;

  _renderCopies<T>(
    renderableEntity: IRenderableEntity<T>,
    opacity: number,
    renderFunction: (pixiObject: T, shadowIndexWithDirection: number) => void,
    createObject: () => T,
    shadowIndex: number,
    shadowDirection: number
  ): void;
}
