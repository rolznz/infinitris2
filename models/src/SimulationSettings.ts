import { GameModeType } from '@models/GameModeType';
import { RotationSystem } from '@models/IRotationSystem';
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
  readonly layoutSetId?: string; // TODO: add better typings - should be one of blockLayoutSets[x].id
  readonly rotationSystem?: RotationSystem;
  readonly botSettings?: {
    numBots?: number;
    botReactionDelay?: number;
    botRandomReactionDelay?: number;
    seed?: number;
  };
};
