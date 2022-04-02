import { GameModeType } from '@models/GameModeType';
import { RoundLength } from '@models/RoundLength';

export type SimulationSettings = {
  readonly gravityEnabled?: boolean;
  readonly allowedBlockLayoutIds?: string[];
  readonly randomBlockPlacement?: boolean;
  readonly preventTowers?: boolean;
  readonly mistakeDetection?: boolean;
  readonly calculateSpawnDelays?: boolean;
  readonly gameModeType?: GameModeType;
  readonly maxSpawnDelaySeconds?: number;
  readonly spawnDelayScoreGraceAmount?: number;
  readonly roundLength?: RoundLength;
  readonly instantDrops?: boolean;
};
