export type SimulationSettings = {
  readonly gravityEnabled?: boolean;
  readonly allowedBlockLayoutIds?: string[];
  readonly randomBlockPlacement?: boolean;
  readonly dayLength?: number;
  readonly preventTowers?: boolean;
};