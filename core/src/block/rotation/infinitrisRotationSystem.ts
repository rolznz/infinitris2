import { IRotationSystem, MovementAttempt } from '@models/IRotationSystem';
import Layout from '@models/Layout';

export class InfinitrisRotationSystem implements IRotationSystem {
  getAttempts(
    _layout: Layout,
    dx: number,
    dy: number,
    dr: number
  ): MovementAttempt[] {
    // TODO: 2 modes based on if dy=1 (down + rotate)
    return [
      { dx, dy, dr },
      { dx: dx + dr, dy, dr },
      { dx: dx, dy: dy + 1, dr },
      { dx: dx, dy: dy - 1, dr },
      { dx: dx + dr, dy: dy + 1, dr },
      { dx: dx + dr, dy: dy - 1, dr },
      { dx: dx + dr, dy: dy + 2, dr },
      { dx: dx + dr, dy: dy - 2, dr },
      { dx: dx + dr * 2, dy: dy + 1, dr },
      { dx: dx + dr * 2, dy: dy - 1, dr },
      { dx: dx + dr * 2, dy: dy + 2, dr },
      { dx: dx + dr * 2, dy: dy - 2, dr },
    ];
  }
}
