import { IRotationSystem, MovementAttempt } from '@models/IRotationSystem';
import Layout from '@models/Layout';

export class BasicRotationSystem implements IRotationSystem {
  getAttempts(
    _layout: Layout,
    dx: number,
    dy: number,
    dr: number
  ): MovementAttempt[] {
    return [{ dx, dy, dr }];
  }
}
