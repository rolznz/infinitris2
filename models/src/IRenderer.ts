import ISimulationEventListener from '@models/ISimulationEventListener';
import ControlSettings from '@models/ControlSettings';
import ISimulation from '@models/ISimulation';

export type ParticleType = 'classic' | 'capture';

export interface IRenderer extends Partial<ISimulationEventListener> {
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
}
