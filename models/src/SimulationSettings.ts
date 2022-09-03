import { GameModeType } from '@models/GameModeType';
import { RotationSystem } from '@models/IRotationSystem';
import { RoundLength } from '@models/RoundLength';

export type ConquestGameModeSettings = {
  hasRounds?: boolean;
  hasConversions?: boolean;
};

export type InfinityGameModeSettings = {};
export type RaceGameModeSettings = {
  knockoutPointDifference?: number;
};

export type GameModeSettings = ConquestGameModeSettings &
  RaceGameModeSettings &
  InfinityGameModeSettings;

export type SimulationSettings = {
  readonly gravityEnabled?: boolean;
  readonly allowedBlockLayoutIds?: string[];
  readonly randomBlockPlacement?: boolean;
  readonly preventTowers?: boolean;
  readonly mistakeDetection?: boolean;
  readonly calculateSpawnDelays?: boolean;
  readonly gameModeType?: GameModeType;
  readonly gameModeSettings?: GameModeSettings;
  readonly saveSpawnPositionOnDeath?: boolean;
  readonly maxSpawnDelaySeconds?: number;
  readonly spawnDelayScoreGraceAmount?: number;
  readonly spawnDelayMaxScore?: number;
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
  readonly allowSpawnOnOtherBlocks?: boolean; // if false, cannot spawn your block if someone else's block is in the way
  readonly replaceUnplayableBlocks?: boolean;
  readonly forgivingPlacementTime?: number; // allows blocks from multiple players to be placed in the same position
};
