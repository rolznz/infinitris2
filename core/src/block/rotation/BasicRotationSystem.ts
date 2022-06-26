import { IRotationSystem, MovementAttempt } from '@models/IRotationSystem';
import Layout from '@models/Layout';

export class BasicRotationSystem implements IRotationSystem {
  getAttempts(
    dx: number,
    dy: number,
    dr: number,
    _rotateDown: boolean
  ): MovementAttempt[] {
    return [{ dx, dy, dr }];
  }
}
