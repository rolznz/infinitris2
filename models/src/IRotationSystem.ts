import Layout from '@models/Layout';

export interface IRotationSystem {
  getAttempts(
    layout: Layout,
    dx: number,
    dy: number,
    dr: number
  ): MovementAttempt[];
}

export type RotationSystem = 'infinitris' | 'basic';

export type MovementAttempt = { dx: number; dy: number; dr: number };
