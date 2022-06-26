import Layout from '@models/Layout';

export interface IRotationSystem {
  getAttempts(
    dx: number,
    dy: number,
    dr: number,
    rotateDown: boolean
  ): MovementAttempt[];
}

export type RotationSystem = 'infinitris' | 'basic';

export type MovementAttempt = { dx: number; dy: number; dr: number };
