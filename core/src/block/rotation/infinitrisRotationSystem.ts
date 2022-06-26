import { IRotationSystem, MovementAttempt } from '@models/IRotationSystem';
import Layout from '@models/Layout';

export class InfinitrisRotationSystem implements IRotationSystem {
  getAttempts(
    dx: number,
    dy: number,
    dr: number,
    rotateDown: boolean
  ): MovementAttempt[] {
    const verticalDirection = rotateDown ? 1 : -1;
    // TODO: review priority of attempt positions below
    const attempts: MovementAttempt[] = [
      { dx, dy, dr }, //0, 0
      { dx, dy: dy + verticalDirection, dr }, //0, 1
      { dx, dy: dy + verticalDirection * 2, dr }, // 0, 2
      { dx: dx + dr, dy: dy + verticalDirection, dr }, // 1, 1
      { dx: dx + dr, dy: dy + verticalDirection * 2, dr }, // 1, 2
      //{ dx: dx + dr * 2, dy, dr }, // 2, 0
      { dx: dx - dr, dy: dy + verticalDirection, dr }, // -1, 1
      { dx: dx - dr, dy: dy + verticalDirection * 2, dr }, // -1, 2
      { dx: dx + dr, dy, dr }, // 1, 0
      { dx: dx - dr, dy, dr }, // -1, 0
      //{ dx: dx - dr * 2, dy, dr }, // -2, 0

      //{ dx: dx + dr * 2, dy: dy + verticalDirection, dr }, // 2, 1
    ];

    //console.log('GetAttempts: ', dx, dy, dr, rotateDown, attempts);
    return attempts;
  }
}
