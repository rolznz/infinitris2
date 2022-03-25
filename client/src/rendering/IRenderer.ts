import ISimulationEventListener from '@models/ISimulationEventListener';
import ControlSettings from '@models/ControlSettings';
import ISimulation from '@models/ISimulation';
import { IRenderableEntity } from '@src/rendering/IRenderableEntity';

export type ParticleType = 'classic' | 'capture';

export default interface IRenderer extends Partial<ISimulationEventListener> {
  /**
   * Creates the renderer.
   */
  create(): void;

  /**
   * Permanently destroys the renderer (Unattaching it from the DOM, removing listeners, etc).
   */
  destroy(): void;

  rerenderGrid(): void;

  emitParticle(x: number, y: number, color: number, type: ParticleType): void;

  /**
   * Helper controls to render on the screen
   */
  virtualKeyboardControls?: ControlSettings;

  get simulation(): ISimulation | undefined;
  get cellSize(): number;

  renderCopies<T>(
    renderableEntity: IRenderableEntity<T>,
    opacity: number,
    renderFunction: (pixiObject: T, shadowIndexWithDirection: number) => void,
    createObject: () => T,
    shadowIndex: number,
    shadowDirection: number
  ): void;
}
