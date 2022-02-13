import * as PIXI from 'pixi.js-legacy';

export type IRenderableEntityChild<T> = {
  shadowIndex: number;
  renderableObject: T;
};

export interface IRenderableEntity<T> {
  // stores all the pixi objects - main render + all shadows
  container: PIXI.Container;

  // a child will be rendered 1 time on wrapped grids, N times for shadow wrapping (grid width < screen width)
  children: IRenderableEntityChild<T>[];
}
